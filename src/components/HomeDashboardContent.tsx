// src/components/HomeDashboardContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { FamilyMember, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface HomeDashboardContentProps {
  currentUser: User | null; // Pass currentUser as a prop
}

export default function HomeDashboardContent({ currentUser }: HomeDashboardContentProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    const fetchFamilyData = async () => {
      if (!currentUser || !currentUser.its_id) {
        // console.error('Current user or ITS ID not available for fetching family data.');
        setFamilyMembers([]); // Clear family members if no user
        return;
      }
      
      const its_no = localStorage.getItem('its_no');
      if (!its_no) {
        console.error('ITS number not found in localStorage');
        return;
      }

      try {
        const familyResponse = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/family-by-its-id?its_id=${its_no}`);
        if (!familyResponse.ok) {
          throw new Error(`Family API request failed with status ${familyResponse.status}`);
        }
        const familyResult = await familyResponse.json();
        if (familyResult.success && familyResult.data) {
          const transformedFamilyMembers: FamilyMember[] = familyResult.data.map((apiMember: any) => ({
            its_id: apiMember.its_id,
            fullname: apiMember.fullname,
            country: apiMember.country,
            venue_waaz: apiMember.venue_waaz,
            acc_zone: apiMember.acc_zone,
            gender: apiMember.gender, // Ensure gender is mapped if available and needed
          }));
          setFamilyMembers(transformedFamilyMembers);
        } else {
          console.error('Family API request was not successful or data is missing/malformed', familyResult);
          setFamilyMembers([]);
        }
      } catch (error) {
        console.error('Failed to fetch family data:', error);
        setFamilyMembers([]);
      }
    };

    fetchFamilyData();
  }, [currentUser]); // Re-fetch if currentUser changes

  // if (!currentUser) {
  //   // This can be handled by the parent, or show a specific message
  //   return <div>Loading user data to fetch family members...</div>;
  // }

  return (
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waaz Centre</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {familyMembers.map((member) => (
                  <tr key={member.its_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.its_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.fullname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.venue_waaz || 'Not Selected'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.acc_zone || 'Not Selected'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            {currentUser && currentUser.its_id ? 'No family members found or data is loading.' : 'Loading user information...'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}