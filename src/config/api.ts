/**
 * Centralized API Configuration
 *
 * This file manages all API base URLs for the application.
 * Uses environment variables with production fallback to Heroku.
 */

// Production API URL (Heroku)
const PRODUCTION_API_URL =
  "https://ytfcs-ats-v2-9d7724d9b16c.herokuapp.com/api";

// Development API URL
const DEVELOPMENT_API_URL = "http://localhost:5001/api";

/**
 * Get the appropriate API base URL based on environment
 * Priority: VITE_API_URL env var > production URL in production > development URL
 */
export const getApiBaseUrl = (): string => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // If in production mode (Vercel deployment), use Heroku URL
  if (import.meta.env.PROD) {
    return PRODUCTION_API_URL;
  }

  // Default to localhost for development
  return DEVELOPMENT_API_URL;
};

/**
 * Main API base URL to be used throughout the application
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Legacy export for backwards compatibility
 * @deprecated Use API_BASE_URL instead
 */
export default API_BASE_URL;
