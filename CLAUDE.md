# ATS UI Project - Claude Development Guide

## Project Overview
**Applicant Tracking System (ATS) for Arista Groups**
- Modern recruitment management system
- Built with React 19, TypeScript, and Tailwind CSS 4
- Uses Shadcn UI (Radix-based components)

## Tech Stack

### Frontend
- **Framework:** React 19.2.0 + TypeScript
- **Build Tool:** Vite 7.1.10
- **Styling:** Tailwind CSS 4.1.14
- **UI Components:** Shadcn UI (Radix UI primitives)
- **Routing:** React Router DOM 7.9.4
- **Tables:** TanStack Table 8.21.3
- **Charts:** Recharts 2.15.4
- **Drag & Drop:** @dnd-kit 6.3.1
- **Icons:** Lucide React + Tabler Icons
- **Forms:** React Hook Form + Zod 4.1.12
- **Notifications:** Sonner 2.0.7
- **Theme:** next-themes 0.4.6

### Backend (Planned)
- **Framework:** Node.js + Express
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **AI:** OpenAI GPT-4 API
- **Email:** Nodemailer + IMAP

## Build Commands

```bash
# Development
npm run dev                    # Start Vite dev server (port 5173)
npm run server                 # Start JSON server (port 3001)
npm run dev:all                # Start both dev server and JSON server

# Production
npm run build                  # TypeScript check + Vite build
npm run preview                # Preview production build
npm run lint                   # ESLint check
```

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components (Radix-based)
│   ├── modals/                # Modal components
│   └── [feature-components]   # Business logic components
├── pages/
│   ├── dashboard/             # Main app pages
│   │   ├── index.tsx         # Dashboard home
│   │   ├── clients/          # Client management
│   │   ├── jobs/             # Job postings
│   │   ├── applications/     # Application review
│   │   ├── candidates/       # Candidate management
│   │   ├── analytics/        # Analytics dashboard
│   │   ├── team/             # Team management
│   │   ├── settings/         # Settings
│   │   └── ...
│   ├── auth/                  # Authentication pages
│   └── home/                  # Landing page
├── types/                     # TypeScript type definitions
│   ├── common.ts
│   ├── client.ts
│   ├── job.ts
│   ├── application.ts
│   ├── candidate.ts
│   ├── team.ts
│   ├── interview.ts
│   └── ...
├── lib/
│   ├── mock-data/             # Mock JSON data
│   │   ├── clients.json
│   │   ├── jobs.json
│   │   ├── applications.json
│   │   ├── candidates.json
│   │   ├── team.json
│   │   └── interviews.json
│   ├── utils.ts               # Utility functions (cn, etc.)
│   └── helpers/               # Helper functions
├── hooks/                     # Custom React hooks
├── App.tsx                    # App router configuration
└── main.tsx                   # Entry point
```

## Code Style & Conventions

### TypeScript
- **Strict mode enabled**
- Use `interface` for object types
- Use `type` for unions, intersections
- Export types from dedicated files in `/types`
- Use `as const` for enum-like objects

```typescript
// Good
export const JobStatus = {
  DRAFT: "draft",
  OPEN: "open",
  CLOSED: "closed",
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export interface Job extends BaseEntity {
  title: string;
  status: JobStatus;
  // ...
}
```

### Components
- **Functional components with hooks**
- Use `export default` for page components
- Use named exports for reusable components
- Keep components in dedicated files

```typescript
// Page component (default export)
export default function DashboardPage() {
  return <div>...</div>;
}

// Reusable component (named export)
export function ClientCard({ client }: { client: Client }) {
  return <Card>...</Card>;
}
```

### Styling
- **Use Tailwind CSS classes**
- Use `cn()` utility for conditional classes
- Follow Shadcn UI patterns
- Dark mode support via `dark:` prefix

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-lg border p-4",
  isActive && "bg-primary text-primary-foreground",
  className
)} />
```

### File Naming
- **Components:** PascalCase - `ClientCard.tsx`
- **Pages:** kebab-case - `candidate-details.tsx` or PascalCase for index
- **Utils:** camelCase - `formatDate.ts`
- **Types:** PascalCase - `Client.ts`, `Job.ts`
- **Constants:** UPPER_SNAKE_CASE

### Import Order
1. React & React libraries
2. Third-party libraries
3. UI components
4. Custom components
5. Types
6. Utils & helpers
7. Data & constants

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ClientCard } from "@/components/client-card";
import type { Client } from "@/types/client";
import { cn } from "@/lib/utils";
import clientsData from "@/lib/mock-data/clients.json";
```

## State Management
- **useState** for local component state
- **Context API** for shared state (planned)
- No Redux/Zustand (keeping it simple)

## Data Flow

### Current (Mock Data)
```
Component → Import JSON → Transform → Display
```

### Planned (Backend Integration)
```
Component → API Service → Backend API → Firestore → Response → Display
```

## Key Features Implemented

### ✅ Completed Pages
1. **Applications** - Full approve/reject workflow with modals
2. **Candidates** - List with proper data transformation
3. **Candidate Details** - Comprehensive profile with interview history
4. **Analytics** - Dashboard with 6 charts and metrics
5. **Team Management** - Team members with roles and statistics
6. **Clients** - Full CRUD operations
7. **Jobs** - Full CRUD with pipeline link
8. **Pipeline** - Drag-drop Kanban board
9. **Categories & Tags** - Management pages
10. **Settings** - Email templates

### 🚧 In Progress
- Account page
- Complete settings tabs
- Search functionality
- Notifications center
- Messages

### ❌ Missing
- Backend API integration
- Authentication flow (UI exists)
- Email automation
- File uploads
- Real-time updates

## Data Models

### Key Collections
- **clients** - External companies hiring through Arista Groups
- **jobs** - Job openings from clients
- **applications** - Initial submissions (before approval)
- **candidates** - Approved applicants (after review)
- **team** - Internal team members
- **interviews** - Interview records (tracks client-candidate history)
- **categories** - Job/candidate categorization
- **tags** - Flexible tagging system

### Critical Relationships
```
Client (1) → (N) Jobs
Job (1) → (N) Candidates (after approval)
Application (independent) → (convert to) Candidate
Candidate (N) → (N) Interviews → (1) Client
```

## Business Logic

### Application Workflow
1. Email arrives at resumes@aristagroups.com
2. Backend parses resume (OpenAI)
3. Creates Application (status: pending)
4. Admin reviews in UI
5. Approve → Creates Candidate + Assigns to Job
6. Reject → Archived with reason

### Interview Tracking
- **Purpose:** Prevent re-submitting same candidate to same client
- Records every interview a candidate has with each client
- Shows warning if candidate previously interviewed with client
- Tracks outcome (passed/failed/no-show)

## Mock Data

All mock data is in `src/lib/mock-data/*.json`:
- `clients.json` - 5 client companies
- `jobs.json` - 10+ job postings
- `applications.json` - 38 applications
- `candidates.json` - 12 candidates
- `team.json` - 7 team members
- `interviews.json` - 8 interview records
- `categories.json` - Category tags
- `tags.json` - General tags

## Common Issues & Solutions

### TypeScript Errors
```bash
# Check for errors
npm run build

# Common fixes:
# 1. Import missing types
# 2. Add `as const` to enums
# 3. Use optional chaining: obj?.property
# 4. Define proper interfaces
```

### Component Not Found
```typescript
// Make sure Shadcn UI component exists
// If missing, create it in src/components/ui/

// Example: Textarea
import { Textarea } from "@/components/ui/textarea";
```

### Import Aliases
- `@/*` maps to `src/*`
- Configured in `vite.config.ts` and `tsconfig.json`

## Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Heroku) - Planned
```bash
heroku create ats-backend
git push heroku main
```

## Environment Variables

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...

# Backend (.env) - Planned
NODE_ENV=production
FIREBASE_CREDENTIALS=...
OPENAI_API_KEY=...
JWT_SECRET=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

## Testing Strategy (Planned)

- **Unit Tests:** Jest + React Testing Library
- **Integration Tests:** Testing API endpoints
- **E2E Tests:** Playwright
- **Current:** Manual testing with mock data

## Performance Considerations

- **Code splitting:** React.lazy() for routes
- **Virtualization:** For large lists (TanStack Virtual)
- **Memoization:** useMemo, useCallback where needed
- **Image optimization:** Use Next/Image patterns
- **Bundle size:** Check with `npm run build`

## Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Color contrast (WCAG AA)

## Documentation

- **Project Plan:** `ATS_MASTER_PLAN.md`
- **API Docs:** (To be created with Swagger)
- **Component Docs:** (Consider Storybook)
- **This Guide:** `CLAUDE.md`

## Git Workflow

```bash
# Branch naming
feature/add-search-page
fix/candidate-data-transform
refactor/api-service-layer

# Commit messages
feat: add interview history to candidate details
fix: correct data transformation in candidates page
refactor: extract API service layer
docs: update CLAUDE.md with conventions
```

## Quick Start for Claude

When starting a new session:
1. Read this file (CLAUDE.md)
2. Check `ATS_MASTER_PLAN.md` for context
3. Look at recent commits: `git log --oneline -10`
4. Check current branch: `git branch`
5. Run dev server: `npm run dev`
6. Check build: `npm run build`

## Contact & Support

- **Developer:** Mir Tauhid
- **Company:** Arista Groups
- **Project Start:** October 2024
- **Target Completion:** 8 weeks from start

---

**Last Updated:** 2025-10-25
**Version:** 2.0.0-beta
**Status:** Active Development
