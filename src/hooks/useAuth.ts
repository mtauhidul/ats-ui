/**
 * Auth hooks
 * Custom hooks for authentication
 */

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
