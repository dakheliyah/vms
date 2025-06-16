// src/components/PassDetailsContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { FamilyMember, User, PassPreference } from '@/types'; // Removed ApiBlock as it's not used directly here
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface PassDetailsContentProps {
  currentUser: User | null; // Pass currentUser as a prop
}

export default function PassDetailsContent({ currentUser }: PassDetailsContentProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  // SelectedMembers is not used for selection actions here, but kept if other logic depends on it.
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); 
  const [passPreferencesData, setPassPreferencesData] = useState<PassPreference[]>([]);
  const [memberPassSelections, setMemberPassSelections] = useState<Record<number, { venueId?: number; blockId?: number }>>({});
  const [updatingMember, setUpdatingMember] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const its_no = localStorage.getItem('its_no');
      if (!its_no) {
        console.error('ITS number not found in localStorage');
        return;
      }

      // Fetch Pass Preferences Data
      try {
        const passPrefsResponse = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/summary?event_id=1');
        if (!passPrefsResponse.ok) throw new Error('Failed to fetch pass preferences');
        const passPrefsJsonData = await passPrefsResponse.json();
        setPassPreferencesData(passPrefsJsonData);
      } catch (error) {
        console.error('Error fetching pass preferences:', error);
      }

      // Fetch Family Members Details (currentUser is passed as prop, no need to fetch here if already available)
      if (currentUser) { // Check if currentUser is available
        try {
          const familyResponse = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/family-by-its-id?its_id=${its_no}`);
          if (!familyResponse.ok) throw new Error('Failed to fetch family details');
          const familyData = await familyResponse.json();
          if (familyData.success && familyData.data) {
            const transformedFamilyMembers: FamilyMember[] = familyData.data.map((apiMember: any) => ({
              its_id: apiMember.its_id,
              fullname: apiMember.fullname,
              gender: apiMember.gender,
              country: apiMember.country,
              venue_waaz: apiMember.venue_waaz,
              acc_zone: apiMember.acc_zone
            }));
            setFamilyMembers(transformedFamilyMembers);
          }
        } catch (error) {
          console.error('Error fetching family details:', error);
        }
      }
    };
    fetchData();
  }, [currentUser]); // Add currentUser to dependency array

  const handleVenueChange = (memberId: number, venueIdString: string) => {
    const venueId = parseInt(venueIdString, 10);
    setMemberPassSelections(prev => ({
      ...prev,
      [memberId]: { venueId, blockId: undefined } // Reset blockId when venue changes
    }));
  };

  const handleBlockChange = (memberId: number, blockIdString: string) => {
    const blockId = parseInt(blockIdString, 10);
    setMemberPassSelections(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], blockId }
    }));
  };

  const handleUpdatePassPreference = async (memberId: number) => {
    const selection = memberPassSelections[memberId];
    if (!selection || typeof selection.blockId === 'undefined') {
      console.error('No block selected for member:', memberId);
      alert('Please select a pass type before updating.');
      return;
    }

    setUpdatingMember(memberId);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT_HERE', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          its_id: memberId,
          block_id: selection.blockId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update pass preference');
      }

      const result = await response.json();
      console.log('Update successful:', result);
      alert('Pass preference updated successfully!');
    } catch (error) {
      console.error('Error updating pass preference:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    } finally {
      setUpdatingMember(null);
    }
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
                <div className="col-span-4">Full Name</div>
                <div className="col-span-2">Venue</div>
                <div className="col-span-2">Pass Type</div>
                <div className="col-span-3">Action</div>
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
                  <div className="col-span-4 font-medium text-gray-900">
                    <div>{member.fullname}</div>
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={memberPassSelections[member.its_id]?.venueId?.toString() || ''}
                      onValueChange={(value) => handleVenueChange(member.its_id, value)}
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
                  <div className="col-span-2">
                  <Select
                          value={memberPassSelections[member.its_id]?.blockId?.toString() || ''}
                          onValueChange={(value) => handleBlockChange(member.its_id, value)}
                          disabled={!memberPassSelections[member.its_id]?.venueId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Pass Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {passPreferencesData
                              .find(p => p.id === memberPassSelections[member.its_id]?.venueId)
                              ?.blocks.filter(block => 
                                member.gender && (block.gender === member.gender.toLowerCase() || block.gender === 'both')
                              )
                              .map(block => (
                                <SelectItem key={block.id} value={block.id.toString()}>
                                  {block.type} (Av: {block.block_availability})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                  </div>
                  <div className="col-span-3">
                    <Button 
                      onClick={() => handleUpdatePassPreference(member.its_id)}
                      disabled={!memberPassSelections[member.its_id]?.blockId || updatingMember === member.its_id}
                      size="sm"
                    >
                      {updatingMember === member.its_id ? 'Updating...' : 'Update Pass'}
                    </Button>
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