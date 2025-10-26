/**
 * Fetch API wrapper with authentication
 * Automatically attaches Clerk JWT token to requests
 */

import { getClerkToken } from './clerk-utils';

export interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch wrapper that automatically includes Clerk authentication token
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function authenticatedFetch(
  url: string,
  options: AuthenticatedFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, headers = {}, body, ...restOptions } = options;

  const requestHeaders: HeadersInit = { ...headers };

  // Only set Content-Type if not FormData (browser will set it with boundary)
  if (!(body instanceof FormData)) {
    (requestHeaders as Record<string, string>)['Content-Type'] = 'application/json';
  }

  // Add authentication token if not skipped
  if (!skipAuth) {
    try {
      const token = await getClerkToken();
      if (token) {
        console.log('[Auth Debug] Token obtained, length:', token.length, 'first 20 chars:', token.substring(0, 20));
        (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('[Auth Debug] No token available from Clerk');
      }
    } catch (error) {
      console.error('[Auth Debug] Failed to add auth token to request:', error);
    }
  }

  return fetch(url, {
    ...restOptions,
    body,
    headers: requestHeaders,
  });
}
