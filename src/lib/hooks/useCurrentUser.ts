import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/lib/api/apiClient';
import { User, ApiResponseData } from '@/types'; // Assuming User type is defined in src/types/index.ts

interface UseCurrentUserReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useCurrentUser = (): UseCurrentUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

    // Listen for localStorage ready event as backup
    const handleLocalStorageReady = () => {
      if (!user && !isLoading) {
        fetchCurrentUser();
      }
    };

    window.addEventListener('localStorageReady', handleLocalStorageReady);

    return () => {
      window.removeEventListener('localStorageReady', handleLocalStorageReady);
    };
  }, [fetchCurrentUser, user, isLoading]);

  return { user, isLoading, error, refetch: fetchCurrentUser };
};

export default useCurrentUser;