/**
 * Auth utility functions
 * Token management helpers
 */

// Token storage keys
const ACCESS_TOKEN_KEY = 'ats_access_token';
const REFRESH_TOKEN_KEY = 'ats_refresh_token';

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Save access token to localStorage
 */
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * Save refresh token to localStorage
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Clear all tokens from localStorage
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if access token is expired (basic check)
 * Returns true if token is missing or appears expired
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  try {
    // Decode JWT token (basic parsing without verification)
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    
    // Check if token expires in less than 1 minute (60000ms)
    // This gives us time to refresh before it actually expires
    return Date.now() >= expirationTime - 60000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}
