// src/app/pass-details/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FamilyMember, User } from '@/types';
import DashboardHeader from '@/components/DashboardHeader';
import NavigationTabs from '@/components/NavigationTabs';
import FamilyMembersTable from '@/components/FamilyMembersTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function PassDetailsPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // Required by FamilyMembersTable, though not used for selection actions here

  useEffect(() => {
    const fetchData = async () => {
      const its_no = localStorage.getItem('its_no');
      if (!its_no) {
        console.error('ITS number not found in localStorage');
        return;
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
            id: apiMember.its_id.toString(),
            serialNumber: apiMember.its_id,
            fullName: apiMember.full_name,
            registrationStatus: 'PENDING', // Placeholder
            passStatus: 'PENDING', // Placeholder
            dataStatus: 'PENDING', // Placeholder
            zone: apiMember.zone,
            specialPassRequest: apiMember.special_pass_request,
            accommodation: apiMember.accommodation,
          }));
          setFamilyMembers(transformedFamilyMembers);
        }
      } catch (error) {
        console.error('Error fetching family details:', error);
      }
    };
    fetchData();
  }, []);

  const handleUpdateMemberDetails = (memberId: string, details: Partial<Pick<FamilyMember, 'zone' | 'specialPassRequest'>>) => {
    setFamilyMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === memberId ? { ...member, ...details } : member
      )
    );
    // Here you would also include an API call to persist these changes to the backend
    console.log(`Updating member ${memberId} with`, details);
    // Example API call (uncomment and adapt):
    /*
    const its_no = localStorage.getItem('its_no');
    fetch(`https://your-api-endpoint/update-member-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ its_id: its_no, member_id_to_update: memberId, ...details })
    })
    .then(response => response.json())
    .then(data => console.log('Update successful:', data))
    .catch(error => console.error('Error updating member:', error));
    */
  };
  
  // Dummy handler for onMemberSelection and onSelectAll as they are not primary features of this page
  // but are required by FamilyMembersTable
  const handleMemberSelection = (memberId: string, isSelected: boolean) => {
    // console.log('Member selection changed:', memberId, isSelected);
    // setSelectedMembers(prev => isSelected ? [...prev, memberId] : prev.filter(id => id !== memberId));
  };

  const handleSelectAll = (isSelected: boolean) => {
    // console.log('Select all changed:', isSelected);
    // setSelectedMembers(isSelected ? familyMembers.map(m => m.id) : []);
  };

  if (!currentUser) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream/20 to-white">
      <DashboardHeader user={currentUser} />
      <main className="container mx-auto px-4 py-6 space-y-6">
      <NavigationTabs /> {/* Add the NavigationTabs component */}
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
            <FamilyMembersTable 
              members={familyMembers}
              selectedMembers={selectedMembers} // Pass empty or manage if selection is needed for other features
              onMemberSelection={handleMemberSelection} // Dummy handler
              onSelectAll={handleSelectAll} // Dummy handler
              selectionMode={'checkbox'} // Checkbox mode might be more intuitive if any row-specific actions were added later
              onUpdateMemberDetails={handleUpdateMemberDetails}
            />
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