// src/components/PassDetailsContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { FamilyMember, User, PassPreference } from '@/types';
import useFamilyMembers from '@/lib/hooks/useFamilyMembers'; // Import the hook
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface PassDetailsContentProps {
  currentUser: User | null; // Pass currentUser as a prop
}

export default function PassDetailsContent({ currentUser }: PassDetailsContentProps) {
  const { familyMembers, isLoading: isLoadingFamilyMembers, error: familyMembersError, refetch: refetchFamilyMembers } = useFamilyMembers();
  // SelectedMembers is not used for selection actions here, but kept if other logic depends on it.
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); 
  const [passPreferencesData, setPassPreferencesData] = useState<PassPreference[]>([]);
  const [memberPassSelections, setMemberPassSelections] = useState<Record<number, { venueId?: number }>>({});
  const [updatingMember, setUpdatingMember] = useState<number | null>(null); // Kept for now, might be used for venue update status

  useEffect(() => {
    const fetchData = async () => {
      const its_no = localStorage.getItem('its_no');
      if (!its_no) {
        console.error('ITS number not found in localStorage');
        return;
      }

      // Fetch Pass Preferences Data
      try {
        const passPrefsResponse = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/vaaz-center-summary?event_id=1');
        if (!passPrefsResponse.ok) throw new Error('Failed to fetch pass preferences');
        const passPrefsJsonData = await passPrefsResponse.json();
        setPassPreferencesData(passPrefsJsonData);
      } catch (error) {
        console.error('Error fetching pass preferences:', error);
      }

    };
    // Initial fetch of pass preferences
    fetchData();
    // Family members are now fetched by the useFamilyMembers hook
    // We can call refetchFamilyMembers if currentUser changes and we need to re-trigger, 
    // but the hook itself should handle its own initial fetch based on localStorage 'its_no'.
    // If the hook needs currentUser.its_id, the hook itself would need to be modified or take it as a param.
  }, [currentUser]); // Dependency array might need adjustment based on how/if refetchFamilyMembers is used with currentUser

  // Handle loading and error states from the useFamilyMembers hook
  if (isLoadingFamilyMembers) {
    return <div>Loading family member details...</div>;
  }

  if (familyMembersError) {
    return <div>Error loading family details: {familyMembersError}. <Button onClick={refetchFamilyMembers}>Try again</Button></div>;
  }

  const handleVenueUpdate = async (memberId: number, venueId: number) => {
    setUpdatingMember(memberId);
    const its_no = localStorage.getItem('its_no');
    try {
      // The user will provide the final API endpoint.
      const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/vaaz-center', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': its_no || '',
        },
        body: JSON.stringify({
          its_id: memberId,
          vaaz_center_id: venueId,
          event_id: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update venue preference');
      }

      const result = await response.json();
      console.log('Update successful:', result);
    } catch (error) {
      console.error('Error updating venue preference:', error);
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleVenueChange = (memberId: number, venueIdString: string) => {
    const venueId = parseInt(venueIdString, 10);
    setMemberPassSelections(prev => ({
      ...prev,
      [memberId]: { venueId }
    }));
    handleVenueUpdate(memberId, venueId);
  };



  if (!currentUser) {
    // This component expects currentUser to be passed, 
    // so loading state might be handled by the parent.
    // Or, display a specific message if currentUser is null when it shouldn't be.
    return <div>Loading user information or user not available...</div>;
  }
  
  return (
    <>
      <h1 className="text-2xl font-semibold text-primary-green mb-4">Pass Details</h1>
      <Card className="border-primary-green/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-primary-green flex items-center gap-2">
              <Users className="h-5 w-5" />
              Family Member Pass Information
            </CardTitle>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Update Zone and Special Pass requests for each family member directly in the table below.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-tertiary-gold text-white">
              <div className="grid grid-cols-12 gap-2 p-3 text-sm font-medium text-primary">
                <div className="col-span-1">ITS No</div>
                <div className="col-span-5">Full Name</div>
                <div className="col-span-6">Venue</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="bg-white">
              {familyMembers.map((member) => (
                <div
                  key={member.its_id}
                  className={`grid grid-cols-12 gap-2 p-3 text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors items-center`}
                >
                  <div className="col-span-1 font-medium text-gray-700">
                    {member.its_id}
                  </div>
                  <div className="col-span-5 font-medium text-gray-900">
                    <div>{member.fullname}</div>
                  </div>
                  <div className="col-span-6">
                    <Select
                      value={memberPassSelections[member.its_id]?.venueId?.toString() || ''}
                      onValueChange={(value) => handleVenueChange(member.its_id, value)}
                      disabled={updatingMember === member.its_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Venue" />
                      </SelectTrigger>
                      <SelectContent>
                        {passPreferencesData.map((preference) => (
                          <SelectItem key={preference.id} value={preference.id.toString()}>
                            {preference.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}