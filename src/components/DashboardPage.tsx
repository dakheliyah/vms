'use client';

import { useState, useEffect } from 'react';
import { FamilyMember, User } from '@/types';
import DashboardHeader from './DashboardHeader';
// import FamilyMembersTable from './FamilyMembersTable'; // Removed as per new requirement
// import PassStatusSection from './PassStatusSection'; // Removed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; // Added for navigation tabs
import { Button } from '@/components/ui/button';
import { Plus, Users, Edit, HomeIcon } from 'lucide-react';
// import AccommodationForm from './AccommodationForm'; // Removed, as accommodation details are on a separate page

export default function DashboardPage() {
  // const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // Removed
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
            fullname: apiUser.fullname,
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

      // Fetch Family Members Details using the provided API
      try {
        const familyResponse = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/family-by-its-id?its_id=${its_no}&event_id=1`);
        if (!familyResponse.ok) {
          throw new Error(`Family API request failed with status ${familyResponse.status}`);
        }
        const familyResult = await familyResponse.json();
        // Assuming the API directly returns an array of family members as per the sample response
        if (familyResult.success && familyResult.data) {
          const transformedFamilyMembers: FamilyMember[] = familyResult.data.map((apiMember: any) => ({
            its_id: apiMember.its_id,
            fullname: apiMember.fullname,
            country: apiMember.country,
            venue_waaz: apiMember.venue_waaz,
            acc_zone: apiMember.acc_zone,
            gender: apiMember.gender,
          }));
          setFamilyMembers(transformedFamilyMembers);
        } else {
          console.error('Family API request was not successful or data is missing/malformed', familyResult);
          setFamilyMembers([]); // Set to empty array on error or bad data
        }
      } catch (error) {
        console.error('Failed to fetch family data:', error);
        setFamilyMembers([]); // Set to empty array on fetch error
      }
    };

    fetchData();
  }, []);

  // Removed handleUpdateMemberDetails and handleSaveChanges as they are not needed for the new table display


  if (!currentUser) {
    // TODO: Add a proper loading state or spinner
    return <div>Loading 03...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream/20 to-white">
      {/* Header */}
      <DashboardHeader user={currentUser} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* Family Members Section */}
        <Card className="border-primary-green/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-primary-green flex items-center gap-2">
                <Users className="h-5 w-5" />
                List of family member(s)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {familyMembers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ITS ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue Waaz</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accommodation Zone</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {familyMembers.map((member) => (
                      <tr key={member.its_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.its_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.fullname}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.country || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.venue_waaz || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.acc_zone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No family members found or data is loading.</p>
            )}
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