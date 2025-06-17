// TODO: Move NEXT_PUBLIC_API_BASE_URL to .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'; // Default to a common local dev URL

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * A utility function to make API requests.
 * @param endpoint The API endpoint to call (e.g., '/users/me').
 * @param options RequestInit options for the fetch call.
 * @returns Promise<ApiResponse<T>>
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // TODO: Replace 'YOUR_AUTH_TOKEN_KEY' with the actual key used to store the auth token in localStorage
        'Token': `${typeof window !== 'undefined' ? localStorage.getItem('its_no') : ''}`,
        // Add other common headers if needed
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore if response is not JSON
      }
      const errorMessage = errorData?.message || errorData?.error || `HTTP error! status: ${response.status}`;
      console.error(`API Error (${response.status}) for ${API_BASE_URL}${endpoint}:`, errorMessage, errorData);
      // Handle 401 Unauthorized specifically - e.g., redirect to login
      if (response.status === 401 && typeof window !== 'undefined') {
        // localStorage.removeItem('YOUR_AUTH_TOKEN_KEY'); // Clear token
        // window.location.href = '/login'; // Redirect to login page
        console.warn('API request unauthorized. Consider redirecting to login.');
      }
      return { error: errorMessage };
    }

    // Handle cases where response might be empty (e.g., 204 No Content)
    if (response.status === 204) {
      return { data: undefined };
    }

    const data: T = await response.json();
    return { data };
  } catch (error) {
    console.error(`Network or other error for ${endpoint}:`, error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

// Example usage (can be removed or kept for reference):
/*
interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUserProfile(userId: string) {
  const { data, error } = await apiClient<User>(`/users/${userId}`);
  if (error) {
    console.error('Failed to fetch user profile:', error);
    return;
  }
  if (data) {
    console.log('User Profile:', data);
  }
}
*/