// src/components/HomeDashboardContent.tsx
'use client';

import { User } from '@/types'; // Removed useState, useEffect, FamilyMember (it will come from hook)
import useFamilyMembers from '@/lib/hooks/useFamilyMembers'; // Added hook import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useEffect } from 'react';

interface HomeDashboardContentProps {
  currentUser: User | null; // Pass currentUser as a prop
}

export default function HomeDashboardContent({ currentUser }: HomeDashboardContentProps) {
  // TODO: The useFamilyMembers hook currently doesn't take any parameters like currentUser.its_id.
  // It needs to be modified or a new hook created if family members are specific to the currentUser.
  // For now, assuming useFamilyMembers fetches all relevant family members or is context-aware.
  const { familyMembers, isLoading, error: familyError, refetch: refetchFamilyMembers } = useFamilyMembers();

  useEffect(() => {
    // If fetching family members depends on currentUser, trigger refetch when currentUser is available
    if (currentUser && currentUser.its_id) {
      // Potentially pass currentUser.its_id to refetchFamilyMembers if the hook supports it
      // refetchFamilyMembers(currentUser.its_id); 
    } else {
      // Handle case where currentUser is not available (e.g., clear family members or show a message)
    }
  }, [currentUser, refetchFamilyMembers]);

  if (isLoading) {
    return <div className="text-center py-4">Loading family members...</div>;
  }

  if (familyError) {
    return <div className="text-center py-4 text-red-500">Error loading family members: {familyError}</div>;
  }

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
          {/* Optional: Add a button to refetch family members */}
          {/* <button onClick={() => refetchFamilyMembers()} className="text-sm text-blue-500">Refresh</button> */}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {familyMembers && familyMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ITS ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waaz Centre</th>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Type</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {familyMembers.map((member) => (
                  <tr key={member.its_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.its_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.fullname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.pass_preferences?.[0]?.vaaz_center_name || 'Not Selected'}</td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.acc_zone || 'Not Selected'}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            {currentUser && currentUser.its_id ? 'No family members found.' : 'User information not available to load family members.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}