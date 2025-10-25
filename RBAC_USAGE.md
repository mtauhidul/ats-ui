# RBAC Usage Guide

## Quick Reference for Using Role-Based Access Control

### Import Components

```typescript
import { RequireRole, RequirePermission } from "@/components/auth/require-role";
import { useUserRole, useUserInfo, useHasPermission } from "@/lib/auth";
```

## Common Usage Examples

### 1. Hide/Show UI Elements by Role

```tsx
// Show button only for admins
<RequireRole role="admin">
  <Button>Delete Client</Button>
</RequireRole>

// Show for multiple roles
<RequireRole roles={["admin", "recruiter"]}>
  <Button>Create Job</Button>
</RequireRole>

// With fallback content
<RequireRole 
  role="admin" 
  fallback={<p>You need admin access</p>}
>
  <SettingsPanel />
</RequireRole>
```

### 2. Hide/Show UI Elements by Permission

```tsx
// Show button only if user has permission
<RequirePermission permission="clients.delete">
  <DeleteButton />
</RequirePermission>

// Require ANY of these permissions
<RequirePermission permissions={["jobs.create", "jobs.edit"]}>
  <JobForm />
</RequirePermission>

// Require ALL of these permissions
<RequirePermission 
  permissions={["jobs.create", "jobs.publish"]} 
  requireAll={true}
>
  <PublishJobButton />
</RequirePermission>
```

### 3. Use in Components with Hooks

```tsx
function JobCard({ job }: { job: Job }) {
  const role = useUserRole();
  const { isAdmin, isRecruiter } = useUserInfo();
  const canEdit = useHasPermission("jobs.edit");
  
  return (
    <Card>
      <h3>{job.title}</h3>
      
      {canEdit && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
      
      {isAdmin && (
        <Button variant="destructive">Delete</Button>
      )}
      
      {(isAdmin || isRecruiter) && (
        <Badge>Priority: {job.priority}</Badge>
      )}
    </Card>
  );
}
```

### 4. Conditional Rendering in Lists

```tsx
function Navigation() {
  const role = useUserRole();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", roles: ["admin", "recruiter", "hiring_manager", "viewer"] },
    { name: "Clients", href: "/clients", roles: ["admin", "recruiter"] },
    { name: "Jobs", href: "/jobs", roles: ["admin", "recruiter", "hiring_manager"] },
    { name: "Settings", href: "/settings", roles: ["admin"] },
  ];
  
  return (
    <nav>
      {navItems
        .filter(item => item.roles.includes(role))
        .map(item => (
          <Link key={item.name} to={item.href}>
            {item.name}
          </Link>
        ))}
    </nav>
  );
}
```

### 5. Get User Information

```tsx
function UserProfile() {
  const { 
    email, 
    fullName, 
    role, 
    isAdmin,
    imageUrl 
  } = useUserInfo();
  
  return (
    <div>
      <img src={imageUrl} alt={fullName} />
      <h2>{fullName}</h2>
      <p>{email}</p>
      <Badge>{role}</Badge>
      {isAdmin && <Badge variant="destructive">Admin</Badge>}
    </div>
  );
}
```

### 6. Complex Permission Logic

```tsx
function ApplicationCard({ application }: { application: Application }) {
  const canReview = useHasPermission("applications.review");
  const canApprove = useHasPermission("applications.approve");
  const canReject = useHasPermission("applications.reject");
  
  return (
    <Card>
      <h3>{application.candidateName}</h3>
      
      <div className="flex gap-2">
        {canReview && (
          <Button variant="outline" onClick={handleReview}>
            Review
          </Button>
        )}
        
        {canApprove && (
          <Button variant="default" onClick={handleApprove}>
            Approve
          </Button>
        )}
        
        {canReject && (
          <Button variant="destructive" onClick={handleReject}>
            Reject
          </Button>
        )}
      </div>
    </Card>
  );
}
```

### 7. Form Access Control

```tsx
function JobForm({ job }: { job?: Job }) {
  const canCreate = useHasPermission("jobs.create");
  const canEdit = useHasPermission("jobs.edit");
  const canPublish = useHasPermission("jobs.publish");
  
  if (!canCreate && !job) {
    return <div>You don't have permission to create jobs</div>;
  }
  
  if (!canEdit && job) {
    return <div>You don't have permission to edit jobs</div>;
  }
  
  return (
    <form>
      {/* Form fields */}
      
      <RequirePermission permission="jobs.publish">
        <Button type="submit" onClick={handlePublish}>
          Publish Job
        </Button>
      </RequirePermission>
      
      <Button type="submit">
        {job ? 'Update' : 'Create'} Draft
      </Button>
    </form>
  );
}
```

## Available Roles

- `admin` - Full system access
- `recruiter` - Manage clients, jobs, candidates
- `hiring_manager` - Review candidates and applications
- `viewer` - Read-only access

## Available Permissions

### Clients
- `clients.view`
- `clients.create`
- `clients.edit`
- `clients.delete`

### Jobs
- `jobs.view`
- `jobs.create`
- `jobs.edit`
- `jobs.delete`
- `jobs.publish`

### Candidates
- `candidates.view`
- `candidates.create`
- `candidates.edit`
- `candidates.delete`
- `candidates.import`
- `candidates.export`

### Applications
- `applications.view`
- `applications.review`
- `applications.approve`
- `applications.reject`

### Interviews
- `interviews.view`
- `interviews.schedule`
- `interviews.edit`
- `interviews.cancel`

### Team
- `team.view`
- `team.invite`
- `team.edit`
- `team.remove`

### Settings
- `settings.view`
- `settings.edit`

### Analytics
- `analytics.view`
- `analytics.export`

## Best Practices

1. **Use Permissions over Roles** when possible for granular control
2. **Fail Secure** - Default to hiding/disabling if unsure
3. **Show Feedback** - Tell users why they can't access something
4. **Test All Roles** - Verify each role sees the correct UI
5. **Server-Side Validation** - Always validate permissions on backend too

## Role Labels

Use `ROLE_LABELS` for display:

```tsx
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/auth";

<Select>
  {Object.entries(ROLE_LABELS).map(([value, label]) => (
    <SelectItem key={value} value={value}>
      {label}
    </SelectItem>
  ))}
</Select>
```

---

For more details, check:
- `src/lib/auth.ts` - All hooks and utilities
- `src/components/auth/require-role.tsx` - UI components
- `CLERK_SETUP.md` - Authentication setup guide
