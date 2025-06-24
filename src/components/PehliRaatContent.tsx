// src/components/PassDetailsContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { FamilyMember, User, PassPreference } from '@/types';
import useFamilyMembers from '@/lib/hooks/useFamilyMembers'; // Import the hook
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

interface PehliRaatContentProps {
  currentUser: User | null; // Pass currentUser as a prop
}

export default function PehliRaatContent({ currentUser }: PehliRaatContentProps) {
  const { familyMembers, isLoading: isLoadingFamilyMembers, error: familyMembersError, refetch: refetchFamilyMembers } = useFamilyMembers(2);
  // Track attendance selection for family members (3 = attending, 4 = not attending)
  const [memberAttendance, setMemberAttendance] = useState<Record<number, number>>({});
  const [updatingMembers, setUpdatingMembers] = useState<Set<number>>(new Set()); // Track multiple updating members

  // Message states for success/error feedback
  const [memberMessages, setMemberMessages] = useState<Record<number, { type: 'success' | 'error'; message: string; timestamp: number }>>({});

  // Handle attendance selection for family members
  const handleAttendanceChange = async (memberId: number, vaazCenterId: number) => {
    // Add member to updating state
    setUpdatingMembers(prev => new Set(prev).add(memberId));

    const its_no = localStorage.getItem('its_no');

    try {
      const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/vaaz-center', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Token': its_no || '',
        },
        body: JSON.stringify([{
          its_id: memberId,
          vaaz_center_id: vaazCenterId,
          event_id: 2
        }]),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update attendance response');
      }

      // Success - update member attendance
      setMemberAttendance(prev => ({
        ...prev,
        [memberId]: vaazCenterId
      }));

      const attendanceText = vaazCenterId === 3 ? 'Attending' : 'Not Attending';
      setMemberMessages(prev => ({
        ...prev,
        [memberId]: { type: 'success', message: `${attendanceText} response submitted successfully!`, timestamp: Date.now() }
      }));
      clearMessageAfterTimeout(memberId);
      toast.success(`${attendanceText} response submitted successfully!`);

    } catch (error) {
      console.error('Error submitting attendance response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit attendance response';
      setMemberMessages(prev => ({
        ...prev,
        [memberId]: { type: 'error', message: errorMessage, timestamp: Date.now() }
      }));
      clearMessageAfterTimeout(memberId);
      toast.error(errorMessage);
    } finally {
      // Remove from updating state
      setUpdatingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  // Helper function to clear messages after a timeout
  const clearMessageAfterTimeout = (memberId: number) => {
    setTimeout(() => {
      setMemberMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[memberId];
        return newMessages;
      });
    }, 5000); // Clear after 5 seconds
  };

  // Handle loading and error states from the useFamilyMembers hook
  if (isLoadingFamilyMembers) {
    return <div>Loading family member details...</div>;
  }

  if (familyMembersError) {
    return <div>Error loading family details: {familyMembersError}. <Button onClick={refetchFamilyMembers}>Try again</Button></div>;
  }



  if (!currentUser) {
    // This component expects currentUser to be passed, 
    // so loading state might be handled by the parent.
    // Or, display a specific message if currentUser is null when it shouldn't be.
    return <div>Loading user information or user not available...</div>;
  }

  return (
    <>
      <h1 className="text-xl md:text-2xl font-semibold text-primary-green mb-4">Pehli Raat Survey</h1>
      <Card className="border-primary-green/20">
        <CardHeader>
          <p className="text-md text-gray-600 mt-2">
            Pehli Raat Majlis & Jaman will be held at Mufaddal Centre (SLECC) - MCZ <br /> <a className='text-red-600' href="https://maps.app.goo.gl/f2BbymaMTefYwryN8" target="_blank" rel="noopener noreferrer">https://maps.app.goo.gl/f2BbymaMTefYwryN8</a>.
          </p>
          <p className='text-sm text-gray-600 pt-2 font-bold'>
            Kindly update your attendance below.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Desktop Table View */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-tertiary-gold text-white">
              <div className="grid grid-cols-12 gap-2 p-3 text-sm font-medium text-primary">
                <div className="col-span-2">ITS No</div>
                <div className="col-span-4">Full Name</div>
                <div className="col-span-6">Attendance Status</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="bg-white">
              {familyMembers.map((member) => {
                const isUpdatingThisMember = updatingMembers.has(member.its_id);
                return (
                  <div
                    key={member.its_id}
                    className={`grid grid-cols-12 gap-2 p-3 text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors items-center ${isUpdatingThisMember ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="col-span-2 font-medium text-gray-700">
                      {member.its_id}
                    </div>
                    <div className="col-span-4 font-medium text-gray-900">
                      <div>{member.fullname}</div>
                    </div>
                    <div className="col-span-6">
                      <div className="space-y-2">
                        <Select
                          value={memberAttendance[member.its_id]?.toString() || member.pass_preferences?.[0]?.vaaz_center_id?.toString() || ""}
                          onValueChange={(value) => handleAttendanceChange(member.its_id, parseInt(value))}
                          disabled={isUpdatingThisMember}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select attendance status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">Attending</SelectItem>
                            <SelectItem value="4">Not Attending</SelectItem>
                          </SelectContent>
                        </Select>
                        {isUpdatingThisMember && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-blue-600 font-medium">Updating...</span>
                          </div>
                        )}
                        {memberMessages[member.its_id] && (
                          <div className={`flex items-center space-x-2 text-xs px-2 py-1 rounded ${memberMessages[member.its_id].type === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${memberMessages[member.its_id].type === 'success' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                            <span>{memberMessages[member.its_id].message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {familyMembers.map((member) => {
              const isUpdatingThisMember = updatingMembers.has(member.its_id);
              return (
                <Card key={member.its_id} className={`border border-gray-200 shadow-sm ${isUpdatingThisMember ? 'opacity-50 pointer-events-none' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-500">ITS No</div>
                          <div className="text-base font-semibold text-gray-900">{member.its_id}</div>
                        </div>
                        {isUpdatingThisMember && (
                          <div className="flex items-center space-x-2 px-2 py-1 bg-blue-100 rounded-full">
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-blue-700">Updating</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Full Name</div>
                        <div className="text-base font-medium text-gray-900">{member.fullname}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">Attendance Status</div>
                        <div className="space-y-3">
                          <Select
                            value={memberAttendance[member.its_id]?.toString() || member.pass_preferences?.[0]?.vaaz_center_id?.toString() || ""}
                            onValueChange={(value) => handleAttendanceChange(member.its_id, parseInt(value))}
                            disabled={isUpdatingThisMember}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select attendance status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">Attending</SelectItem>
                              <SelectItem value="4">Not Attending</SelectItem>
                            </SelectContent>
                          </Select>
                          {memberMessages[member.its_id] && (
                            <div className={`flex items-center space-x-2 text-sm px-3 py-2 rounded-lg ${memberMessages[member.its_id].type === 'success'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                              <div className={`w-2 h-2 rounded-full ${memberMessages[member.its_id].type === 'success' ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                              <span className="font-medium">{memberMessages[member.its_id].message}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
