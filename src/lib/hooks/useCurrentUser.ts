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

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const its_no = localStorage.getItem('its_no');
    if (!its_no) {
      console.error('ITS number not found in localStorage');
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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return { user, isLoading, error, refetch: fetchCurrentUser };
};

export default useCurrentUser;