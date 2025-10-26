import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getClerkToken } from "@/lib/clerk-utils";

// Define the base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Custom base query with Clerk auth token
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    // Get Clerk session token
    try {
      const token = await getClerkToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    } catch (error) {
      console.warn("Failed to get Clerk token:", error);
    }
    
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// Base query with error handling
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized - token expired or invalid
  if (result.error && result.error.status === 401) {
    console.warn("Authentication failed - redirecting to login");
    // Optionally dispatch a logout action or redirect
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
