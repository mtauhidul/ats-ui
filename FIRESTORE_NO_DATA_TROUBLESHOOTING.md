# 🔍 Firestore Realtime - Troubleshooting "No Data Showing"

## Problem

After migrating to Firestore realtime subscriptions, no data is showing for Jobs, Applications, Candidates, or Clients.

---

## Root Cause Analysis

There are 3 possible causes:

### 1. **No Data in Firestore** (Most Likely)
- Firestore database is empty
- Data hasn't been migrated from old system
- Backend is still using old database

### 2. **Wrong Collection Path**
- Frontend looking at wrong company ID
- Path mismatch between frontend/backend
- Firestore Security Rules blocking access

### 3. **Connection Issues**
- Firebase configuration incorrect
- Authentication not working
- Network/firewall blocking Firestore

---

## 🔬 Diagnosis Steps

### Step 1: Add Debug Component

Add this to your dashboard layout to see realtime debug info:

```tsx
// In your dashboard layout (e.g., App.tsx or DashboardLayout.tsx)
import { FirestoreDebug } from '@/components/FirestoreDebug';

// Add near the bottom of your component
<FirestoreDebug />
```

This will show:
- ✅ Company ID being used
- ✅ Firebase project connected to
- ✅ Count of documents in each collection
- ✅ Loading states
- ✅ Any errors

### Step 2: Check Browser Console

Open DevTools → Console and look for:

```
🏢 Building Firestore path: companies/default-company/jobs
📊 Firestore realtime update: companies/default-company/jobs (0 documents)
```

**If you see "0 documents"** → Firestore is empty (most likely issue)

**If you see errors** → Check the error message:
- `permission-denied` → Firestore rules issue
- `not-found` → Collection doesn't exist
- `unavailable` → Network/connection issue

### Step 3: Check Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click "Firestore Database" in left sidebar
4. Check if you see this structure:

```
companies/
  └── default-company/
      ├── jobs/
      │   └── (should have documents here)
      ├── applications/
      │   └── (should have documents here)
      ├── candidates/
      │   └── (should have documents here)
      └── clients/
          └── (should have documents here)
```

**If empty** → You need to seed data (see solutions below)

### Step 4: Check Firestore Rules

In Firebase Console → Firestore Database → Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{companyId}/{collection}/{document=**} {
      // For testing, temporarily allow all reads
      allow read: if true;
      
      // For production, use proper authentication:
      // allow read: if request.auth != null;
      
      allow write: if false; // Writes go through API
    }
  }
}
```

**Publish rules** after changing.

---

## ✅ Solutions

### Solution 1: Seed Data from Backend API

If you have data in the old system (MongoDB or elsewhere), use the backend API to create a few test records:

```bash
cd ats-backend

# Test creating a job via API
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Job",
    "description": "Test Description",
    "status": "open",
    "jobType": "full-time"
  }'
```

Then check Firestore Console - you should see the job appear in:
`companies/default-company/jobs/`

### Solution 2: Direct Firestore Seeding Script

Create test data directly in Firestore:

```typescript
// ats-backend/scripts/seed-firestore-data.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  fs.readFileSync('./firebase_config.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const companyId = 'default-company';

async function seedData() {
  console.log('🌱 Seeding Firestore data...');

  // Seed Jobs
  const jobsRef = db.collection(`companies/${companyId}/jobs`);
  await jobsRef.add({
    title: 'Senior Software Engineer',
    description: 'Looking for an experienced engineer...',
    status: 'open',
    jobType: 'full-time',
    workMode: 'remote',
    location: {
      city: 'San Francisco',
      country: 'USA'
    },
    salary: {
      min: 120000,
      max: 180000,
      currency: 'USD'
    },
    requirements: ['5+ years experience', 'React', 'Node.js'],
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Seed Clients
  const clientsRef = db.collection(`companies/${companyId}/clients`);
  await clientsRef.add({
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    contactPerson: 'John Doe',
    phone: '+1234567890',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Seed Candidates
  const candidatesRef = db.collection(`companies/${companyId}/candidates`);
  await candidatesRef.add({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+1234567890',
    resume: 'https://example.com/resume.pdf',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seedData().catch(console.error);
```

Run it:

```bash
cd ats-backend
npx tsx scripts/seed-firestore-data.ts
```

### Solution 3: Use Existing Backend Endpoints

If your backend already has data in the old database, the dual-write middleware should write to Firestore automatically when you:

1. **View a page** - GET requests should trigger background sync
2. **Create new data** - POST requests write to Firestore
3. **Update data** - PUT requests write to Firestore

To force a sync, simply:
- Open the admin dashboard
- Navigate to Jobs page (triggers GET /api/jobs)
- Backend should write to Firestore
- Check Firestore Console to confirm

---

## 🔍 Advanced Debugging

### Check Network Tab

Open DevTools → Network tab → Filter by "firebase":

You should see WebSocket connections like:
```
wss://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel
```

**If you don't see WebSocket connections** → Firestore client not connecting

### Check Firebase Config

Verify your Firebase config is correct:

```typescript
// ats-ui/src/config/firebase.ts
const firebaseConfig = {
  apiKey: "...",  // Should not be empty
  authDomain: "...",
  projectId: "...", // Should match Firebase Console
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Make sure `.env` file has correct values:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

### Test Direct Firestore Access

Create a test page:

```tsx
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

function TestFirestore() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    async function test() {
      const ref = collection(db, 'companies/default-company/jobs');
      const snapshot = await getDocs(ref);
      console.log('Documents found:', snapshot.size);
      setData(snapshot.docs.map(d => d.data()));
    }
    test();
  }, []);
  
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

---

## 📋 Checklist

Before asking for help, verify:

- [ ] Firebase project ID in `.env` matches Firebase Console
- [ ] Firestore database exists and is not empty
- [ ] Firestore rules allow read access
- [ ] Browser console shows no Firestore errors
- [ ] Network tab shows WebSocket connections to Firestore
- [ ] Debug component shows correct company ID
- [ ] Backend is configured with same company ID
- [ ] Authentication is working (user is logged in)

---

## 🎯 Quick Fix

**Most likely you just need to seed data!**

The easiest fix:

1. **Via Firebase Console** (Manual):
   - Go to Firestore Database
   - Click "Start collection"
   - Enter path: `companies/default-company/jobs`
   - Add a document with fields: `title`, `description`, `status`, `createdAt`
   - Refresh your app - data should appear instantly!

2. **Via Backend API** (Recommended):
   - Create a job/client/candidate via your admin dashboard
   - Backend will write to Firestore automatically
   - Data should appear in realtime

---

## 🆘 Still Not Working?

Check these in order:

1. **Console Errors?** → Fix the error first
2. **Data in Firestore?** → Seed data (see above)
3. **Firestore Rules?** → Allow read access
4. **Company ID mismatch?** → Check backend DEFAULT_COMPANY_ID matches frontend
5. **Network issues?** → Check firewall/VPN
6. **Auth issues?** → Make sure user is logged in

---

## 📊 Expected Behavior

**When working correctly:**

1. Open dashboard → Loading spinner briefly → Data appears
2. Open 2nd window → Create job in window 1 → Appears automatically in window 2
3. Console shows: `📊 Firestore realtime update: companies/default-company/jobs (X documents)`
4. Debug component shows count > 0 for all collections
5. No errors in console

**This is real-time data sync!** 🎉
