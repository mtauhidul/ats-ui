/**
 * Fetch API wrapper with authentication
 * Automatically attaches JWT token to requests and handles token refresh
 */

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./auth-utils";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
    console.log("[Token Refresh] Already refreshing, waiting...");
    return refreshPromise;
  }

  console.log("[Token Refresh] Starting token refresh...");
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn("[Token Refresh] No refresh token available");
        return null;
      }

      console.log("[Token Refresh] Calling refresh endpoint...");
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
      const fetchTime = performance.now() - startTime;
      console.log(
        "[Token Refresh] Refresh endpoint responded in",
        fetchTime.toFixed(2),
        "ms"
      );

      if (!response.ok) {
        console.error(
          "[Token Refresh] Failed to refresh token:",
          response.status
        );
        clearTokens();
        // Redirect to login
        window.location.href = "/login";
        return null;
      }

      const data = await response.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        data.data;

      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      console.log("[Token Refresh] Token refreshed successfully");
      return newAccessToken;
    } catch (error) {
      console.error("[Token Refresh] Error refreshing token:", error);
      clearTokens();
      window.location.href = "/login";
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
  const startTime = performance.now();
  console.log("[Auth Fetch] Starting request to:", url);

  const {
    skipAuth = false,
    skipRetry = false,
    headers = {},
    body,
    ...restOptions
  } = options;

  const requestHeaders: HeadersInit = { ...headers };

  // Only set Content-Type if not FormData (browser will set it with boundary)
  if (!(body instanceof FormData)) {
    (requestHeaders as Record<string, string>)["Content-Type"] =
      "application/json";
  }

  // Add authentication token if not skipped
  if (!skipAuth) {
    try {
      const token = getAccessToken();
      if (token) {
        (requestHeaders as Record<string, string>)[
          "Authorization"
        ] = `Bearer ${token}`;
        console.log("[Auth Fetch] Token added");
      } else {
        console.warn("[Auth Fetch] No token found");
      }
    } catch (error) {
      console.error("[Auth Fetch] Failed to add auth token to request:", error);
    }
  }

  // Make the request
  const fetchStart = performance.now();
  const response = await fetch(url, {
    ...restOptions,
    body,
    headers: requestHeaders,
    credentials: "include", // Important for cookies (refresh token)
  });
  const fetchTime = performance.now() - fetchStart;
  console.log(
    "[Auth Fetch] Fetch completed in",
    fetchTime.toFixed(2),
    "ms, status:",
    response.status
  );

  // Handle 401 Unauthorized - attempt token refresh and retry
  if (response.status === 401 && !skipAuth && !skipRetry) {
    console.log("[Auth Fetch] Received 401, attempting to refresh token...");

    const refreshStart = performance.now();
    const newToken = await refreshAccessToken();
    const refreshTime = performance.now() - refreshStart;
    console.log(
      "[Auth Fetch] Token refresh took",
      refreshTime.toFixed(2),
      "ms"
    );

    if (newToken) {
      // Retry the request with the new token
      console.log("[Auth Fetch] Token refreshed, retrying request...");
      (requestHeaders as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${newToken}`;

      const retryStart = performance.now();
      const retryResponse = await fetch(url, {
        ...restOptions,
        body,
        headers: requestHeaders,
        credentials: "include",
      });
      const retryTime = performance.now() - retryStart;
      console.log(
        "[Auth Fetch] Retry completed in",
        retryTime.toFixed(2),
        "ms"
      );

      const totalTime = performance.now() - startTime;
      console.log(
        "[Auth Fetch] Total time (with refresh):",
        totalTime.toFixed(2),
        "ms"
      );

      return retryResponse;
    }
  }

  const totalTime = performance.now() - startTime;
  console.log("[Auth Fetch] Total time:", totalTime.toFixed(2), "ms");

  return response;
}
