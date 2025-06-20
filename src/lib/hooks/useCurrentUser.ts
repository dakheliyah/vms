import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/lib/api/apiClient';
import { User, ApiResponseData } from '@/types'; // Assuming User type is defined in src/types/index.ts

interface UseCurrentUserReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  showAccessDenied: boolean;
  countdown: number;
  refetch: () => void;
}

const useCurrentUser = (): UseCurrentUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccessDenied, setShowAccessDenied] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);

  // Helper function to wait for localStorage to be available
  const waitForLocalStorage = useCallback(async (maxAttempts = 10, interval = 100): Promise<string | null> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const its_no = localStorage.getItem('its_no');
      if (its_no) {
        return its_no;
      }
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    return null;
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Wait for localStorage to be set by LocalStorageInitializer
      const its_no = await waitForLocalStorage();
      
      if (!its_no) {
        setError('ITS number not found in localStorage after waiting');
        setIsLoading(false);
        return;
      }

      // TODO: Replace '/users/me' with the actual endpoint from the VMS API documentation
      const { data: responseData, error: apiError }: ApiResponse<ApiResponseData<User>> = await apiClient<ApiResponseData<User>>(`/mumineen/`);

      if (apiError) {
        // Check for specific "Mumineen not found" error
        if (apiError.includes('Mumineen not found')) {
          // Show access denied message with countdown
          setShowAccessDenied(true);
          setIsLoading(false);
          return;
        }
        setError(apiError);
        setUser(null);
      } else if (responseData && responseData.data) {
        setUser(responseData.data);
      } else if (responseData && !responseData.data) {
        // Handle cases where the outer 'data' exists but the inner 'data' (actual user) is missing
        setError('User data not found in response.');
        setUser(null);
      }
    } catch (err) {
      setError('Failed to fetch user data');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [waitForLocalStorage]);

  useEffect(() => {
    // Initial fetch attempt
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Handle countdown and redirect for access denied
  useEffect(() => {
    if (showAccessDenied && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showAccessDenied && countdown === 0) {
      // Redirect to the main site
      window.location.href = 'https://colombo-relay.asharamubaraka.net/';
    }
  }, [showAccessDenied, countdown]);

  useEffect(() => {
    // Listen for localStorage ready event as backup
    const handleLocalStorageReady = () => {
      // Only fetch if we don't have user data yet
      if (!user) {
        fetchCurrentUser();
      }
    };

    window.addEventListener('localStorageReady', handleLocalStorageReady);

    return () => {
      window.removeEventListener('localStorageReady', handleLocalStorageReady);
    };
  }, [user]); // Removed fetchCurrentUser to prevent infinite loop

  return { user, isLoading, error, showAccessDenied, countdown, refetch: fetchCurrentUser };
};

export default useCurrentUser;