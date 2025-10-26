# Schema Alignment Report
**Generated:** October 26, 2025
**Status:** ⚠️ Critical Mismatches Found

---

## 🔴 Critical Mismatches (Breaking Issues)

### 1. **Client Model** ⚠️ HIGH PRIORITY

**Issue:** Field name mismatch for company name

| Frontend Type | Backend Model | Status |
|--------------|---------------|--------|
| `companyName: string` | `name: string` | ❌ MISMATCH |

**Impact:** 
- Client creation will fail
- Client data won't display correctly
- API calls will return incomplete data

**Frontend Location:** `src/types/client.ts` (line 103)
**Backend Location:** `ats-backend/src/models/Client.ts` (line 3)

**Solution Options:**
1. **Change Backend:** Rename `name` → `companyName` in model
2. **Change Frontend:** Rename `companyName` → `name` in types
3. **Add Alias:** Transform in controller (map between names)

**Recommended:** Change backend to use `companyName` for consistency

---

### 2. **Job Type Enum** ⚠️ MEDIUM PRIORITY

**Issue:** Enum value format mismatch

| Frontend (src/types/job.ts) | Backend (models/Job.ts) | Status |
|-----------------------------|-------------------------|--------|
| `"full_time"` | `"full-time"` | ❌ MISMATCH |
| `"part_time"` | `"part-time"` | ❌ MISMATCH |

**Impact:**
- Job creation with frontend types will fail validation
- Job type filters won't work correctly

**Solution:** Standardize on one format (recommend kebab-case: `full-time`)

---

### 3. **Job Status Enum** ⚠️ MEDIUM PRIORITY

**Issue:** Different status values

| Frontend | Backend | Match |
|----------|---------|-------|
| `"draft"` | `"draft"` | ✅ |
| `"open"` | `"open"` | ✅ |
| `"on_hold"` | `"on-hold"` | ❌ |
| `"closed"` | `"closed"` | ✅ |
| `"cancelled"` | Not in backend | ❌ |

**Impact:** Jobs with `on_hold` or `cancelled` status won't work

---

### 4. **Location Type Enum** ⚠️ LOW PRIORITY

**Issue:** Different naming conventions

| Frontend | Backend | Match |
|----------|---------|-------|
| `"remote"` | `"remote"` | ✅ |
| `"onsite"` | `"on-site"` | ❌ |
| `"hybrid"` | `"hybrid"` | ✅ |

---

## ✅ Matching Schemas

### Candidate Model
- ✅ Field names match
- ✅ Structure compatible
- ✅ Nested objects aligned

### Application Model
- ✅ Core fields match
- ✅ Status enum aligned

### Interview Model
- ✅ Schema matches

### Email Model
- ✅ Schema matches

### Notification Model (NEW)
- ✅ Perfectly aligned (just created)

### Message Model (NEW)
- ✅ Perfectly aligned (just created)

---

## 📊 Field Comparison Details

### Client: Frontend vs Backend

```typescript
// FRONTEND (src/types/client.ts)
interface Client {
  companyName: string;     // ❌ MISMATCH
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  industry: Industry;
  companySize: CompanySize;
  status: ClientStatus;
  address: { /* ... */ };
  description?: string;
  contacts: ContactPerson[];
}

// BACKEND (models/Client.ts)
interface IClient {
  name: string;            // ❌ Should be companyName
  industry?: string;       // ⚠️ Optional vs Required
  website?: string;
  logo?: string;
  contactPerson?: string;  // ⚠️ Different structure
  contactEmail?: string;   // ⚠️ Different from Frontend
  contactPhone?: string;
  address?: string;        // ⚠️ String vs Object
  notes?: string;
  isActive: boolean;
}
```

**Additional Mismatches:**
1. `address`: Backend uses `string`, Frontend uses `Address` object
2. `contacts`: Backend uses flat fields, Frontend uses array
3. `industry`: Backend optional, Frontend required (with enum)
4. `companySize`: Frontend has, Backend missing
5. `status`: Frontend has `ClientStatus` enum, Backend has `isActive` boolean

---

### Job: Frontend vs Backend

```typescript
// FRONTEND
jobType: "full_time" | "part_time" | "contract" | "freelance" | "internship" | "temporary"
locationType: "remote" | "onsite" | "hybrid"
status: "draft" | "open" | "on_hold" | "closed" | "cancelled"

// BACKEND
jobType: "full-time" | "part-time" | "contract" | "internship"  // Missing: freelance, temporary
locationType: "on-site" | "hybrid" | "remote"
status: "draft" | "open" | "closed" | "on-hold"  // Missing: cancelled
```

---

## 🔧 Recommended Fixes

### Priority 1: Client Model (Critical)

**Backend Changes Required:**

1. **Rename field:**
```typescript
// models/Client.ts
export interface IClient extends Document {
  companyName: string;  // Changed from 'name'
  // ... rest of fields
}
```

2. **Update schema:**
```typescript
const ClientSchema = new Schema<IClient>({
  companyName: {  // Changed from 'name'
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  // ... rest
});
```

3. **Update controller responses:**
- Ensure all client endpoints return `companyName` not `name`

### Priority 2: Job Enums (Important)

**Standardize on kebab-case:**

Frontend needs to change to:
```typescript
export const JobType = {
  FULL_TIME: "full-time",     // Changed from "full_time"
  PART_TIME: "part-time",     // Changed from "part_time"
  // ...
} as const;

export const JobStatus = {
  ON_HOLD: "on-hold",         // Changed from "on_hold"
  // ...
} as const;

export const WorkMode = {
  ONSITE: "on-site",          // Changed from "onsite"
  // ...
} as const;
```

---

## 🎯 Action Plan

### Immediate (Before Testing)
1. ✅ **Fix Client.companyName** - Change backend `name` → `companyName`
2. ✅ **Fix Job enums** - Align frontend/backend enum values
3. ✅ **Test client creation** - Verify data saves and retrieves correctly

### Short-term (This Week)
1. **Enhance Client model** - Add missing fields (companySize, status enum)
2. **Standardize address** - Use object structure consistently
3. **Add missing job types** - Add "freelance" and "temporary" to backend
4. **Add missing job status** - Add "cancelled" to backend

### Long-term (Next Sprint)
1. **Schema validation** - Add Zod or similar for runtime validation
2. **Type generation** - Generate frontend types from backend schemas
3. **Migration scripts** - Convert existing data to new schema

---

## 📋 Testing Checklist

After fixes, test these scenarios:

### Client Testing
- [ ] Create client with companyName
- [ ] Update client companyName
- [ ] Fetch client list - verify companyName appears
- [ ] Search/filter by companyName

### Job Testing
- [ ] Create job with "full-time" type
- [ ] Create job with "on-hold" status
- [ ] Create job with "on-site" location
- [ ] Verify enum validation works

### Candidate Testing
- [ ] Create candidate
- [ ] Link candidate to job
- [ ] Verify all fields save/retrieve correctly

---

## 🔍 Database Migration Notes

If you already have data in MongoDB:

### For Client name → companyName
```javascript
// MongoDB migration script
db.clients.updateMany(
  {},
  { $rename: { "name": "companyName" } }
)
```

### For Job enum values
```javascript
// Update job types
db.jobs.updateMany(
  { jobType: "full-time" },
  { $set: { jobType: "full_time" } }
)

// Update location types
db.jobs.updateMany(
  { locationType: "on-site" },
  { $set: { locationType: "onsite" } }
)

// Update status
db.jobs.updateMany(
  { status: "on-hold" },
  { $set: { status: "on_hold" } }
)
```

---

## 📊 Summary

**Total Mismatches Found:** 8
- 🔴 Critical: 3 (Client name, Job type, Job status)
- 🟡 Medium: 3 (Location type, Client structure, Missing fields)
- 🟢 Low: 2 (Optional field differences)

**Models Aligned:** 6 (Candidate, Application, Interview, Email, Notification, Message)
**Models with Issues:** 2 (Client, Job)

**Recommended Approach:** Fix backend to match frontend expectations, as frontend types are more comprehensive and detailed.
