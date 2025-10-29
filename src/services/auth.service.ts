/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  department?: string;
  title?: string;
  phone?: string;
  permissions?: {
    canManageClients?: boolean;
    canManageJobs?: boolean;
    canReviewApplications?: boolean;
    canManageCandidates?: boolean;
    canSendEmails?: boolean;
    canManageTeam?: boolean;
    canAccessAnalytics?: boolean;
  };
}

export interface RegisterFirstAdminData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      emailVerified: boolean;
    };
    accessToken?: string;
    refreshToken?: string;
  };
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for cookies
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Login failed');
  }

  return response.json();
}

/**
 * Register first admin user (only works if no users exist)
 */
export async function registerFirstAdmin(data: RegisterFirstAdminData): Promise<AuthResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/auth/register-first-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create admin user');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Request a magic link for passwordless login
 */
export async function requestMagicLink(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/magic-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to send magic link');
  }

  return response.json();
}

/**
 * Verify magic link token
 */
export async function verifyMagicLink(token: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/magic-link/${token}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Invalid or expired magic link');
  }

  return response.json();
}

/**
 * Verify email address
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Email verification failed');
  }

  return response.json();
}

/**
 * Set password after email verification
 */
export async function setPassword(data: { token: string; password: string }): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to set password');
  }

  return response.json();
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to send reset email');
  }

  return response.json();
}

/**
 * Reset password with token
 */
export async function resetPassword(data: { token: string; password: string }): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to reset password');
  }

  return response.json();
}

/**
 * Get current user
 */
export async function getCurrentUser(token: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get user');
  }

  return response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Token refresh failed');
  }

  return response.json();
}

/**
 * Logout
 */
export async function logout(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Logout failed');
  }

  return response.json();
}

/**
 * Register a new user (Admin only)
 */
export async function registerUser(data: RegisterData, token: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Registration failed');
  }

  return response.json();
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  title?: string;
  department?: string;
  avatar?: string;
}, token: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update profile');
  }

  return response.json();
}

/**
 * Update password (logged-in user)
 */
export async function updatePassword(data: { currentPassword: string; newPassword: string }, token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update password');
  }

  return response.json();
}

// Export all functions as a service object
export const authService = {
  login,
  registerFirstAdmin,
  registerUser,
  requestMagicLink,
  verifyMagicLink,
  verifyEmail,
  setPassword,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  getCurrentUser,
  updateProfile,
  updatePassword,
};
