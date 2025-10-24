# ATS UI - Complete Project Audit & Design System

**Last Updated:** October 24, 2025  
**Project:** Applicant Tracking System (ATS) UI  
**Repository:** mtauhidul/ats-ui  
**Branch:** master  
**Overall Completion:** 77%

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Implementation Status](#implementation-status)
3. [UI Design System](#ui-design-system)
4. [Component Patterns](#component-patterns)
5. [Data Architecture](#data-architecture)
6. [Missing Features](#missing-features)
7. [Development Roadmap](#development-roadmap)

---

## 1. Executive Summary

### Project Status

- **Core Features:** 85% ✅
- **UI Pages:** 50% (8/15 complete)
- **Data Layer:** 95% ✅
- **Components:** 80% ✅

### Technology Stack

- **Frontend:** React 19.2.0 + TypeScript + Vite
- **Styling:** Tailwind CSS 4.1.14 with custom theme
- **UI Components:** Radix UI (headless components)
- **Drag & Drop:** @dnd-kit for kanban board
- **State Management:** React hooks (useState)
- **Mock Data:** JSON files with direct imports
- **Dev Server:** Vite on port 5173

### Key Achievements

✅ Complete mock data aligned with schema (38 records)  
✅ Full CRUD operations for Clients, Jobs, Categories, Tags  
✅ Interactive kanban board with drag-drop  
✅ Advanced data tables with filtering/sorting  
✅ Relationship management system  
✅ Helper utilities (statistics, validators, pipeline)  
✅ Email communication component (533 lines, ready to integrate)

---

## 2. Implementation Status

### ✅ Fully Implemented Pages (8/15)

#### 1. Dashboard Main (`/dashboard`)

- **Status:** ✅ Complete
- **Features:**
  - 4 statistics cards with trend indicators
  - Interactive area chart with date range selection
  - Gradient card backgrounds
  - Responsive grid layout (1→2→4 columns)
- **Components:** `SectionCards`, `ChartAreaInteractive`
- **Data:** Uses `data.json` for charts

#### 2. Clients (`/dashboard/clients`)

- **Status:** ✅ Complete
- **Features:**
  - Card grid view with company logos
  - Full CRUD (Create, Read, Update, Delete)
  - Advanced filtering (status, industry, search)
  - Sorting options (name, date, jobs)
  - Client detail drawer with tabs
  - Communication notes & activity history
  - Contact management
  - Statistics calculation
- **Components:** `ClientCard`, `ClientDetails`, `AddClientModal`, `EditClientModal`, `AddContactModal`, `AddCommunicationNoteModal`
- **Mock Data:** 6 clients

#### 3. Jobs (`/dashboard/jobs`)

- **Status:** ✅ Complete
- **Features:**
  - Card/Table view toggle
  - Full CRUD operations
  - Multi-level filtering (status, type, client, search)
  - Sorting capabilities
  - Job detail drawer with candidate list
  - Pipeline navigation button
  - Statistics display
- **Components:** `JobCard`, `JobDetails`, `AddJobModal`, `EditJobModal`
- **Mock Data:** 2 jobs

#### 4. Jobs Pipeline (`/dashboard/jobs/pipeline/:jobId`)

- **Status:** ✅ Complete
- **Features:**
  - Drag-and-drop kanban board
  - 15+ pipeline stages support
  - Candidate cards in stages
  - Stage statistics
  - Auto-status updates on drop
  - Empty state with suggestions
- **Components:** `JobKanbanBoard`, `SortableCandidate`, `DroppableArea`, `PipelineEmptyState`
- **Utilities:** `pipeline-helpers.ts`

#### 5. Candidates (`/dashboard/candidates`)

- **Status:** ✅ Complete
- **Features:**
  - Advanced data table (TanStack Table)
  - Multi-column filtering
  - Status/source/job filters
  - Bulk actions support
  - Column visibility toggle
  - Pagination with size options
  - Export functionality
  - Relationship display (jobs, clients)
- **Components:** `CandidatesDataTable`
- **Mock Data:** 4 candidates

#### 6. Applications (`/dashboard/applications`)

- **Status:** ✅ Complete
- **Features:**
  - Data table with workflow status
  - Approval workflow support
  - Application → Candidate conversion
  - Reviewer/approver tracking
  - Status badges
  - Quick actions menu
- **Components:** `ApplicationsDataTable`
- **Mock Data:** 6 applications

#### 7. Categories (`/dashboard/categories`)

- **Status:** ✅ Complete
- **Features:**
  - Full CRUD operations
  - Data table view
  - Color-coded tags
  - Quick edit/delete
- **Components:** Generic DataTable with modals
- **Mock Data:** 12 categories

#### 8. Tags (`/dashboard/tags`)

- **Status:** ✅ Complete
- **Features:**
  - Full CRUD operations
  - Data table view
  - Color-coded tags
  - Quick edit/delete
- **Components:** Generic DataTable with modals
- **Mock Data:** 8 tags

---

### 🟡 Partially Implemented (1/15)

#### Team (`/dashboard/team`)

- **Status:** 🟡 Basic structure only
- **Current:** Uses generic DataTable with `data.json`
- **Missing:**
  - Team member schema & types
  - Team-specific mock data
  - Role/permission UI
  - Team member details view
  - Performance metrics
- **Priority:** Medium

---

### ❌ Empty Placeholder Pages (7/15)

#### 1. Analytics (`/dashboard/analytics`)

- **Status:** ❌ Empty placeholder
- **Current:** Dashed border placeholder with text
- **Needed:**
  - Recruitment metrics dashboard
  - Time-to-hire analytics
  - Source effectiveness charts
  - Pipeline conversion funnel
  - Team performance metrics
  - Date range filters
  - Export reports
- **Priority:** Medium-High

#### 2. Messages (`/dashboard/messages`)

- **Status:** ❌ Empty placeholder
- **Needed:**
  - Internal team chat interface
  - Message threads
  - Real-time updates
  - File attachments
  - @mentions support
  - Search & filters
- **Priority:** Medium

#### 3. Settings (`/dashboard/settings`)

- **Status:** ❌ Empty placeholder
- **Needed:**
  - Tabbed interface (Profile, Email, System, Integrations)
  - Email templates editor
  - SMTP configuration
  - Notification preferences
  - System settings
  - Pipeline stage customization
  - Branding options
- **Priority:** High

#### 4. Notifications (`/dashboard/notifications`)

- **Status:** ❌ Empty placeholder
- **Needed:**
  - Notification center
  - Read/unread status
  - Category filters
  - Mark all as read
  - Notification preferences
  - Real-time updates
- **Priority:** Low-Medium

#### 5. Account (`/dashboard/account`)

- **Status:** ❌ Empty placeholder
- **Needed:**
  - Profile editing
  - Avatar upload
  - Password change
  - Email preferences
  - Connected accounts
  - Session management
- **Priority:** Low-Medium

#### 6. Help (`/dashboard/help`)

- **Status:** ❌ Empty placeholder
- **Needed:**
  - Documentation sections
  - FAQs accordion
  - Video tutorials
  - Search functionality
  - Contact support form
  - Keyboard shortcuts
- **Priority:** Low

#### 7. Search (`/dashboard/search`)

- **Status:** ❌ Empty placeholder
- **Needed:**
  - Global search across entities
  - Filters by type (candidates, jobs, clients)
  - Recent searches
  - Search suggestions
  - Result highlighting
  - Advanced filters
- **Priority:** Medium

---

## 3. UI Design System

### Design Philosophy

**Brand:** Sequence — Light-first professional ATS theme  
**Core Values:** Clean, professional, data-dense, accessible  
**Inspiration:** Modern SaaS applications with emphasis on clarity

---

### 3.1 Color System

#### Brand Colors

```css
/* Primary Brand Colors */
--primary: oklch(0.65 0.08 220);        /* Sky blue - primary actions */
--accent: oklch(0.79 0.16 152);         /* Brand green (#00D47E) - success/highlights */

/* Teal/Green Brand Swatches */
Teal:  #025864  /* Dark teal for accents */
Green: #00D47E  /* Primary green for success states */
```

#### Neutrals

```css
/* Light Theme (Default) */
--background: oklch(0.95 0.015 235); /* Light cool gray-blue (#E9EEF2) */
--foreground: oklch(0.18 0.03 235); /* Deep blue-gray text (#10232C) */
--card: oklch(0.98 0.006 235); /* Almost white panels */
--muted: oklch(0.95 0.01 235); /* Subdued surfaces */
--muted-foreground: oklch(0.32 0.03 235); /* Secondary text */
--border: oklch(0.88 0.012 235); /* Dividers (#D4DEE6) */
```

#### Semantic Colors

```css
--destructive: oklch(0.62 0.18 27); /* Warm red for errors/delete */
--secondary: oklch(0.94 0.012 235); /* Light chips/tags */
```

#### Status Badge Colors

```typescript
const statusColors = {
  active:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  inactive:
    "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  pending:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  on_hold:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  open: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  closed: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  draft: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};
```

#### Industry/Type Colors

```typescript
const industryColors = {
  technology:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  healthcare:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  finance:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  education:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  retail: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  manufacturing:
    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  consulting:
    "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
};

const jobTypeColors = {
  full_time:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  part_time:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  contract:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  freelance:
    "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  internship:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
};
```

---

### 3.2 Typography

#### Font Family

```css
--font-sans: "Helvetica", "Helvetica Neue", Arial, ui-sans-serif, system-ui;
```

#### Type Scale

```typescript
/* Headings */
<h1 className="text-2xl font-bold">         // Page titles
<h2 className="text-lg font-medium">        // Card titles, section headers
<h3 className="text-base font-semibold">    // Subsections

/* Body Text */
<p className="text-sm">                     // Default body text
<span className="text-xs">                  // Labels, metadata
<span className="text-muted-foreground">    // Secondary text
```

#### Text Utilities

- `line-clamp-1` / `line-clamp-2` - Truncate long text
- `truncate` - Single line truncation with ellipsis
- `tabular-nums` - Monospaced numbers for alignment
- `font-semibold` - 600 weight for emphasis
- `font-medium` - 500 weight for headings

---

### 3.3 Spacing & Layout

#### Container Padding

```typescript
// Standard page padding
<div className="px-4 lg:px-6">           // Horizontal responsive padding
<div className="py-4 md:py-6">           // Vertical responsive padding
<div className="gap-4 md:gap-6">         // Responsive gaps
```

#### Grid Layouts

```typescript
// Responsive card grids
<div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

// Stats cards
<div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
```

#### Flexbox Patterns

```typescript
// Header with actions
<div className="flex items-center justify-between mb-6">

// Icon + text
<div className="flex items-center gap-2">

// Vertical stack
<div className="flex flex-col gap-4">
```

---

### 3.4 Border Radius

```css
--radius: 0.65rem; /* Base radius (10.4px) */
--radius-sm: calc(var(--radius) - 4px); /* Small (6.4px) */
--radius-md: calc(var(--radius) - 2px); /* Medium (8.4px) */
--radius-lg: var(--radius); /* Large (10.4px) */
--radius-xl: calc(var(--radius) + 4px); /* Extra large (14.4px) */
```

**Usage:**

- Cards: `rounded-lg`
- Buttons: `rounded-md`
- Badges: `rounded-full` or `rounded-md`
- Inputs: `rounded-md`
- Avatars: `rounded-lg` (squared) or `rounded-full`

---

### 3.5 Shadows & Elevation

```typescript
// Hover states
hover: shadow - md; // Subtle elevation on hover
hover: shadow - lg; // More prominent hover

// Card shadows
shadow - xs; // Minimal shadow for subtle depth
shadow - sm; // Default card shadow
```

---

### 3.6 Transitions

```typescript
// Standard transition
transition-all duration-200

// Hover interactions
hover:shadow-lg transition-all duration-200
group-hover:text-primary transition-colors
```

---

## 4. Component Patterns

### 4.1 Card Components

#### Standard Card Pattern

```tsx
<Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
  <CardHeader>
    <div className="flex items-start gap-4">
      <Avatar className="h-12 w-12 rounded-lg">
        <AvatarImage src={item.logo} />
        <AvatarFallback className="rounded-lg">
          <Icon className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <CardTitle className="text-lg mb-1 line-clamp-1">
          {item.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {item.description}
        </CardDescription>
      </div>
    </div>
  </CardHeader>
</Card>
```

#### Stats Card Pattern

```tsx
<Card className="@container/card">
  <CardHeader>
    <CardDescription>Label</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      $1,250.00
    </CardTitle>
    <CardAction>
      <Badge variant="outline">
        <IconTrendingUp />
        +12.5%
      </Badge>
    </CardAction>
  </CardHeader>
  <CardFooter className="flex-col items-start gap-1.5 text-sm">
    <div className="line-clamp-1 flex gap-2 font-medium">Trend description</div>
    <div className="text-muted-foreground">Metadata</div>
  </CardFooter>
</Card>
```

#### Card with Border Accent

```tsx
<Card className="border-l-4 border-l-primary hover:border-l-primary/80">
  // Emphasizes importance (used in job cards)
</Card>
```

---

### 4.2 Badge Patterns

#### Status Badges

```tsx
<Badge variant="outline" className={statusColors[status]}>
  {status.replace("_", " ")}
</Badge>
```

#### Icon Badges

```tsx
<Badge variant="outline">
  <Users className="h-3 w-3" />
  {count}
</Badge>
```

#### Trend Badges

```tsx
<Badge variant="outline">
  <IconTrendingUp />
  +12.5%
</Badge>
```

---

### 4.3 Data Table Pattern

```tsx
const [sorting, setSorting] = useState<SortingState>([]);
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
const [rowSelection, setRowSelection] = useState({});

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onColumnVisibilityChange: setColumnVisibility,
  onRowSelectionChange: setRowSelection,
  state: { sorting, columnFilters, columnVisibility, rowSelection },
});
```

**Always include:**

- Search input with debounce
- Column visibility toggle
- Status/type filters
- Export functionality
- Pagination controls
- Row selection for bulk actions

---

### 4.4 Modal Patterns

#### Add/Edit Modal Structure

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

#### Delete Confirmation

```tsx
<AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the{" "}
        {itemType}.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete} className="bg-destructive">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### 4.5 Filter Bar Pattern

```tsx
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  {/* Search */}
  <div className="flex-1 max-w-md">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  </div>

  {/* Filters */}
  <div className="flex flex-wrap gap-2">
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        {/* Options */}
      </SelectContent>
    </Select>

    {/* More filters */}

    <Button onClick={handleAction}>
      <Plus className="h-4 w-4" />
      Add New
    </Button>
  </div>
</div>
```

---

### 4.6 Detail Drawer Pattern

```tsx
<Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
  <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {item.name}
      </SheetTitle>
    </SheetHeader>

    <Tabs defaultValue="overview" className="mt-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">{/* Content */}</TabsContent>
    </Tabs>
  </SheetContent>
</Sheet>
```

---

### 4.7 Empty State Pattern

```tsx
<div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
  <div className="text-center">
    <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    <h2 className="text-lg font-medium text-gray-900">Title</h2>
    <p className="text-gray-500 mt-2">Description text</p>
    <Button className="mt-4">
      <Plus className="h-4 w-4" />
      Action
    </Button>
  </div>
</div>
```

---

### 4.8 Icon Usage

**Preferred Icon Library:** Lucide React (primary), Tabler Icons (data tables)

**Common Icons:**

- `Building2` - Companies/clients
- `Briefcase` - Jobs
- `Users` / `User` - Candidates/team
- `Mail` - Email
- `MapPin` - Location
- `Search` - Search functionality
- `Plus` - Add actions
- `X` - Close/remove
- `MoreVertical` / `DotsVertical` - Menus
- `ChevronDown` / `ChevronRight` - Accordions/navigation
- `Check` / `CheckCircle2` - Success/completion
- `TrendingUp` / `TrendingDown` - Statistics

**Icon Sizing:**

- Small icons in badges: `h-3 w-3`
- Standard icons: `h-4 w-4`
- Medium icons in avatars: `h-5 w-5` or `h-6 w-6`
- Large icons in empty states: `h-12 w-12`

---

## 5. Data Architecture

### 5.1 Mock Data Files

**Location:** `/src/lib/mock-data/`

```
clients.json      - 6 client companies
jobs.json         - 2 job postings
candidates.json   - 4 candidates with full profiles
applications.json - 6 initial applications
categories.json   - 12 job/candidate categories
tags.json         - 8 organizational tags
```

**Validation Status:** ✅ All files validated successfully

---

### 5.2 Type Definitions

**Location:** `/src/types/`

```typescript
// Core entities
client.ts       - Client, Contact, ClientStatus, CommunicationNote
job.ts          - Job, JobStatus, JobType, SalaryRange
candidate.ts    - Candidate, CandidateStatus, Education, WorkExperience
application.ts  - Application, ApplicationStatus, ApprovalWorkflow
category.ts     - Category
tag.ts          - Tag
pipeline.ts     - Pipeline, PipelineStage, StageType
email.ts        - Email, EmailThread
team.ts         - TeamMember, Role, Permission
common.ts       - Shared types, utilities
```

---

### 5.3 Relationship Structure

#### Bidirectional References

```typescript
// Client ↔ Job
Client.jobIds[]       → Job.id
Job.clientId          → Client.id

// Job ↔ Candidate
Job.candidateIds[]    → Candidate.id
Candidate.jobIds[]    → Job.id

// Job ↔ Application
Job.applicationIds[]  → Application.id
Application.targetJobId → Job.id (optional, before approval)

// Candidate ↔ Application
Candidate.applicationIds[] → Application.id
Application.candidateId    → Candidate.id (after conversion)

// Client → Candidate (indirect through Job)
clientsData.find(c => c.jobIds.includes(jobId))
```

#### Statistics Calculation

```typescript
// Client statistics (dynamic)
statistics: {
  totalJobs: jobIds.length,
  activeJobs: jobs.filter(j => j.status === 'open').length,
  totalCandidates: sum of candidates across all jobs,
  activeCandidates: sum of active candidates across jobs,
  hiredCandidates: sum of hired candidates
}

// Job statistics (dynamic)
statistics: {
  totalCandidates: candidateIds.length,
  activeCandidates: candidates with status !== 'rejected/withdrawn',
  hiredCandidates: candidates with status === 'hired',
  totalApplications: applicationIds.length,
  pendingApplications: applications with status === 'pending'
}
```

---

### 5.4 Helper Utilities

#### `/src/lib/statistics.ts`

```typescript
calculateClientStatistics(client, jobs, candidates);
calculateJobStatistics(job, candidates, applications);
```

#### `/src/lib/pipeline-helpers.ts`

```typescript
mapStageToStatus(stageType: StageType): CandidateStatus
updateCandidateStatus(candidate, newStage)
```

#### `/src/lib/relationship-validators.ts`

```typescript
addJobToClient(client, job);
addCandidateToJob(job, candidate);
removeCandidateFromJob(job, candidate);
convertApplicationToCandidate(application, candidate);
validateRelationships(clients, jobs, candidates, applications);
```

---

## 6. Missing Features

### 6.1 Email Integration (HIGH PRIORITY)

**Component Status:** ✅ Fully built (`candidate-email-communication.tsx`, 533 lines)

**What Exists:**

- Complete email UI with inbox/sent/archive tabs
- Compose email with rich text editor
- Reply/forward/delete/star actions
- Attachment preview
- Email threads with timestamps
- Mock email data structure

**What's Missing:**

- Integration into Jobs detail view (add email tab)
- Integration into Candidates detail view (add email tab)
- Connect to candidates' email tracking data (`totalEmailsSent`, `totalEmailsReceived`)
- Email send functionality (currently toast notifications)
- Email template system

**Implementation Steps:**

1. Add "Email" tab to `JobDetails` component
2. Add "Email" tab to candidate detail drawer
3. Pass candidate + job data to `CandidateEmailCommunication`
4. Connect email history from `candidate.jobApplications[].emailIds`
5. Create email templates in Settings

**Estimated Time:** 2-3 hours

---

### 6.2 Settings Page (HIGH PRIORITY)

**Current Status:** ❌ Empty placeholder

**Required Sections:**

#### Profile Settings

- User profile editing (name, email, avatar)
- Password change form
- Two-factor authentication toggle

#### Email Configuration

- SMTP settings (host, port, username, password)
- Email signature editor
- Default email templates:
  - Interview invitation
  - Application received
  - Rejection email
  - Offer letter
  - Follow-up reminder
- Template variables: `{{candidateName}}`, `{{jobTitle}}`, etc.

#### System Settings

- Pipeline stage customization (add/remove/reorder)
- Default workflow settings
- Data retention policies
- Export/import configurations

#### Integrations

- LinkedIn integration toggle
- Calendar sync (Google/Outlook)
- Slack notifications
- Webhook configuration

#### UI Structure

```tsx
<Tabs defaultValue="profile">
  <TabsList>
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="email">Email</TabsTrigger>
    <TabsTrigger value="system">System</TabsTrigger>
    <TabsTrigger value="integrations">Integrations</TabsTrigger>
  </TabsList>
  {/* Tab contents */}
</Tabs>
```

**Estimated Time:** 3-4 hours

---

### 6.3 Analytics Dashboard (MEDIUM-HIGH PRIORITY)

**Current Status:** ❌ Empty placeholder

**Required Metrics:**

#### Recruitment Metrics

- Time-to-hire average (days from job posted to offer accepted)
- Time-to-fill (days from job posted to position filled)
- Applications per job
- Candidate conversion rates (applied → interviewed → offered → hired)

#### Source Analytics

- Applications by source (LinkedIn, referral, website, etc.)
- Source effectiveness (conversion rate by source)
- Top performing sources

#### Pipeline Analytics

- Candidates by stage (funnel chart)
- Stage conversion rates
- Average time in each stage
- Drop-off analysis

#### Team Performance

- Applications reviewed per recruiter
- Time to first response
- Interview completion rate
- Offers made vs accepted

#### Charts Needed

- Area chart for trends over time
- Funnel chart for pipeline conversion
- Bar chart for source comparison
- Pie chart for status distribution

**UI Structure:**

```tsx
<div className="space-y-6">
  {/* Date Range Selector */}
  <DateRangePicker />

  {/* Key Metrics Cards */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <MetricCard title="Time to Hire" value="24 days" trend="-3 days" />
    {/* More metric cards */}
  </div>

  {/* Charts */}
  <Card>
    <CardHeader>
      <CardTitle>Hiring Funnel</CardTitle>
    </CardHeader>
    <CardContent>
      <FunnelChart />
    </CardContent>
  </Card>
</div>
```

**Estimated Time:** 4-5 hours

---

### 6.4 Team Management (MEDIUM PRIORITY)

**Current Status:** 🟡 Generic table only

**Required Additions:**

#### Team Member Schema

```typescript
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "recruiter" | "hiring_manager" | "interviewer" | "viewer";
  department?: string;
  permissions: Permission[];
  assignedJobs: string[];
  statistics: {
    applicationsReviewed: number;
    interviewsConducted: number;
    offersExtended: number;
    hires: number;
  };
  status: "active" | "inactive";
  createdAt: Date;
  lastActive: Date;
}
```

#### UI Features

- Team member data table
- Add/edit/delete team members
- Role assignment with permission matrix
- Job assignment UI
- Performance statistics per member
- Activity timeline

**Estimated Time:** 2-3 hours

---

### 6.5 Global Search (MEDIUM PRIORITY)

**Current Status:** ❌ Empty placeholder

**Required Features:**

- Search across all entities (candidates, jobs, clients, applications)
- Real-time search with debounce
- Type-ahead suggestions
- Filter by entity type
- Result highlighting
- Recent searches history
- Keyboard shortcuts (Cmd/Ctrl + K)

**UI Pattern:**

```tsx
<Command>
  <CommandInput placeholder="Search everything..." />
  <CommandList>
    <CommandGroup heading="Candidates">{/* Candidate results */}</CommandGroup>
    <CommandGroup heading="Jobs">{/* Job results */}</CommandGroup>
    <CommandGroup heading="Clients">{/* Client results */}</CommandGroup>
  </CommandList>
</Command>
```

**Estimated Time:** 3-4 hours

---

### 6.6 Other Missing Features

#### Messages/Chat (MEDIUM PRIORITY)

- Internal team communication
- Real-time chat interface
- Message threads
- File sharing
- @mentions

**Estimated Time:** 4-5 hours

#### Notifications (LOW-MEDIUM PRIORITY)

- Notification center
- Real-time updates
- Push notifications
- Email notifications
- Notification preferences

**Estimated Time:** 2-3 hours

#### Account Management (LOW PRIORITY)

- Profile editing
- Security settings
- Session management
- Activity log

**Estimated Time:** 2-3 hours

#### Help/Documentation (LOW PRIORITY)

- User guides
- Video tutorials
- FAQs
- Support contact

**Estimated Time:** 3-4 hours

---

## 7. Development Roadmap

### Phase 1: Email Integration (Week 1)

**Priority:** HIGH | **Time:** 2-3 hours

**Tasks:**

1. Add email tab to `JobDetails` component
2. Add email tab to candidate detail drawer
3. Wire up `CandidateEmailCommunication` component
4. Connect email history data from candidates JSON
5. Test email workflows (compose, reply, archive)

**Deliverables:**

- Fully functional email interface in Jobs and Candidates pages
- Email history display
- Send/reply capabilities (with toast confirmations)

---

### Phase 2: Settings Implementation (Week 1-2)

**Priority:** HIGH | **Time:** 3-4 hours

**Tasks:**

1. Create tabbed Settings layout
2. Build Profile settings tab
3. Create Email templates editor
4. Add SMTP configuration UI
5. Implement System settings
6. Add Integration toggles

**Deliverables:**

- Complete Settings page with 4 tabs
- Email template management system
- Configurable system preferences

---

### Phase 3: Analytics Dashboard (Week 2-3)

**Priority:** MEDIUM-HIGH | **Time:** 4-5 hours

**Tasks:**

1. Create metric calculation functions
2. Build key metrics cards
3. Implement time-to-hire analytics
4. Create funnel chart for pipeline
5. Add source effectiveness analysis
6. Build team performance section
7. Add date range filters
8. Implement export functionality

**Deliverables:**

- Comprehensive analytics dashboard
- Interactive charts with drill-down
- Exportable reports

---

### Phase 4: Team Management Enhancement (Week 3)

**Priority:** MEDIUM | **Time:** 2-3 hours

**Tasks:**

1. Define TeamMember schema and types
2. Create team mock data (8-10 members)
3. Build team-specific data table
4. Create add/edit team member modals
5. Implement role/permission matrix
6. Add job assignment interface
7. Display team statistics

**Deliverables:**

- Fully functional team management page
- Role-based permissions UI
- Team performance tracking

---

### Phase 5: Enhanced Features (Week 4-5)

**Priority:** MEDIUM | **Time:** 8-12 hours

**Global Search (3-4 hours):**

- Implement Command K interface
- Add search across all entities
- Create result highlighting
- Add keyboard shortcuts

**Messages/Chat (4-5 hours):**

- Build chat interface
- Implement message threads
- Add file attachments
- Create @mentions system

**Notifications (2-3 hours):**

- Build notification center
- Add real-time updates
- Implement notification preferences

---

### Phase 6: Polish & Optimization (Week 6)

**Priority:** LOW-MEDIUM | **Time:** 4-6 hours

**Tasks:**

1. Complete Account management page
2. Create Help/Documentation center
3. Add loading states everywhere
4. Implement error boundaries
5. Optimize performance (memoization, lazy loading)
6. Add animations/transitions
7. Accessibility audit (ARIA labels, keyboard nav)
8. Mobile responsiveness testing

**Deliverables:**

- All pages completed
- Polished user experience
- Production-ready application

---

## 8. Best Practices & Guidelines

### 8.1 Code Organization

**File Naming:**

- Components: `kebab-case.tsx` (e.g., `client-card.tsx`)
- Types: `kebab-case.ts` (e.g., `client.ts`)
- Utilities: `kebab-case.ts` (e.g., `pipeline-helpers.ts`)

**Component Structure:**

```tsx
// 1. Imports (React, libraries, components, types, utils)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types/client";
import { cn } from "@/lib/utils";

// 2. Type definitions
interface ComponentProps {
  // Props
}

// 3. Constants (outside component)
const STATUS_COLORS = { ... };

// 4. Component
export function ComponentName({ prop }: ComponentProps) {
  // 4a. State
  const [state, setState] = useState();

  // 4b. Derived values
  const computed = useMemo(() => ..., [deps]);

  // 4c. Handlers
  const handleAction = () => { ... };

  // 4d. Effects
  useEffect(() => { ... }, [deps]);

  // 4e. Render
  return ( ... );
}
```

---

### 8.2 State Management

**Current Approach:** Local state with `useState`

**When to Use:**

- `useState` - Component-local state, form inputs
- `useMemo` - Expensive calculations, filtered/sorted data
- `useCallback` - Event handlers passed to children
- `useEffect` - Side effects (API calls, subscriptions)

**For Future Consideration:**

- Context API for global state (auth, theme)
- React Query for server state management
- Zustand for complex client state

---

### 8.3 Performance Optimization

**Current Patterns:**

- Debounced search inputs
- Pagination for large datasets
- Virtualization for long lists (TanStack Virtual)
- Lazy loading images
- Code splitting by route

**To Implement:**

- `React.memo` for expensive components
- `useMemo` for filtered/sorted data
- `useCallback` for event handlers
- Lazy loading for modals/drawers
- Image optimization (WebP, lazy load)

---

### 8.4 Accessibility

**Current Implementation:**

- Semantic HTML (`<button>`, `<nav>`, `<main>`)
- ARIA labels on icons
- Keyboard navigation (Radix UI)
- Focus management in modals
- Color contrast ratios (WCAG AA)

**To Improve:**

- Screen reader testing
- Focus visible indicators
- ARIA live regions for notifications
- Skip navigation links
- Error message associations

---

### 8.5 Testing Strategy

**Recommended Approach:**

1. **Unit Tests** - Utility functions, helpers
2. **Component Tests** - Isolated component testing
3. **Integration Tests** - User workflows
4. **E2E Tests** - Critical paths (Playwright)

**Test Coverage Goals:**

- Utilities: 90%+
- Components: 70%+
- Pages: 50%+

---

## 9. Design System Rules

### DO's ✅

1. **Always use semantic color classes**

   ```tsx
   // Good
   <Badge className="bg-green-500/10 text-green-700">Active</Badge>

   // Bad
   <Badge className="bg-green-100 text-green-800">Active</Badge>
   ```

2. **Use consistent spacing scale**

   ```tsx
   gap - 2, gap - 4, gap - 6; // Not gap-3, gap-5
   px - 4, py - 4; // Consistent horizontal/vertical
   ```

3. **Maintain icon sizing consistency**

   ```tsx
   <Icon className="h-4 w-4" />  // Standard
   <Icon className="h-3 w-3" />  // Small (in badges)
   <Icon className="h-12 w-12" /> // Large (empty states)
   ```

4. **Use truncation for long text**

   ```tsx
   <span className="line-clamp-1">...</span>
   <span className="truncate">...</span>
   ```

5. **Add hover states to interactive elements**

   ```tsx
   hover:shadow-lg transition-all duration-200
   ```

6. **Use Radix UI components for complex interactions**

   - Dropdowns, Dialogs, Selects, Tooltips

7. **Keep color palette limited**

   - Primary (sky blue), Accent (green), Destructive (red)
   - Status colors (green, yellow, orange, red, gray, blue)

8. **Use responsive grid patterns**
   ```tsx
   grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4
   ```

---

### DON'Ts ❌

1. **Don't use arbitrary color values**

   ```tsx
   // Bad
   className = "bg-[#ff0000]";

   // Good
   className = "bg-destructive";
   ```

2. **Don't mix icon libraries unnecessarily**

   - Use Lucide React for UI
   - Use Tabler Icons only for data tables

3. **Don't create inline styles**

   ```tsx
   // Bad
   style={{ marginTop: "20px" }}

   // Good
   className="mt-5"
   ```

4. **Don't skip loading/error states**

   - Always show skeleton loaders
   - Display error messages with retry options

5. **Don't hardcode data in components**

   - Use mock data imports
   - Pass data as props

6. **Don't ignore TypeScript errors**

   - Fix type issues immediately
   - Use `unknown` over `any`

7. **Don't create overly complex components**

   - Break into smaller components at ~200 lines
   - Extract reusable logic to hooks

8. **Don't forget dark mode considerations**
   - Use `dark:` variants
   - Test in both themes

---

## 10. Quick Reference

### Color Variables Quick Lookup

```css
bg-background         /* Page background */
text-foreground       /* Primary text */
bg-card               /* Card background */
text-muted-foreground /* Secondary text */
border-border         /* Dividers */
bg-primary            /* Action buttons */
bg-accent             /* Success/highlights */
bg-destructive        /* Errors/delete */
```

### Common Class Combinations

```tsx
/* Interactive card */
"cursor-pointer hover:shadow-lg transition-all duration-200";

/* Page section */
"flex flex-col gap-4 py-4 md:gap-6 md:py-6";

/* Container */
"px-4 lg:px-6";

/* Flex header */
"flex items-center justify-between mb-6";

/* Text truncation */
"line-clamp-1"; // or "truncate"

/* Badge */
"bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
```

### Component Import Paths

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/types/client";
import clientsData from "@/lib/mock-data/clients.json";
import { cn } from "@/lib/utils";
```

---

## Appendix: File Structure

```
src/
├── components/           # Reusable components
│   ├── ui/              # Shadcn/Radix primitives
│   ├── modals/          # Modal dialogs
│   ├── *-card.tsx       # Entity card components
│   ├── *-details.tsx    # Entity detail views
│   └── *-data-table.tsx # Data table components
├── pages/               # Route pages
│   ├── dashboard/       # Dashboard routes
│   ├── auth/           # Authentication
│   └── home/           # Landing page
├── types/              # TypeScript definitions
├── lib/                # Utilities
│   ├── mock-data/      # JSON mock data
│   └── *.ts           # Helper functions
├── hooks/              # Custom React hooks
└── app/               # App configuration

Total Files: ~100
Total Lines: ~15,000
Mock Data Records: 38
```

---

**End of Document**

For questions or updates, refer to this document before making design/architectural decisions.
