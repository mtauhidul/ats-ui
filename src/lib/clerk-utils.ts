/**
 * Utility to get Clerk authentication token
 * This is used by API middleware to attach Bearer token to requests
 */

declare global {
  interface Window {
    Clerk?: {
      session: {
        getToken: (options?: { template?: string }) => Promise<string | null>;
      } | null;
    };
  }
}

/**
 * Get Clerk JWT token for API authentication
 * @returns JWT token string or null if not available
 */
export async function getClerkToken(): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !window.Clerk) {
      return null;
    }

    const session = window.Clerk.session;
    if (!session) {
      return null;
    }

    // Get a fresh token from Clerk
    const token = await session.getToken();
    return token;
  } catch (error) {
    return null;
  }
}
