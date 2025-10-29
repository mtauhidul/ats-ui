/**
 * Fetch API wrapper with authentication
 * Automatically attaches JWT token to requests and handles token refresh
 */

import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './auth-utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean; // Internal flag to prevent infinite retry loops
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn('No refresh token available');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error('Failed to refresh token:', response.status);
        clearTokens();
        // Redirect to login
        window.location.href = '/login';
        return null;
      }

      const data = await response.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      return newAccessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearTokens();
      window.location.href = '/login';
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Fetch wrapper that automatically includes JWT authentication token
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function authenticatedFetch(
  url: string,
  options: AuthenticatedFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, skipRetry = false, headers = {}, body, ...restOptions } = options;

  const requestHeaders: HeadersInit = { ...headers };

  // Only set Content-Type if not FormData (browser will set it with boundary)
  if (!(body instanceof FormData)) {
    (requestHeaders as Record<string, string>)['Content-Type'] = 'application/json';
  }

  // Add authentication token if not skipped
  if (!skipAuth) {
    try {
      const token = getAccessToken();
      if (token) {
        (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to add auth token to request:', error);
    }
  }

  // Make the request
  const response = await fetch(url, {
    ...restOptions,
    body,
    headers: requestHeaders,
    credentials: 'include', // Important for cookies (refresh token)
  });

  // Handle 401 Unauthorized - attempt token refresh and retry
  if (response.status === 401 && !skipAuth && !skipRetry) {
    console.log('Received 401, attempting to refresh token...');
    
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry the request with the new token
      console.log('Token refreshed, retrying request...');
      (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      
      return fetch(url, {
        ...restOptions,
        body,
        headers: requestHeaders,
        credentials: 'include',
      });
    }
  }

  return response;
}
