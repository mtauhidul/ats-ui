/**
 * Firestore Debug Component
 * Use this to debug Firestore connection and data fetching
 * Place this component anywhere in your app to see realtime debug info
 */

import { useEffect, useState } from 'react';
import { useJobs } from '@/hooks/firestore';
import { useApplications } from '@/hooks/firestore';
import { useCandidates } from '@/hooks/firestore';
import { useClients } from '@/hooks/firestore';
import { getUserCompanyId } from '@/hooks/useFirestore';
import { db } from '@/config/firebase';

export function FirestoreDebug() {
  const [companyId, setCompanyId] = useState('');
  const [projectId, setProjectId] = useState('');
  
  const jobs = useJobs();
  const applications = useApplications();
  const candidates = useCandidates();
  const clients = useClients();

  useEffect(() => {
    setCompanyId(getUserCompanyId());
    setProjectId(db.app.options.projectId || 'N/A');
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#1a1a1a',
      color: '#fff',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '600px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4CAF50' }}>🔥 Firestore Debug</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Company ID:</strong>
        <div style={{ color: '#FFD700' }}>{companyId}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Firebase Project:</strong>
        <div style={{ color: '#FFD700' }}>{projectId}</div>
      </div>

      <hr style={{ margin: '15px 0', borderColor: '#333' }} />

      <div style={{ marginBottom: '10px' }}>
        <strong>📋 Jobs:</strong>
        <div>Count: <span style={{ color: jobs.data.length > 0 ? '#4CAF50' : '#ff5252' }}>{jobs.data.length}</span></div>
        <div>Loading: {jobs.loading ? '✅' : '❌'}</div>
        <div>Error: {jobs.error ? '🔴 ' + jobs.error.message : '✅ None'}</div>
        <div style={{ fontSize: '10px', marginTop: '5px', color: '#888' }}>
          Path: companies/{companyId}/jobs
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>📝 Applications:</strong>
        <div>Count: <span style={{ color: applications.data.length > 0 ? '#4CAF50' : '#ff5252' }}>{applications.data.length}</span></div>
        <div>Loading: {applications.loading ? '✅' : '❌'}</div>
        <div>Error: {applications.error ? '🔴 ' + applications.error.message : '✅ None'}</div>
        <div style={{ fontSize: '10px', marginTop: '5px', color: '#888' }}>
          Path: companies/{companyId}/applications
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>👥 Candidates:</strong>
        <div>Count: <span style={{ color: candidates.data.length > 0 ? '#4CAF50' : '#ff5252' }}>{candidates.data.length}</span></div>
        <div>Loading: {candidates.loading ? '✅' : '❌'}</div>
        <div>Error: {candidates.error ? '🔴 ' + candidates.error.message : '✅ None'}</div>
        <div style={{ fontSize: '10px', marginTop: '5px', color: '#888' }}>
          Path: companies/{companyId}/candidates
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>🏢 Clients:</strong>
        <div>Count: <span style={{ color: clients.data.length > 0 ? '#4CAF50' : '#ff5252' }}>{clients.data.length}</span></div>
        <div>Loading: {clients.loading ? '✅' : '❌'}</div>
        <div>Error: {clients.error ? '🔴 ' + clients.error.message : '✅ None'}</div>
        <div style={{ fontSize: '10px', marginTop: '5px', color: '#888' }}>
          Path: companies/{companyId}/clients
        </div>
      </div>

      <hr style={{ margin: '15px 0', borderColor: '#333' }} />

      <div style={{ fontSize: '10px', color: '#888' }}>
        <div><strong>Debug Steps:</strong></div>
        <div>1. Check if counts are {'>'} 0</div>
        <div>2. If 0, check Firebase Console</div>
        <div>3. Verify Firestore rules allow read</div>
        <div>4. Check browser console for errors</div>
      </div>
    </div>
  );
}
