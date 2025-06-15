'use client';

import { useState, useEffect } from 'react';
import { FamilyMember, User } from '@/types';
import DashboardHeader from './DashboardHeader';
import FamilyMembersTable from './FamilyMembersTable';
// import PassStatusSection from './PassStatusSection'; // Removed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; // Added for navigation tabs
import NavigationTabs from './NavigationTabs'; // Import the new component
import { Button } from '@/components/ui/button';
import { Plus, Users, Edit, HomeIcon } from 'lucide-react';
// import AccommodationForm from './AccommodationForm'; // Removed, as accommodation details are on a separate page

export default function DashboardPage() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);


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
        if (!userResponse.ok) {
          throw new Error(`User API request failed with status ${userResponse.status}`);
        }
        const userResult = await userResponse.json();
        if (userResult.success && userResult.data) {
          const apiUser = userResult.data;
          const user: User = {
            its_id: apiUser.its_id.toString(),
            full_name: apiUser.full_name,
            familyId: apiUser.hof_its_id?.toString() || '',
            relayCenter: '', // Placeholder
            location: apiUser.country,
            zone: apiUser.zone,
            specialPassRequest: apiUser.special_pass_request,
            accommodation: apiUser.accommodation,
          };
          setCurrentUser(user);
        } else {
          console.error('User API request was not successful or data is missing', userResult);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }

      // Fetch Family Members Details
      try {
        const familyResponse = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/family-by-its-id?its_id=${its_no}`);
        if (!familyResponse.ok) {
          throw new Error(`Family API request failed with status ${familyResponse.status}`);
        }
        const familyResult = await familyResponse.json();
        if (familyResult.success && familyResult.data) {
          const transformedFamilyMembers: FamilyMember[] = familyResult.data.map((apiMember: any) => ({
            id: apiMember.its_id.toString(),
            serialNumber: apiMember.its_id,
            fullName: apiMember.full_name,
            registrationStatus: 'PENDING',
            passStatus: 'PENDING',
            dataStatus: 'PENDING',
            zone: apiMember.zone,
            specialPassRequest: apiMember.special_pass_request,
            accommodation: apiMember.accommodation,
          }));
          setFamilyMembers(transformedFamilyMembers);
        } else {
          console.error('Family API request was not successful or data is missing', familyResult);
        }
      } catch (error) {
        console.error('Failed to fetch family data:', error);
      }
    };

    fetchData();
  }, []);

  const handleMemberSelection = (memberId: string, isSelected: boolean) => {
    // For radio buttons in normal mode
    if (isSelected) {
      setSelectedMembers([memberId]);
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    // When not in bulk edit mode, selecting all is not typical for radio buttons, 
    // but if needed, it would select the first member or clear selection.
    if (isSelected && familyMembers.length > 0) {
      setSelectedMembers([familyMembers[0].id]);
    } else {
      setSelectedMembers([]);
    }
  };

  const handleUpdateMemberDetails = (memberId: string, details: Partial<FamilyMember>) => {
    setFamilyMembers(prevMembers => 
      prevMembers.map(member => 
        member.id === memberId ? { ...member, ...details } : member
      )
    );
    // If the updated member is the currently selected one for PassStatusSection, refresh its view
    if (selectedMembers.includes(memberId)) {
      // This might involve re-fetching or just relying on the state update to re-render PassStatusSection
      // For now, the state update of familyMembers should trigger a re-render.
    }
  };


  if (!currentUser) {
    // TODO: Add a proper loading state or spinner
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream/20 to-white">
      {/* Header */}
      <DashboardHeader user={currentUser} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* Navigation Tabs */}
        <NavigationTabs />

        {/* Family Members Section */}
      <Card className="border-primary-green/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-primary-green flex items-center gap-2">
              <Users className="h-5 w-5" />
              List of group member(s)
            </CardTitle>
          </div>
            <p className="text-sm text-gray-600 mt-2">
              <span dangerouslySetInnerHTML={{ __html: 'To get the <span class="font-semibold text-red-600">Allocation Status</span>, Click on radio button next to your name.' }} />
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <FamilyMembersTable 
              members={familyMembers}
              selectedMembers={selectedMembers}
              onMemberSelection={handleMemberSelection}
              onSelectAll={handleSelectAll}
              selectionMode={'radio'}
              // onUpdateMemberDetails is removed from here as editing is on PassDetailsPage
            />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-white">
          Developed & Designed by <b>Umoor Dakheliyah Colombo</b>
        </div>
      </footer>
    </div>
  );
}