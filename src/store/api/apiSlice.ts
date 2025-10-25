import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // Add authorization headers if needed
      // const token = localStorage.getItem("token");
      // if (token) {
      //   headers.set("authorization", `Bearer ${token}`);
      // }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
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
