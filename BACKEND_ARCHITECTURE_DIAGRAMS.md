# ATS Backend - Architecture Diagrams

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19 + TS)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Redux Toolkit State Management              │  │
│  │  ┌────────┬────────┬────────┬────────┬────────┬────────┐ │  │
│  │  │ Clients│  Jobs  │Candidates│Applications│Emails│ Team│ │  │
│  │  └────────┴────────┴────────┴────────┴────────┴────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ HTTP/REST API                    │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Express Middleware                     │  │
│  │    ┌──────────────────────────────────────────────┐     │  │
│  │    │ Auth │ RBAC │ Validation │ Error │ Logging │     │  │
│  │    └──────────────────────────────────────────────┘     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Controllers                          │  │
│  │  ┌────────┬────────┬────────┬────────┬────────┬────────┐ │  │
│  │  │ Clients│  Jobs  │Candidates│Applications│Emails│ Team│ │  │
│  │  └────────┴────────┴────────┴────────┴────────┴────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Service Layer (Business Logic)         │  │
│  │  ┌────────┬────────┬────────┬────────┬────────┬────────┐ │  │
│  │  │ Client │  Job   │Candidate│Application│Email │  AI  │ │  │
│  │  │Service │Service │Service  │Service   │Service│Service│ │  │
│  │  └────────┴────────┴────────┴────────┴────────┴────────┘ │  │
│  │  ┌────────┬────────┬────────┬────────┬────────┐         │  │
│  │  │ Zoom   │Cloudinary│Stats  │Automation│ Auth │         │  │
│  │  │Service │Service   │Service│Service   │Service│         │  │
│  │  └────────┴────────┴────────┴────────┴────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Data Access Layer                       │  │
│  │  ┌────────┬────────┬────────┬────────┬────────┬────────┐ │  │
│  │  │ User   │ Client │  Job   │Candidate│Application│Email│ │  │
│  │  │ Model  │ Model  │ Model  │ Model   │ Model    │Model│ │  │
│  │  └────────┴────────┴────────┴────────┴────────┴────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Background Jobs                        │  │
│  │  ┌──────────────────┬──────────────────┬──────────────┐  │  │
│  │  │ Email Automation │ Stats Calculator │   Cleanup    │  │  │
│  │  └──────────────────┴──────────────────┴──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    │         │         │         │
      ┌─────────────┴────┬────┴────┬────┴────┬────┴─────────┐
      ▼                  ▼         ▼         ▼              ▼
┌──────────┐      ┌──────────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
│ MongoDB  │      │ Cloudinary│ │OpenAI│ │   Zoom   │ │ Resend + │
│  Atlas   │      │  (Files)  │ │ (AI) │ │   API    │ │   IMAP   │
└──────────┘      └──────────┘ └──────┘ └──────────┘ └──────────┘
```

---

## 2. Data Model Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA MODEL HIERARCHY                       │
└─────────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │    User      │
                        │ (Auth/Team)  │
                        └──────┬───────┘
                               │
                ┏━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━┓
                ▼                              ▼
        ┌──────────────┐              ┌──────────────┐
        │ Team Member  │              │   Activity   │
        │ (Permissions)│              │    Logs      │
        └──────────────┘              └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    MAIN ENTITY FLOW                             │
└─────────────────────────────────────────────────────────────────┘

   ┌────────────────┐
   │  Application   │  ← Independent (initial submission)
   │  (INDEPENDENT) │     - Not under any job/client initially
   │                │     - Can have targetJobId (optional)
   │  Status:       │
   │  - pending     │
   │  - under_review│
   │  - approved    │
   │  - rejected    │
   └────────┬───────┘
            │
            │ (APPROVE & ASSIGN)
            │
            ▼
   ┌────────────────┐        ┌──────────────┐
   │   Candidate    │───────→│    Client    │
   │                │        │   (Company)  │
   │ MUST belong to │        └──────┬───────┘
   │ at least 1 Job │               │
   │                │               │ (has many)
   │ jobIds: [...]  │               │
   │ jobApplications│               ▼
   │ [{jobId, ...}] │        ┌──────────────┐
   └────────┬───────┘        │     Job      │
            │                │  (Position)  │
            │                └──────┬───────┘
            │                       │
            │ (belongs to multiple) │
            └───────────────────────┘
                     │
                     │ (has many)
                     │
                     ▼
            ┌──────────────┐
            │    Email     │
            │(Communication)│
            │              │
            │candidateId   │
            │jobId         │
            │clientId      │
            └──────────────┘
                     │
                     │ (belongs to)
                     │
                     ▼
            ┌──────────────┐
            │  Interview   │
            │ (Scheduled)  │
            │              │
            │candidateId   │
            │jobId         │
            │clientId      │
            └──────────────┘
```

---

## 3. Application → Candidate Flow

```
┌─────────────────────────────────────────────────────────────────┐
│            APPLICATION TO CANDIDATE CONVERSION FLOW             │
└─────────────────────────────────────────────────────────────────┘

Step 1: Application Submission
┌────────────────────────────────────────┐
│         Application Created            │
│  • Email received at resumes@...       │
│  • Resume parsed with OpenAI           │
│  • Status: "pending"                   │
│  • targetJobId: Optional               │
│  • Independent (no relationships yet)  │
└────────────────┬───────────────────────┘
                 │
                 ▼
Step 2: Review Process
┌────────────────────────────────────────┐
│         Recruiter Reviews              │
│  • View application details            │
│  • Check resume & video                │
│  • Status: "under_review"              │
│  • Decision: Approve or Reject         │
└────────────────┬───────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼                   ▼
  APPROVED              REJECTED
       │                   │
       │                   └─→ [Status: "rejected"]
       │                       [End of flow]
       │
       ▼
Step 3: Job Assignment
┌────────────────────────────────────────┐
│      Assign to Job (Required)          │
│  • Select job from dropdown            │
│  • assignedJobId: Set                  │
│  • assignedClientId: Auto-derived      │
└────────────────┬───────────────────────┘
                 │
                 ▼
Step 4: Candidate Creation
┌────────────────────────────────────────┐
│       Create Candidate Record          │
│  • Copy data from Application          │
│  • Set jobIds: [assignedJobId]         │
│  • Set clientIds: [assignedClientId]   │
│  • Create jobApplications entry:       │
│    {                                   │
│      jobId: assignedJobId,             │
│      applicationId: originalAppId,     │
│      status: "new",                    │
│      appliedAt: now(),                 │
│      emailIds: [],                     │
│      emailsSent: 0,                    │
│      emailsReceived: 0                 │
│    }                                   │
└────────────────┬───────────────────────┘
                 │
                 ▼
Step 5: Link Back to Application
┌────────────────────────────────────────┐
│     Update Application Record          │
│  • candidateId: Set to new candidate   │
│  • Status: "approved"                  │
│  • approvedBy: Current user            │
│  • approvedAt: now()                   │
└────────────────┬───────────────────────┘
                 │
                 ▼
Step 6: Update Job
┌────────────────────────────────────────┐
│       Add Candidate to Job             │
│  • job.candidateIds.push(candidateId)  │
│  • job.applicationIds.push(appId)      │
│  • Recalculate job statistics          │
└────────────────┬───────────────────────┘
                 │
                 ▼
         [Flow Complete]
   Candidate now in job pipeline
```

---

## 4. Email Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  EMAIL COMMUNICATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

INBOUND (Received from Candidate)
┌──────────────────────────────────────┐
│  1. Email arrives at inbox           │
│     resumes@aristagroups.com         │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  2. IMAP Monitor detects new email   │
│     (runs every 15 minutes)          │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  3. Parse email with mailparser      │
│     • Extract subject, body, from    │
│     • Detect attachments (resumes)   │
│     • Extract video links            │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  4. Check if from existing candidate │
└──────────────┬───────────────────────┘
               │
       ┌───────┴────────┐
       │                │
    EXISTING         NEW
       │                │
       ▼                ▼
┌──────────────┐  ┌────────────────┐
│ Create Email │  │ Create         │
│ Record       │  │ Application    │
│              │  │                │
│ Link to:     │  │ Parse resume   │
│ • Candidate  │  │ with OpenAI    │
│ • Job        │  │                │
│ • Client     │  │ Status:        │
└──────────────┘  │ "pending"      │
                  └────────────────┘


OUTBOUND (Sent to Candidate)
┌──────────────────────────────────────┐
│  1. Recruiter composes email in UI   │
│     • Select candidate + job         │
│     • Choose template (optional)     │
│     • Add subject & body             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  2. Backend validates & enriches     │
│     • candidateId: Required          │
│     • jobId: Required                │
│     • clientId: Auto-derived         │
│     • sentBy: Current user           │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  3. Send via Resend API              │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  4. Save email record to DB          │
│     • direction: "outbound"          │
│     • status: "sent"                 │
│     • Link to candidate, job, client │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  5. Update candidate email counters  │
│     • Update jobApplications entry   │
│     • emailsSent++                   │
│     • lastEmailDate = now()          │
└──────────────────────────────────────┘
```

---

## 5. Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

User Login (via Clerk)
┌──────────────────────────────────────┐
│  1. User visits frontend             │
│     • Clicks "Sign In"               │
│     • Clerk UI appears               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  2. User enters credentials          │
│     • Email + Password               │
│     • Or: Google/Microsoft SSO       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  3. Clerk validates & returns JWT    │
│     • token includes: userId, email  │
│     • Stored in frontend state       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  4. Frontend makes API call          │
│     Headers: {                       │
│       Authorization: "Bearer token"  │
│     }                                │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  5. Backend validates JWT            │
│     • Verify signature with Clerk    │
│     • Extract clerkId from token     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  6. Find user in MongoDB             │
│     User.findOne({ clerkId })        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  7. Attach user to request           │
│     req.user = userDoc               │
│     • Includes role, permissions     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  8. Check role/permissions           │
│     • hasRole('admin', 'recruiter')  │
│     • hasPermission('canManageJobs') │
└──────────────┬───────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   AUTHORIZED      DENIED
       │                │
       ▼                ▼
  [Continue]       403 Forbidden
  to handler       {"error": "..."}
```

---

## 6. Resume Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  RESUME PROCESSING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐
│  1. Resume arrives (email or upload) │
│     • PDF, DOC, or DOCX              │
│     • Max size: 5MB                  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  2. Upload to Cloudinary             │
│     • Folder: ats/resumes/           │
│     • Return: { url, publicId }      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  3. Extract text from file           │
│     • PDF: pdf-parse                 │
│     • DOCX: mammoth                  │
│     • Result: Plain text string      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  4. Send to OpenAI for parsing       │
│     Model: gpt-4o-mini               │
│     Prompt: "Parse this resume..."   │
│     Response format: JSON            │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  5. OpenAI returns structured data   │
│     {                                │
│       firstName: "John",             │
│       lastName: "Doe",               │
│       email: "john@example.com",     │
│       phone: "+1...",                │
│       skills: ["React", "Node.js"],  │
│       experience: [...],             │
│       education: [...],              │
│       summary: "..."                 │
│     }                                │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  6. Validate parsed data (Zod)       │
│     • Check required fields          │
│     • Normalize phone numbers        │
│     • Validate email format          │
└──────────────┬───────────────────────┘
               │
       ┌───────┴────────┐
       │                │
    VALID          INVALID
       │                │
       ▼                ▼
┌──────────────┐  ┌────────────────┐
│ Create       │  │ Flag for       │
│ Application  │  │ manual review  │
│              │  │                │
│ aiAnalysis:  │  │ aiAnalysis:    │
│ {            │  │ {              │
│   isValid:   │  │   isValid:     │
│   true,      │  │   false,       │
│   matchScore:│  │   error: "..." │
│   85         │  │ }              │
│ }            │  └────────────────┘
└──────────────┘


OPTIONAL: Resume Scoring (against job requirements)
┌──────────────────────────────────────┐
│  7. Fetch job requirements           │
│     • Required skills                │
│     • Experience level               │
│     • Education requirements         │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  8. Send to OpenAI for scoring       │
│     Model: gpt-4o (premium)          │
│     Prompt: "Score this resume..."   │
│     Input: { resume, jobRequirements }│
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  9. Return match score               │
│     {                                │
│       overallScore: 85,              │
│       skillsMatch: 90,               │
│       experienceMatch: 80,           │
│       educationMatch: 85,            │
│       strengths: [...],              │
│       gaps: [...],                   │
│       recommendation: "interview"    │
│     }                                │
└──────────────────────────────────────┘
```

---

## 7. Statistics Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│              STATISTICS CALCULATION STRATEGY                    │
└─────────────────────────────────────────────────────────────────┘

Option 1: VIRTUAL FIELDS (Real-time)
┌──────────────────────────────────────┐
│  Client.virtual('statistics', ...)   │
│                                      │
│  On client query:                    │
│  1. Fetch client                     │
│  2. Aggregate related jobs           │
│  3. Aggregate related candidates     │
│  4. Calculate stats on-the-fly       │
│  5. Attach to response               │
└──────────────┬───────────────────────┘
               │
    Pros:       │      Cons:
    • Always    │      • Slower queries
      accurate  │      • Multiple DB calls
               │
               │
Option 2: CACHED STATS (Periodic update)
┌──────────────────────────────────────┐
│  Background job runs every 6 hours   │
│                                      │
│  1. Fetch all clients                │
│  2. For each client:                 │
│     • Count jobs by status           │
│     • Count candidates by status     │
│     • Calculate averages             │
│     • Update client.statistics       │
└──────────────┬───────────────────────┘
               │
    Pros:       │      Cons:
    • Fast      │      • Stale data
      queries   │      • Scheduled delay
    • Single    │
      DB call   │
               │
               │
RECOMMENDED: HYBRID APPROACH
┌──────────────────────────────────────┐
│  1. Cache basic counts               │
│     • totalJobs, totalCandidates     │
│     • Update on entity change        │
│                                      │
│  2. Calculate complex stats on-query │
│     • averageTimeToHire              │
│     • successRate                    │
│     • Use MongoDB aggregation        │
└──────────────────────────────────────┘

Implementation:
┌──────────────────────────────────────┐
│  // In service layer                 │
│  async getClientStatistics(id) {     │
│    const client = await Client       │
│      .findById(id);                  │
│                                      │
│    // Cached counts                  │
│    const basicStats = {              │
│      totalJobs: client.jobIds.length │
│    };                                │
│                                      │
│    // Calculated stats               │
│    const activeJobs = await Job      │
│      .countDocuments({               │
│        clientId: id,                 │
│        status: 'open'                │
│      });                             │
│                                      │
│    return {                          │
│      ...basicStats,                  │
│      activeJobs,                     │
│      ...                             │
│    };                                │
│  }                                   │
└──────────────────────────────────────┘
```

---

## 8. Background Jobs Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS                              │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    JOB SCHEDULER                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                 node-cron (Simple)                       │ │
│  │  OR                                                       │ │
│  │                 Bull Queue (Recommended)                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│ Email           │ │ Statistics   │ │   Cleanup    │
│ Automation      │ │ Calculator   │ │    Job       │
│                 │ │              │ │              │
│ Schedule:       │ │ Schedule:    │ │ Schedule:    │
│ Every 15 min    │ │ Every 6 hrs  │ │ Daily 2am    │
│                 │ │              │ │              │
│ Tasks:          │ │ Tasks:       │ │ Tasks:       │
│ • Check IMAP    │ │ • Update     │ │ • Delete old │
│ • Fetch emails  │ │   client     │ │   logs       │
│ • Parse resumes │ │   stats      │ │ • Clean temp │
│ • Create apps   │ │ • Update job │ │   files      │
│ • Send ACKs     │ │   stats      │ │ • Archive    │
│                 │ │ • Update     │ │   old data   │
│                 │ │   candidate  │ │              │
│                 │ │   stats      │ │              │
└─────────────────┘ └──────────────┘ └──────────────┘


Email Automation Detail:
┌──────────────────────────────────────┐
│  Every 15 minutes:                   │
│                                      │
│  1. Connect to IMAP                  │
│  2. Fetch unseen emails              │
│  3. For each email:                  │
│     a. Parse with mailparser         │
│     b. Extract attachments           │
│     c. Check for video links         │
│     d. Parse resume with OpenAI      │
│     e. Create Application            │
│     f. Send acknowledgment email     │
│     g. Mark as processed             │
│  4. Disconnect from IMAP             │
│                                      │
│  Error handling:                     │
│  • Retry 3 times on failure          │
│  • Log errors to file                │
│  • Alert admin after 5 failures      │
└──────────────────────────────────────┘
```

---

## 9. Deployment Architecture (Heroku)

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT                      │
└─────────────────────────────────────────────────────────────────┘

GitHub Repository
        │
        │ git push
        ▼
┌────────────────────────────────────────────────────────────────┐
│                    HEROKU PLATFORM                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  Build Process                           │ │
│  │  1. npm install                                          │ │
│  │  2. npm run heroku-postbuild (TypeScript compile)       │ │
│  │  3. Create production bundle                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  Web Dyno (node dist/server.js)         │ │
│  │  • Express server                                        │ │
│  │  • Port: Dynamic (Heroku assigned)                      │ │
│  │  • Scaling: 1 dyno (free) or multiple (paid)           │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
          │              │              │              │
          │              │              │              │
          ▼              ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ MongoDB  │  │Cloudinary│  │  OpenAI  │  │   Clerk  │
    │  Atlas   │  │          │  │   API    │  │   Auth   │
    │          │  │  (Files) │  │   (AI)   │  │          │
    │ Free tier│  │ Free tier│  │  Pay per │  │ Free tier│
    │ 512MB    │  │ 25GB     │  │   use    │  │          │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘


Environment Variables (Heroku Config):
┌────────────────────────────────────────────────────────────────┐
│  heroku config:set                                             │
│    NODE_ENV=production                                         │
│    PORT=<auto-assigned>                                        │
│    MONGODB_URI=mongodb+srv://...                               │
│    CLERK_SECRET_KEY=sk_live_...                                │
│    OPENAI_API_KEY=sk-...                                       │
│    CLOUDINARY_CLOUD_NAME=...                                   │
│    ... (60+ variables)                                         │
└────────────────────────────────────────────────────────────────┘


Monitoring:
┌────────────────────────────────────────────────────────────────┐
│  • Heroku Logs: heroku logs --tail                             │
│  • Winston logs to console (Heroku captures)                   │
│  • Uptime monitoring: External service (Pingdom, UptimeRobot)  │
│  • Error tracking: Optional (Sentry)                           │
└────────────────────────────────────────────────────────────────┘
```

---

**End of Architecture Diagrams**

For detailed implementation, see:
- `BACKEND_ANALYSIS_PHASE1.md` - Complete specification
- `BACKEND_QUICK_SUMMARY.md` - Quick reference
