import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Firestore Service for Candidates
 * Provides CRUD operations and real-time subscriptions
 */

export interface Candidate {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  currentTitle?: string;
  currentCompany?: string;
  resumeUrl: string;
  jobIds: string[];
  status: 'active' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
  currentStage?: string;
  companyId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get collection reference
 */
function getCandidatesCollection(companyId: string) {
  return collection(db, `companies/${companyId}/candidates`);
}

/**
 * Create a new candidate
 */
export async function createCandidate(companyId: string, candidateData: Omit<Candidate, 'id'>): Promise<string> {
  const collectionRef = getCandidatesCollection(companyId);
  const docRef = await addDoc(collectionRef, {
    ...candidateData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Get candidate by ID
 */
export async function getCandidateById(companyId: string, candidateId: string): Promise<Candidate | null> {
  const docRef = doc(db, `companies/${companyId}/candidates`, candidateId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Candidate;
  }
  return null;
}

/**
 * Update candidate
 */
export async function updateCandidate(
  companyId: string,
  candidateId: string,
  updates: Partial<Candidate>
): Promise<void> {
  const docRef = doc(db, `companies/${companyId}/candidates`, candidateId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete candidate
 */
export async function deleteCandidate(companyId: string, candidateId: string): Promise<void> {
  const docRef = doc(db, `companies/${companyId}/candidates`, candidateId);
  await deleteDoc(docRef);
}

/**
 * Get all candidates for a company
 */
export async function getAllCandidates(companyId: string): Promise<Candidate[]> {
  const collectionRef = getCandidatesCollection(companyId);
  const q = query(collectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Candidate[];
}

/**
 * Get candidates by status
 */
export async function getCandidatesByStatus(companyId: string, status: string): Promise<Candidate[]> {
  const collectionRef = getCandidatesCollection(companyId);
  const q = query(collectionRef, where('status', '==', status), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Candidate[];
}

/**
 * Get candidates by job
 */
export async function getCandidatesByJob(companyId: string, jobId: string): Promise<Candidate[]> {
  const collectionRef = getCandidatesCollection(companyId);
  const q = query(collectionRef, where('jobIds', 'array-contains', jobId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Candidate[];
}

/**
 * Update candidate stage
 */
export async function updateCandidateStage(companyId: string, candidateId: string, stage: string): Promise<void> {
  const docRef = doc(db, `companies/${companyId}/candidates`, candidateId);
  await updateDoc(docRef, {
    currentStage: stage,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Bulk update candidates
 */
export async function bulkUpdateCandidates(
  companyId: string,
  candidateIds: string[],
  updates: Partial<Candidate>
): Promise<void> {
  const updatePromises = candidateIds.map((id) => updateCandidate(companyId, id, updates));
  await Promise.all(updatePromises);
}
