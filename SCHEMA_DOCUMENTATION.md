# ATS Schema Architecture & Relationships

## Overview
This document outlines the database schema architecture, entity relationships, and data hierarchy for the ATS (Applicant Tracking System).

## Core Principles
1. **Separate Collections**: Each entity has its own database collection
2. **Reference by ID**: Relationships are established through ID references
3. **Bidirectional References**: Parent stores child IDs, child stores parent ID
4. **Calculated Statistics**: Statistics are computed from related data, not duplicated

---

## Entity Hierarchy

```
Application (Independent - Initial submission)
     │
     │ (After approval & job assignment)
     ↓
Client (Company)
  └── Job (Position/Opening)
      └── Candidate (Person - Approved & Assigned)
          └── Email (Communication per Job)
```

**Flow**: Application (independent) → Review & Approve → Assign to Job → Becomes Candidate under Job → Job under Client

---

## Database Collections

### 1. User Collection (NEW)
**Purpose**: Stores user authentication and profile information

**Key Fields**:
- `id`: Unique identifier
- `email`: User email (unique)
- `firstName`, `lastName`: Name
- `role`: TeamRole (admin, recruiter, etc.)
- `status`: "active" | "inactive" | "suspended" | "pending"
- `emailVerified`: boolean
- `lastLoginAt`: Last login timestamp
- `preferences`: User preferences object

**Relationships**:
- **Referenced By** TeamMember: TeamMember.userId references User.id
- **Referenced By** Activity Logs: performedBy, createdBy, etc.

**Collection Name**: `users`

---

### 2. Client Collection
**Purpose**: Stores company/client information

**Key Fields**:
- `id`: Unique identifier
- `companyName`: Company name
- `email`, `phone`, `website`: Contact information
- `jobIds`: Array of Job IDs (references to Job collection)
- `contacts`: Array of contact persons
- `statistics`: Calculated statistics from related jobs

**Relationships**:
- **Has Many** Jobs: `jobIds: string[]`
- Jobs are stored in separate Job collection
- Query: `db.jobs.find({ clientId: client.id })`

**Collection Name**: `clients`

---

### 3. Job Collection
**Purpose**: Stores job/position information

**Key Fields**:
- `id`: Unique identifier
- `title`: Job title
- `clientId`: Reference to Client (parent)
- `candidateIds`: Array of Candidate IDs who applied
- `applicationIds`: Array of Application IDs
- `recruiterIds`: Array of User/TeamMember IDs
- `categoryIds`, `tagIds`: Classification references
- `statistics`: Calculated from applications/candidates

**Relationships**:
- **Belongs To** Client: `clientId: string`
- **Has Many** Candidates: `candidateIds: string[]`
- **Has Many** Applications: `applicationIds: string[]`
- **Has Many** Emails: Query by `jobId` in Email collection
- Query candidates: `db.candidates.find({ jobIds: { $in: [job.id] } })`
- Query emails: `db.emails.find({ jobId: job.id })`

**Collection Name**: `jobs`

---

### 3. Candidate Collection
**Purpose**: Stores candidate/person information - ONLY created from approved applications assigned to a job

**Key Fields**:
- `id`: Unique identifier
- `firstName`, `lastName`, `email`: Personal info
- `jobIds`: MANDATORY - Array of Job IDs (at least one) - candidate MUST be assigned to job(s)
- `applicationIds`: Array of original Application IDs
- `clientIds`: Array of Client IDs (derived from jobs)
- `jobApplications`: Array of `CandidatePipeline` objects with per-job status (at least one)
  - Each has `jobId`: MANDATORY - reference to job
  - Each has `applicationId`: Optional - reference to original application
  - Each has `emailIds`: Array of Email IDs for that specific job
  - `emailsSent`, `emailsReceived`: Count per job
  - `lastEmailDate`: Last email for that job
- `totalEmailsSent`, `totalEmailsReceived`: Across all jobs

**Important**:
- Candidates are created ONLY from approved applications
- Every candidate MUST be assigned to at least one job
- Candidates cannot exist without a job assignment
- `jobIds` array must have at least one entry
- `jobApplications` array must have at least one entry

**Relationships**:
- **MANDATORY Belongs To Many** Jobs: `jobIds: string[]` (at least one)
- **Belongs To Many** Clients: `clientIds: string[]` (derived from jobs)
- **References** Applications: `applicationIds: string[]` (original application if created from one)
- **Has Many** Emails: Query by `candidateId` in Email collection
- Query emails for specific job: `db.emails.find({ candidateId: candidate.id, jobId: job.id })`

**Collection Name**: `candidates`

---

### 4. Application Collection
**Purpose**: Stores INITIAL job applications BEFORE approval and job assignment

**Key Fields**:
- `id`: Unique identifier
- `firstName`, `lastName`, `email`: Applicant info
- `status`: "pending" | "under_review" | "approved" | "rejected" | "withdrawn"
- `targetJobId`: OPTIONAL - Job they're applying for (can be from email subject)
- `targetClientId`: OPTIONAL - Client they're applying to
- `assignedJobId`: Job assigned to after approval
- `candidateId`: Created candidate ID after approval
- `resume`, `coverLetter`: Documents
- `submittedAt`, `reviewedAt`, `approvedAt`: Timestamps

**Important**:
- Applications are INDEPENDENT - not under any job or client initially
- `targetJobId` is OPTIONAL - can be captured from email subject or form
- After approval, application is assigned to a job and candidate is created
- Once approved, `assignedJobId` and `candidateId` are set

**Relationships**:
- **Independent initially** - no parent relationship
- **Optionally References** Job: `targetJobId?: string` (helpful for routing)
- **After Approval** Creates Candidate: `candidateId?: string`
- **After Approval** Assigned to Job: `assignedJobId?: string`

**Collection Name**: `applications`

---

### 5. Email Collection
**Purpose**: Stores email communications between recruiters and candidates for specific jobs

**Key Fields**:
- `id`: Unique identifier
- `candidateId`: Reference to Candidate (required)
- `jobId`: Reference to Job (required)
- `clientId`: Reference to Client (optional, can be derived from job)
- `direction`: "inbound" | "outbound"
- `type`: Email type (interview, offer, rejection, etc.)
- `status`: Email status (sent, delivered, opened, etc.)
- `subject`, `body`: Email content
- `from`, `to`, `cc`, `bcc`: Recipients
- `threadId`: For grouping related emails
- `parentEmailId`: For reply chains
- `sentAt`, `deliveredAt`, `openedAt`: Tracking timestamps
- `attachments`: Array of attachments
- `isRead`, `isStarred`, `isArchived`: Flags

**Relationships**:
- **Belongs To** Candidate: `candidateId: string`
- **Belongs To** Job: `jobId: string`
- **Belongs To** Client: `clientId: string` (optional)
- **Belongs To** Email (parent): `parentEmailId: string` (for replies)
- Query thread: `db.emails.find({ threadId: email.threadId })`
- Query candidate-job emails: `db.emails.find({ candidateId: X, jobId: Y })`

**Collection Name**: `emails`

---

## Data Flow & Query Examples

### 0. Application Flow (Initial Submission → Candidate)

**Get all pending applications:**
```typescript
const applications = await db.applications.find({ 
  status: "pending" 
}).sort({ submittedAt: -1 });
```

**Get applications with target job (from email subject):**
```typescript
const applications = await db.applications.find({ 
  targetJobId: { $exists: true, $ne: null } 
});
```

**Approve application and create candidate:**
```typescript
// 1. Update application
await db.applications.updateOne(
  { id: applicationId },
  { 
    status: "approved",
    assignedJobId: jobId,
    approvedBy: userId,
    approvedAt: new Date()
  }
);

// 2. Create candidate from application
const candidate = await db.candidates.create({
  ...applicationData,
  jobIds: [jobId],
  jobApplications: [{
    jobId: jobId,
    applicationId: applicationId,
    status: "new",
    appliedAt: new Date(),
    emailIds: [],
    emailsSent: 0,
    emailsReceived: 0
  }],
  applicationIds: [applicationId]
});

// 3. Update application with candidate ID
await db.applications.updateOne(
  { id: applicationId },
  { candidateId: candidate.id }
);

// 4. Add candidate to job
await db.jobs.updateOne(
  { id: jobId },
  { $push: { candidateIds: candidate.id } }
);
```

### 1. Client → Jobs → Candidates → Emails

**Get all jobs for a client:**
```typescript
const jobs = await db.jobs.find({ clientId: clientId });
```

**Get all candidates for a job:**
```typescript
const candidates = await db.candidates.find({ 
  jobIds: { $in: [jobId] } 
});
```

**Get all emails for a candidate-job pair:**
```typescript
const emails = await db.emails.find({ 
  candidateId: candidateId,
  jobId: jobId 
}).sort({ sentAt: -1 });
```

**Get email statistics for a candidate on a specific job:**
```typescript
const candidate = await db.candidates.findById(candidateId);
const jobApplication = candidate.jobApplications.find(
  app => app.jobId === jobId
);
// Access: jobApplication.emailIds, jobApplication.emailsSent, etc.
```

### 2. Candidate → All Emails Across Jobs

**Get all emails for a candidate (all jobs):**
```typescript
const emails = await db.emails.find({ 
  candidateId: candidateId 
}).sort({ sentAt: -1 });
```

**Get email count per job for a candidate:**
```typescript
const candidate = await db.candidates.findById(candidateId);
candidate.jobApplications.forEach(app => {
  console.log(`Job ${app.jobId}: ${app.emailsSent} sent, ${app.emailsReceived} received`);
});
```

### 3. Job → All Emails

**Get all emails for a job (all candidates):**
```typescript
const emails = await db.emails.find({ 
  jobId: jobId 
}).sort({ sentAt: -1 });
```

### 4. Client → All Communications

**Get all emails for a client (all jobs, all candidates):**
```typescript
// Get all jobs for client
const jobs = await db.jobs.find({ clientId: clientId });
const jobIds = jobs.map(j => j.id);

// Get all emails for these jobs
const emails = await db.emails.find({ 
  jobId: { $in: jobIds } 
}).sort({ sentAt: -1 });
```

---

## Data Consistency Rules

### When Receiving New Application:
1. Create application in `applications` collection with status "pending"
2. Optionally set `targetJobId` if captured from email subject or form
3. Application is independent - no updates to other collections yet

### When Creating a Job:
1. Create job in `jobs` collection
2. Add job.id to client.jobIds array in `clients` collection
3. Update client.statistics

### When Approving Application and Creating Candidate:
1. Update application status to "approved"
2. Set application.assignedJobId (job being assigned to)
3. Create candidate in `candidates` collection
4. Set candidate.jobIds = [assignedJobId]
5. Set candidate.applicationIds = [applicationId]
6. Add CandidatePipeline entry to candidate.jobApplications with:
   - jobId = assignedJobId
   - applicationId = applicationId
   - emailIds = []
   - emailsSent = 0, emailsReceived = 0
7. Add candidate.id to job.candidateIds
8. Set application.candidateId = candidate.id
9. Update job.statistics and client.statistics

### When Candidate Applies to Additional Job:
1. Add job.id to candidate.jobIds (if not exists)
2. Add candidate.id to job.candidateIds (if not exists)
3. Add client.id to candidate.clientIds (if not exists)
4. Add new CandidatePipeline entry to candidate.jobApplications with empty emailIds array
5. Update job.statistics and client.statistics

### When Sending/Receiving Email:
1. Create email in `emails` collection with candidateId, jobId, clientId
2. Find candidate's jobApplication for this job
3. Add email.id to jobApplication.emailIds array
4. Increment jobApplication.emailsSent or emailsReceived
5. Update jobApplication.lastEmailDate
6. Increment candidate.totalEmailsSent or totalEmailsReceived
7. Update candidate.lastEmailDate

### When Deleting a Job:
1. Optionally delete or archive associated emails
2. Remove job.id from client.jobIds
3. Remove job references from candidate.jobApplications
4. Update statistics

---

## Schema Benefits

### 1. Scalability
- Each entity in separate collection allows independent scaling
- Indexes can be optimized per collection
- Queries are efficient with proper indexing

### 2. Flexibility
- Easy to add new relationships without affecting existing data
- Can query from any direction (client→job, candidate→job, etc.)
- Support for complex filtering and aggregations

### 3. Data Integrity
- Relationships are explicit through IDs
- Easy to validate references
- No data duplication (statistics are calculated)

### 4. Performance
- Avoid deeply nested documents
- Enable efficient pagination
- Support for parallel queries
- Selective field loading (projection)

---

## Indexing Strategy

### Client Collection
```typescript
db.clients.createIndex({ companyName: 1 });
db.clients.createIndex({ email: 1 }, { unique: true });
db.clients.createIndex({ status: 1 });
db.clients.createIndex({ industry: 1 });
```

### Job Collection
```typescript
db.jobs.createIndex({ clientId: 1 });
db.jobs.createIndex({ title: 1 });
db.jobs.createIndex({ status: 1 });
db.jobs.createIndex({ clientId: 1, status: 1 });
```

### Candidate Collection
```typescript
db.candidates.createIndex({ email: 1 }, { unique: true });
db.candidates.createIndex({ firstName: 1, lastName: 1 });
db.candidates.createIndex({ jobIds: 1 });
db.candidates.createIndex({ "jobApplications.jobId": 1 });
```

### Application Collection
```typescript
db.applications.createIndex({ jobId: 1 });
db.applications.createIndex({ candidateId: 1 });
db.applications.createIndex({ clientId: 1 });
db.applications.createIndex({ jobId: 1, candidateId: 1 }, { unique: true });
db.applications.createIndex({ status: 1 });
```

### Email Collection
```typescript
db.emails.createIndex({ candidateId: 1, jobId: 1 });
db.emails.createIndex({ candidateId: 1, sentAt: -1 });
db.emails.createIndex({ jobId: 1, sentAt: -1 });
db.emails.createIndex({ clientId: 1, sentAt: -1 });
db.emails.createIndex({ threadId: 1 });
db.emails.createIndex({ parentEmailId: 1 });
db.emails.createIndex({ direction: 1, status: 1 });
db.emails.createIndex({ sentAt: -1 });
```

---

## Example Data Structure

### Client Document
```json
{
  "id": "client_001",
  "companyName": "Tech Corp",
  "email": "contact@techcorp.com",
  "jobIds": ["job_001", "job_002"],
  "statistics": {
    "totalJobs": 2,
    "activeJobs": 1,
    "totalCandidates": 15
  }
}
```

### Job Document
```json
{
  "id": "job_001",
  "title": "Senior Developer",
  "clientId": "client_001",
  "candidateIds": ["cand_001", "cand_002"],
  "applicationIds": ["app_001", "app_002"],
  "statistics": {
    "totalCandidates": 2,
    "activeCandidates": 1
  }
}
```

### Candidate Document
```json
{
  "id": "cand_001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@email.com",
  "jobIds": ["job_001"],
  "applicationIds": ["app_001"],
  "clientIds": ["client_001"],
  "jobApplications": [
    {
      "jobId": "job_001",
      "applicationId": "app_001",
      "status": "interviewing",
      "emailIds": ["email_001", "email_002", "email_003"],
      "emailsSent": 2,
      "emailsReceived": 1,
      "lastEmailDate": "2025-10-23T10:00:00Z"
    }
  ],
  "totalEmailsSent": 2,
  "totalEmailsReceived": 1
}
```

### Email Document
```json
{
  "id": "email_001",
  "candidateId": "cand_001",
  "jobId": "job_001",
  "clientId": "client_001",
  "direction": "outbound",
  "type": "interview_invitation",
  "status": "opened",
  "subject": "Interview Invitation - Senior Developer",
  "body": "Dear John, ...",
  "from": { "email": "recruiter@techcorp.com", "name": "Jane Smith" },
  "to": [{ "email": "john@email.com", "name": "John Doe", "type": "to" }],
  "sentAt": "2025-10-23T09:00:00Z",
  "openedAt": "2025-10-23T09:15:00Z",
  "isRead": true,
  "threadId": "thread_001"
}
```

---

## Summary

- **Client** has many **Jobs** (via `jobIds`)
- **Job** belongs to **Client** (via `clientId`) and has many **Candidates** (via `candidateIds`)
- **Candidate** has many **Jobs** (via `jobIds`) with per-job tracking in `jobApplications`
- **Email** belongs to **Candidate** + **Job** + **Client** (via foreign keys)
- Each **CandidatePipeline** entry in candidate tracks emails for that specific job (via `emailIds`)
- All entities are stored in separate collections with ID-based relationships
- Statistics are calculated from related data, not duplicated
