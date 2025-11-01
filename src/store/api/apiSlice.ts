import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from "@/lib/auth-utils";
import { API_BASE_URL } from "@/config/api";

// Custom base query with token refresh logic
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    // Get JWT access token
    const token = getAccessToken();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    
    headers.set("Content-Type", "application/json");
    return headers;
  },
  credentials: 'include', // Important for cookies (refresh token)
});

// Base query with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized - token expired, try to refresh
  if (result.error && result.error.status === 401) {
    console.log("Access token expired, attempting to refresh...");
    
    const refreshToken = getRefreshToken();
    
    if (refreshToken) {
      try {
        // Attempt to refresh the token
        const refreshResult = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResult.ok) {
          const data = await refreshResult.json();
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

          // Store new tokens
          setAccessToken(newAccessToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }

          console.log("Token refreshed successfully, retrying request...");
          
          // Retry the original request with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          console.warn("Token refresh failed, logging out...");
          clearTokens();
          window.location.href = '/login';
        }
      } catch (error) {
        console.error("Error during token refresh:", error);
        clearTokens();
        window.location.href = '/login';
      }
    } else {
      console.warn("No refresh token available, redirecting to login");
      clearTokens();
      window.location.href = '/login';
    }
  }
  
  return result;
};

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Client",
    "Job",
    "Candidate",
    "Application",
    "Email",
    "Category",
    "Tag",
    "Pipeline",
    "Interview",
    "TeamMember",
  ],
  endpoints: () => ({}), // Endpoints will be injected in separate files
});
