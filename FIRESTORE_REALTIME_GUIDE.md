/**
 * FIRESTORE REAL-TIME IMPLEMENTATION GUIDE
 * 
 * This is the correct way to use Firestore - like your previous projects
 * No caching, no complex state management, just real-time subscriptions
 */

// EXAMPLE 1: Candidates Page with Real-Time Updates
// File: src/pages/dashboard/candidates/index.tsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 Setting up real-time candidates listener');
    
    // Create query
    const q = query(
      collection(db, 'candidates'),
      orderBy('createdAt', 'desc')
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('🔥 Candidates updated:', data.length);
        setCandidates(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching candidates:', error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up candidates listener');
      unsubscribe();
    };
  }, []); // Empty deps - subscription runs once

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Candidates ({candidates.length})</h1>
      {/* Your UI here - data updates automatically */}
    </div>
  );
}

// EXAMPLE 2: Jobs Page with Real-Time Updates
// File: src/pages/dashboard/jobs/index.tsx

export function JobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {/* Jobs automatically update when Firestore changes */}
      {jobs.map(job => <JobCard key={job.id} job={job} />)}
    </div>
  );
}

// EXAMPLE 3: Write to Firestore via Backend, UI Updates Automatically
import { authenticatedFetch } from '@/lib/authenticated-fetch';

async function createCandidate(data) {
  // Write via backend API
  await authenticatedFetch('/api/candidates', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  // NO NEED TO UPDATE UI - Firestore listener will catch the change
  // and update the UI automatically!
}

async function updateCandidate(id, data) {
  // Update via backend API
  await authenticatedFetch(`/api/candidates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
  
  // UI updates automatically from real-time listener
}

// BENEFITS:
// ✅ No caching logic needed
// ✅ No manual refetching
// ✅ No stale data
// ✅ Real-time updates across all open tabs
// ✅ Automatic updates when other users make changes
// ✅ Write via backend API, UI updates automatically
// ✅ Simple, clean code like your previous projects

// MIGRATION STEPS:
// 1. Remove all fetchIfNeeded logic
// 2. Remove caching from Redux slices
// 3. Replace API calls with Firestore onSnapshot
// 4. Keep backend for writes (validation, business logic)
// 5. Use Firestore for reads (real-time)

// WHY THIS IS BETTER:
// - No "cache invalidation" complexity
// - No "should I refetch?" questions
// - Data is ALWAYS fresh
// - Works across tabs/devices
// - Scales automatically
// - This is how Firestore is DESIGNED to be used
