import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/lib/api/apiClient';
import { FamilyMember, ApiResponseData } from '@/types'; // Assuming FamilyMember type is defined in src/types/index.ts

interface UseFamilyMembersReturn {
  familyMembers: FamilyMember[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useFamilyMembers = (eventId: number = 1): UseFamilyMembersReturn => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFamilyMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const its_no = localStorage.getItem('its_no');
    if (!its_no) {
      console.error('ITS number not found in localStorage');
      return;
    }
    // TODO: Replace '/family-members' with the actual endpoint from the VMS API documentation
    const { data: responseData, error: apiError }: ApiResponse<ApiResponseData<FamilyMember[]>> = await apiClient<ApiResponseData<FamilyMember[]>>(`/mumineen/family-by-its-id?event_id=${eventId}`);

    if (apiError) {
      setError(apiError);
      setFamilyMembers([]);
    } else if (responseData && responseData.data) {
      setFamilyMembers(responseData.data);
    } else if (responseData && !responseData.data) {
      // Handle cases where the outer 'data' exists but the inner 'data' (actual family members) is missing
      setError('Family member data not found in response.');
      setFamilyMembers([]);
    }
    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  return { familyMembers, isLoading, error, refetch: fetchFamilyMembers };
};

export default useFamilyMembers;