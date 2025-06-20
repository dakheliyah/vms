// src/components/PassDetailsContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { FamilyMember, User, PassPreference } from '@/types';
import useFamilyMembers from '@/lib/hooks/useFamilyMembers'; // Import the hook
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

interface PassDetailsContentProps {
  currentUser: User | null; // Pass currentUser as a prop
}

export default function PassDetailsContent({ currentUser }: PassDetailsContentProps) {
  const { familyMembers, isLoading: isLoadingFamilyMembers, error: familyMembersError, refetch: refetchFamilyMembers } = useFamilyMembers();
  // SelectedMembers is not used for selection actions here, but kept if other logic depends on it.
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); 
  const [passPreferencesData, setPassPreferencesData] = useState<PassPreference[]>([]);
  const [memberPassSelections, setMemberPassSelections] = useState<Record<number, { venueId?: number }>>({});
  const [updatingMembers, setUpdatingMembers] = useState<Set<number>>(new Set()); // Track multiple updating members
  const [bulkUpdateMode, setBulkUpdateMode] = useState<boolean>(false); // Toggle for bulk update mode
  const [bulkVenueId, setBulkVenueId] = useState<string>(''); // Selected venue for bulk update
  
  // Message states for success/error feedback
  const [memberMessages, setMemberMessages] = useState<Record<number, { type: 'success' | 'error'; message: string; timestamp: number }>>({});
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; message: string; timestamp: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const its_no = localStorage.getItem('its_no');
      if (!its_no) {
        console.error('ITS number not found in localStorage');
        return;
      }

      // Fetch Pass Preferences Data
      try {
        const passPrefsResponse = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/vaaz-center-summary?event_id=1', {
          headers: {
            'Token': its_no || '',
          },
        });
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

  // Helper function to clear messages after a timeout
  const clearMessageAfterTimeout = (memberId?: number) => {
    setTimeout(() => {
      if (memberId !== undefined) {
        setMemberMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[memberId];
          return newMessages;
        });
      } else {
        setBulkMessage(null);
      }
    }, 5000); // Clear after 5 seconds
  };

  // Handle loading and error states from the useFamilyMembers hook
  if (isLoadingFamilyMembers) {
    return <div>Loading family member details...</div>;
  }

  if (familyMembersError) {
    return <div>Error loading family details: {familyMembersError}. <Button onClick={refetchFamilyMembers}>Try again</Button></div>;
  }

  interface VenueUpdate {
    its_id: number;
    vaaz_center_id: number;
    event_id: number;
  }

  /**
   * Handles updating venue preferences for one or more family members
   * Uses POST for new preferences and PUT for updating existing ones
   * @param updates - Single update object or array of update objects
   * @returns Promise<boolean> - Returns true if successful, false if failed
   */
  const handleVenueUpdate = async (updates: VenueUpdate | VenueUpdate[]): Promise<boolean> => {
    const updateArray = Array.isArray(updates) ? updates : [updates];
    
    // Add all member IDs to updating state
    setUpdatingMembers(prev => {
      const newSet = new Set(prev);
      updateArray.forEach(update => newSet.add(update.its_id));
      return newSet;
    });
    
    const its_no = localStorage.getItem('its_no');
    
    try {
      // Group updates by whether they are new or existing preferences
      const newPreferences: VenueUpdate[] = [];
      const existingPreferences: VenueUpdate[] = [];
      
      updateArray.forEach(update => {
        const member = familyMembers.find(m => m.its_id === update.its_id);
        const hasExistingPreference = member?.pass_preferences && member.pass_preferences.length > 0;
        
        if (hasExistingPreference) {
          existingPreferences.push(update);
        } else {
          newPreferences.push(update);
        }
      });
      
      const promises = [];
      
      // Handle new preferences with POST
      if (newPreferences.length > 0) {
        const postPromise = fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/vaaz-center', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': its_no || '',
          },
          body: JSON.stringify(newPreferences),
        });
        promises.push(postPromise);
      }
      
      // Handle existing preferences with PUT
      if (existingPreferences.length > 0) {
        const putPromise = fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/vaaz-center', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Token': its_no || '',
          },
          body: JSON.stringify(existingPreferences),
        });
        promises.push(putPromise);
      }
      
      // Execute all requests
      const responses = await Promise.all(promises);
      
      // Check if all responses are ok
      for (const response of responses) {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update venue preference');
        }
      }
      
      console.log('Update successful for all preferences');
      
      // Set success messages
      const totalUpdates = updateArray.length;
      const newCount = newPreferences.length;
      const updateCount = existingPreferences.length;
      const timestamp = Date.now();
      
      if (totalUpdates === 1) {
        // Individual update
        const memberId = updateArray[0].its_id;
        const message = newCount > 0 ? 'Venue preference set successfully!' : 'Venue preference updated successfully!';
        setMemberMessages(prev => ({
          ...prev,
          [memberId]: { type: 'success', message, timestamp }
        }));
        clearMessageAfterTimeout(memberId);
        toast.success(message);
      } else {
        // Bulk update
        const parts = [];
        if (newCount > 0) parts.push(`${newCount} new preference${newCount > 1 ? 's' : ''} set`);
        if (updateCount > 0) parts.push(`${updateCount} preference${updateCount > 1 ? 's' : ''} updated`);
        const message = parts.join(' and ') + ' successfully!';
        setBulkMessage({ type: 'success', message, timestamp });
        clearMessageAfterTimeout();
        toast.success(message);
      }
      
      // Refetch family members to get updated data
      // await refetchFamilyMembers();
      
      return true; // Success
    } catch (error) {
      console.error('Error updating venue preference:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update venue preference';
      const timestamp = Date.now();
      
      if (updateArray.length === 1) {
        // Individual update error
        const memberId = updateArray[0].its_id;
        setMemberMessages(prev => ({
          ...prev,
          [memberId]: { type: 'error', message: errorMessage, timestamp }
        }));
        clearMessageAfterTimeout(memberId);
      } else {
        // Bulk update error
        setBulkMessage({ type: 'error', message: errorMessage, timestamp });
        clearMessageAfterTimeout();
      }
      
      // Show error toast
      toast.error(errorMessage);
      
      return false; // Failure
    } finally {
      // Clear updating state for all members
      setUpdatingMembers(prev => {
        const newSet = new Set(prev);
        updateArray.forEach(update => newSet.delete(update.its_id));
        return newSet;
      });
    }
  };

  /**
   * Handles individual venue changes from the dropdown
   * @param memberId - The ITS ID of the family member
   * @param venueIdString - The selected venue ID as a string
   */
  const handleVenueChange = async (memberId: number, venueIdString: string) => {
    const venueId = parseInt(venueIdString, 10);
    
    const success = await handleVenueUpdate({
      its_id: memberId,
      vaaz_center_id: venueId,
      event_id: 1
    });
    
    // Only update local state if API call was successful
    if (success) {
      setMemberPassSelections(prev => ({
        ...prev,
        [memberId]: { venueId }
      }));
    }
  };

  /**
   * Example function for batch updating multiple members at once
   * This can be called from external components or event handlers
   */
  const handleBatchVenueUpdate = async (memberUpdates: Array<{ memberId: number; venueId: number }>) => {
    const updates = memberUpdates.map(({ memberId, venueId }) => ({
      its_id: memberId,
      vaaz_center_id: venueId,
      event_id: 1
    }));
    
    // Send batch update to API
    const success = await handleVenueUpdate(updates);
    
    // Only update local state if API call was successful
    if (success) {
      const newSelections = { ...memberPassSelections };
      memberUpdates.forEach(({ memberId, venueId }) => {
        newSelections[memberId] = { venueId };
      });
      setMemberPassSelections(newSelections);
    }
  };

  /**
   * Handles bulk update of all family members to the same venue
   */
  const handleBulkUpdate = async () => {
    if (!bulkVenueId || familyMembers.length === 0) {
      toast.error('Please select a venue for bulk update');
      return;
    }

    const venueId = parseInt(bulkVenueId, 10);
    const updates = familyMembers.map(member => ({
      its_id: member.its_id,
      vaaz_center_id: venueId,
      event_id: 1
    }));

    // Send bulk update to API
    const success = await handleVenueUpdate(updates);
    
    // Only update local state and reset bulk mode if API call was successful
    if (success) {
      const newSelections = { ...memberPassSelections };
      familyMembers.forEach(member => {
        newSelections[member.its_id] = { venueId };
      });
      setMemberPassSelections(newSelections);
      
      // Reset bulk update mode after successful update
      setBulkUpdateMode(false);
      setBulkVenueId('');
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
      <h1 className="text-xl md:text-2xl font-semibold text-primary-green mb-4">Waaz Centre Preference Survey</h1>
      <Card className="border-primary-green/20">
        <CardHeader>
          <p className="text-sm text-gray-600 mt-2">
            Mumineen with Raza for Colombo Relay Centre can choose their preferred Waaz Centre from two available options.
          </p>
          <ul className='list-disc pl-6 text-sm text-gray-600'>
            <li>Husaini Masjid Complex - CMZ</li>
            <li>Mufaddal Centre - MCZ</li>
          </ul>
          <p className='text-sm text-gray-600'>
            Instructions:
            {/* Mumineen are encouraged to study the locality of both Centres by going to <a href="https://colombo-relay.asharamubaraka.net/waaz-centres/" target="_blank" rel="noopener noreferrer" className='text-red-600 break-all'>https://colombo-relay.asharamubaraka.net/waaz-centres/</a> before updating the survey */}
          </p>
          <ul className='text-sm text-gray-600 list-disc pl-6'>
            <li>Selection is subject to availability of quota.</li>
            <li>Once this survey is closed your preference cannot be changed.</li>
          </ul>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Bulk Update Controls */}
          <div className="mb-6 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    type="button"
                    id="bulkMode"
                    onClick={() => setBulkUpdateMode(!bulkUpdateMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      bulkUpdateMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        bulkUpdateMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="bulkMode" className="text-sm md:text-base font-semibold text-gray-800 cursor-pointer">
                    Bulk Update Mode
                  </label>
                  <span className="text-xs md:text-sm text-gray-600">
                    Update all family members to the same venue at once
                  </span>
                </div>
              </div>
            </div>
            
            {bulkUpdateMode && (
              <div className="mt-4 p-3 md:p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Venue for All Members
                    </label>
                    <Select
                      value={bulkVenueId}
                      onValueChange={setBulkVenueId}
                      disabled={updatingMembers.size > 0}
                    >
                      <SelectTrigger className="h-11 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                        <SelectValue placeholder="Choose a venue for all family members" />
                      </SelectTrigger>
                      <SelectContent>
                        {passPreferencesData.map((preference) => (
                          <SelectItem key={preference.id} value={preference.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>{preference.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-2 md:min-w-fit">
                    <Button
                      onClick={handleBulkUpdate}
                      disabled={!bulkVenueId || updatingMembers.size > 0}
                      className="h-11 px-4 md:px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      {updatingMembers.size > 0 ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Updating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Update All ({familyMembers.length})</span>
                        </div>
                      )}
                    </Button>
                    {bulkVenueId && (
                      <span className="text-xs text-gray-500 text-center">
                        {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''} will be updated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Bulk Message Display */}
          {bulkMessage && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              bulkMessage.type === 'success' 
                ? 'bg-green-50 border-green-400 text-green-800' 
                : 'bg-red-50 border-red-400 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  bulkMessage.type === 'success' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="font-medium">{bulkMessage.message}</span>
              </div>
            </div>
          )}
          
          {/* Desktop Table View */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-tertiary-gold text-white">
              <div className="grid grid-cols-12 gap-2 p-3 text-sm font-medium text-primary">
                <div className="col-span-2">ITS No</div>
                <div className="col-span-4">Full Name</div>
                <div className="col-span-6">Venue</div>
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
                          value={memberPassSelections[member.its_id]?.venueId?.toString() || member.pass_preferences?.[0]?.vaaz_center_id?.toString() || ''}
                          onValueChange={(value) => handleVenueChange(member.its_id, value)}
                          disabled={isUpdatingThisMember || member.pass_preferences?.[0]?.is_locked}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Venue" />
                          </SelectTrigger>
                          <SelectContent>
                            {passPreferencesData.map((preference) => {
                              let isDisabled = false;
                              if (member.gender?.toLowerCase() === 'male') {
                                isDisabled = preference.male_availability === 0;
                              } else if (member.gender?.toLowerCase() === 'female') {
                                isDisabled = preference.female_availability === 0;
                              }
                              // If gender is not 'male' or 'female', or if preference availability for that gender is not defined,
                              // we might keep it enabled or disable it based on total availability as a fallback.
                              // For now, if gender doesn't match or availability field is missing, it's not explicitly disabled by this logic.
                              // Consider adding a check for preference.vaaz_center_availability === 0 as a general fallback if needed.
                              return (
                                <SelectItem
                                  key={preference.id}
                                  value={preference.id.toString()}
                                  disabled={isDisabled || isUpdatingThisMember}
                                >
                                  {preference.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {memberMessages[member.its_id] && (
                          <div className={`flex items-center space-x-2 text-xs px-2 py-1 rounded ${
                            memberMessages[member.its_id].type === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              memberMessages[member.its_id].type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span>{memberMessages[member.its_id].message}</span>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              )}
              )}
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
                        <div className="text-base font-medium text-gray-900">{member.fullname} ({member.gender})</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">Venue Preference</div>
                        <div className="space-y-2">
                          <Select
                            value={memberPassSelections[member.its_id]?.venueId?.toString() || member.pass_preferences?.[0]?.vaaz_center_id?.toString() || ''}
                            onValueChange={(value) => handleVenueChange(member.its_id, value)}
                            disabled={isUpdatingThisMember}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Venue" />
                            </SelectTrigger>
                            <SelectContent>
                              {passPreferencesData.map((preference) => {
                                let isDisabled = false;
                                if (member.gender?.toLowerCase() === 'male') {
                                  isDisabled = preference.male_availability === 0;
                                } else if (member.gender?.toLowerCase() === 'female') {
                                  isDisabled = preference.female_availability === 0;
                                }
                                return (
                                  <SelectItem
                                    key={preference.id}
                                    value={preference.id.toString()}
                                    disabled={isDisabled || isUpdatingThisMember}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                      <span>{preference.name}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {memberMessages[member.its_id] && (
                          <div className={`flex items-center space-x-2 text-sm px-3 py-2 rounded-lg ${
                            memberMessages[member.its_id].type === 'success'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              memberMessages[member.its_id].type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="font-medium">{memberMessages[member.its_id].message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          )}
          </div>
        </CardContent>
      </Card>
    </>
)}
