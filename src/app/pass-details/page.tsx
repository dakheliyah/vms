// src/app/pass-details/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FamilyMember, User, PassPreference, ApiBlock } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button'; // Added Button import
import DashboardHeader from '@/components/DashboardHeader';
import NavigationTabs from '@/components/NavigationTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function PassDetailsPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // Required by FamilyMembersTable, though not used for selection actions here
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
        const passPrefsJsonData = await passPrefsResponse.json(); // Assuming direct array response
        setPassPreferencesData(passPrefsJsonData);
      } catch (error) {
        console.error('Error fetching pass preferences:', error);
      }

      // Fetch Logged-in User Details
      try {
        const userResponse = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen?its_id=${its_no}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user details');
        const userData = await userResponse.json();
        if (userData.success && userData.data) setCurrentUser(userData.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }

      // Fetch Family Members Details
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
    };
    fetchData();
  }, []);

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
      // Optionally, show a user-facing error message here
      alert('Please select a pass type before updating.');
      return;
    }

    setUpdatingMember(memberId);
    try {
      const response = await fetch('YOUR_API_ENDPOINT_HERE', { // Replace with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any other necessary headers, like Authorization tokens
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
      // Optionally, you might want to re-fetch family data or update local state
      // to reflect changes if the API response indicates success and returns new data.

    } catch (error) {
      console.error('Error updating pass preference:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    } finally {
      setUpdatingMember(null);
    }
  };

  if (!currentUser) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream/20 to-white">
      <DashboardHeader user={currentUser} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* <NavigationTabs /> Add the NavigationTabs component */}
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
                {familyMembers.map((member) => { // Removed index as it's not used

                  return (
                    // Adjusted column spans to match new header
                    <div
                      key={member.its_id}
                      className={`grid grid-cols-12 gap-2 p-3 text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors items-center`}
                    >
                      {/* ITS No */}
                      <div className="col-span-1 font-medium text-gray-700">
                        {member.its_id}
                      </div>

                      {/* Full Name */}
                      <div className="col-span-4 font-medium text-gray-900">
                        <div>{member.fullname}</div>
                      </div>

                      {/* Venue Dropdown */}
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

                      {/* Pass Type Dropdown */}
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
                                  {block.type} (Av: {block.availability})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Update Button */}
                      <div className="col-span-3 flex items-center justify-start">
                        <Button 
                          onClick={() => handleUpdatePassPreference(member.its_id)}
                          disabled={!memberPassSelections[member.its_id]?.blockId || updatingMember === member.its_id}
                          size="sm"
                        >
                          {updatingMember === member.its_id ? 'Updating...' : 'Update'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="bg-primary text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-white">
          Developed & Designed by <b>Umoor Dakheliyah Colombo</b>
        </div>
      </footer>
    </div>
  );
}