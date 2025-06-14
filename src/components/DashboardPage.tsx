'use client';

import { useState } from 'react';
import { mockUser, mockFamilyMembers } from '@/data/mockData';
import { FamilyMember } from '@/types';
import DashboardHeader from './DashboardHeader';
import FamilyMembersTable from './FamilyMembersTable';
import PassStatusSection from './PassStatusSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Edit } from 'lucide-react';
import AccommodationForm from './AccommodationForm'; // Added import

export default function DashboardPage() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(mockFamilyMembers); // Changed to allow updates
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedForBulkEdit, setSelectedForBulkEdit] = useState<string[]>([]);
  const [showBulkAccommodationForm, setShowBulkAccommodationForm] = useState(false);
  const [bulkZone, setBulkZone] = useState<'CMZ' | 'MCZ' | ''>('');
  const [bulkSpecialPassRequest, setBulkSpecialPassRequest] = useState<'Rahat' | 'Non Critical Rahat' | 'Mum with Kids' | ''>('');

  const handleMemberSelection = (memberId: string, isSelected: boolean) => {
    if (bulkEditMode) {
      // For checkboxes in bulk edit mode
      setSelectedForBulkEdit(prev => 
        isSelected 
          ? [...prev, memberId]
          : prev.filter(id => id !== memberId)
      );
    } else {
      // For radio buttons in normal mode
      if (isSelected) {
        setSelectedMembers([memberId]);
      } else {
        setSelectedMembers([]);
      }
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (bulkEditMode) {
      setSelectedForBulkEdit(isSelected ? familyMembers.map(member => member.id) : []);
    } else {
      // When not in bulk edit mode, selecting all is not typical for radio buttons, 
      // but if needed, it would select the first member or clear selection.
      // For now, let's assume selectAll is primarily for bulk edit mode.
      if (isSelected && familyMembers.length > 0) {
        setSelectedMembers([familyMembers[0].id]);
      } else {
        setSelectedMembers([]);
      }
    }
  };

  const handleUpdateMemberDetails = (memberId: string, details: Partial<FamilyMember>) => {
    setFamilyMembers(prevMembers => 
      prevMembers.map(member => 
        member.id === memberId ? { ...member, ...details } : member
      )
    );
    // If the updated member is the currently selected one for PassStatusSection, refresh its view
    if (selectedMembers.includes(memberId) && !bulkEditMode) {
      // This might involve re-fetching or just relying on the state update to re-render PassStatusSection
      // For now, the state update of familyMembers should trigger a re-render.
    }
  };

  const handleBulkUpdateDetails = (details: Partial<Pick<FamilyMember, 'zone' | 'specialPassRequest'>>) => {
    setFamilyMembers(prevMembers =>
      prevMembers.map(member =>
        selectedForBulkEdit.includes(member.id) ? { ...member, ...details } : member
      )
    );
    // Optionally, clear selection or exit bulk edit mode after update
    // setBulkEditMode(false);
    // setSelectedForBulkEdit([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream/20 to-white">
      {/* Header */}
      <DashboardHeader user={mockUser} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* User Info Card */}
        <Card className="border-primary-green/20">
          <CardHeader>
            <CardTitle className="text-primary-green">
              {selectedMembers.length > 0 
                ? familyMembers.find(m => m.id === selectedMembers[0])?.fullName + ' - ' + selectedMembers[0]
                : mockUser.name + ' - ' + mockUser.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <PassStatusSection 
               member={selectedMembers.length > 0 
                 ? {
                     id: familyMembers.find(m => m.id === selectedMembers[0])?.id || '',
                     fullName: familyMembers.find(m => m.id === selectedMembers[0])?.fullName,
                     registrationStatus: familyMembers.find(m => m.id === selectedMembers[0])?.registrationStatus,
                     passStatus: familyMembers.find(m => m.id === selectedMembers[0])?.passStatus,
                     dataStatus: familyMembers.find(m => m.id === selectedMembers[0])?.dataStatus,
                     zone: familyMembers.find(m => m.id === selectedMembers[0])?.zone, // Added zone
                     specialPassRequest: familyMembers.find(m => m.id === selectedMembers[0])?.specialPassRequest, // Added specialPassRequest
                     accommodation: familyMembers.find(m => m.id === selectedMembers[0])?.accommodation
                   }
                 : {
                     id: mockUser.id,
                     name: mockUser.name,
                     registrationStatus: 'REGISTERED',
                     passStatus: 'ALLOCATED',
                     dataStatus: 'VERIFIED',
                     zone: mockUser.zone, // Added zone for mockUser if available
                     specialPassRequest: mockUser.specialPassRequest // Added specialPassRequest for mockUser if available
                   }}
               bulkEditMode={bulkEditMode}
               selectedForBulkEdit={selectedForBulkEdit}
               onUpdateMember={handleUpdateMemberDetails} // Added prop
             />
             
             <div className="bg-secondary-cream/10 p-4 rounded-lg border border-secondary-cream/20">
               <h3 className="font-medium text-primary-green mb-2">Accommodation Details</h3>
               <div className="grid grid-cols-2 gap-2 text-sm">
                 {selectedMembers.length > 0 ? (
                   <>
                     <div>
                       <span className="text-gray-500">Type:</span>
                       <span className="ml-2 font-medium">{familyMembers.find(m => m.id === selectedMembers[0])?.accommodation?.type}</span>
                     </div>
                     <div>
                       <span className="text-gray-500">Room:</span>
                       <span className="ml-2 font-medium">{familyMembers.find(m => m.id === selectedMembers[0])?.accommodation?.roomNumber}</span>
                     </div>
                     <div>
                       <span className="text-gray-500">Building:</span>
                       <span className="ml-2 font-medium">{familyMembers.find(m => m.id === selectedMembers[0])?.accommodation?.building}</span>
                     </div>
                     <div>
                       <span className="text-gray-500">Check-in:</span>
                       <span className="ml-2 font-medium">{familyMembers.find(m => m.id === selectedMembers[0])?.accommodation?.checkIn}</span>
                     </div>
                     <div>
                       <span className="text-gray-500">Check-out:</span>
                       <span className="ml-2 font-medium">{familyMembers.find(m => m.id === selectedMembers[0])?.accommodation?.checkOut}</span>
                     </div>
                   </>
                 ) : (
                   <div className="col-span-2 text-gray-500">
                     No accommodation details available for the logged-in user.
                   </div>
                 )}
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Family Members Section */}
      <Card className="border-primary-green/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-primary-green flex items-center gap-2">
              <Users className="h-5 w-5" />
              List of group member(s)
            </CardTitle>
            {!bulkEditMode && selectedMembers.length === 0 && (
              <Button 
                onClick={() => {
                  setBulkEditMode(true);
                  setSelectedForBulkEdit([]); // Clear selection when entering bulk mode
                }}
              >
                Bulk Edit Accommodation
              </Button>
            )}
            {bulkEditMode && (
              <Button 
                variant={'destructive'}
                onClick={() => {
                  setBulkEditMode(false);
                  setSelectedForBulkEdit([]);
                  setShowBulkAccommodationForm(false); // Hide form on cancel
                }}
              >
                Cancel Bulk Edit
              </Button>
            )}
          </div>
            <p className="text-sm text-gray-600 mt-2">
              {bulkEditMode 
                ? 'Select members to update their accommodation details together.'
                : <span dangerouslySetInnerHTML={{ __html: 'To get the <span class="font-semibold text-red-600">Allocation Status</span>, Click on radio button next to your name.' }} />}
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <FamilyMembersTable 
              members={familyMembers}
              selectedMembers={bulkEditMode ? selectedForBulkEdit : selectedMembers}
              onMemberSelection={handleMemberSelection}
              onSelectAll={handleSelectAll}
              selectionMode={bulkEditMode ? 'checkbox' : 'radio'}
              bulkEditMode={bulkEditMode} // Pass bulkEditMode
              onUpdateMemberDetails={handleUpdateMemberDetails} // Pass handler for individual updates
            />
            {bulkEditMode && selectedForBulkEdit.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setShowBulkAccommodationForm(true)} className="mr-2">
                  <Edit className="mr-2 h-4 w-4" /> Update Accommodation for Selected ({selectedForBulkEdit.length})
                </Button>
                {/* TODO: Add a similar button/form for bulk updating Zone and Special Pass if needed */}
              </div>
            )}
            {bulkEditMode && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2 text-primary-green">Bulk Update Zone & Special Pass for Selected ({selectedForBulkEdit.length})</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bulk-zone-select" className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                    <select 
                      id="bulk-zone-select"
                      className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-green focus:border-primary-green sm:text-sm"
                      value={bulkZone}
                      onChange={(e) => setBulkZone(e.target.value as 'CMZ' | 'MCZ' | '')}
                    >
                      <option value="" disabled>Select Zone</option>
                      <option value="CMZ">CMZ</option>
                      <option value="MCZ">MCZ</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bulk-special-pass-select" className="block text-sm font-medium text-gray-700 mb-1">Special Pass Request</label>
                    <select 
                      id="bulk-special-pass-select"
                      className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-green focus:border-primary-green sm:text-sm"
                      value={bulkSpecialPassRequest}
                      onChange={(e) => setBulkSpecialPassRequest(e.target.value as 'Rahat' | 'Non Critical Rahat' | 'Mum with Kids' | '')}
                    >
                      <option value="" disabled>Select Special Pass</option>
                      <option value="Rahat">Rahat</option>
                      <option value="Non Critical Rahat">Non Critical Rahat</option>
                      <option value="Mum with Kids">Mum with Kids</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setBulkZone('');
                      setBulkSpecialPassRequest('');
                      // Optionally, you might want to hide this section or clear selectedForBulkEdit
                      // For example, if this cancel should also exit the bulk edit for this specific section:
                      // setShowBulkZoneSpecialPassForm(false); // Assuming you'd wrap this section in a conditional show state
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      const updates: Partial<Pick<FamilyMember, 'zone' | 'specialPassRequest'>> = {};
                      if (bulkZone) updates.zone = bulkZone;
                      if (bulkSpecialPassRequest) updates.specialPassRequest = bulkSpecialPassRequest;
                      if (Object.keys(updates).length > 0) {
                        handleBulkUpdateDetails(updates);
                      }
                      console.log('Bulk update saved for Zone & Special Pass with:', updates);
                      // Optionally reset after save
                      setBulkZone('');
                      setBulkSpecialPassRequest('');
                    }}
                    disabled={!bulkZone && !bulkSpecialPassRequest} // Disable save if nothing is selected
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {showBulkAccommodationForm && (
          <Card className="border-primary-green/20 mt-6">
            <CardHeader className="bg-primary-green/5">
              <CardTitle className="text-primary-green">Update Accommodation for Selected Members</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AccommodationForm 
                onSubmit={(data) => {
                  // TODO: Implement bulk update logic here
                  console.log('Bulk update data:', data, 'for members:', selectedForBulkEdit);
                  setShowBulkAccommodationForm(false);
                  setBulkEditMode(false);
                  setSelectedForBulkEdit([]);
                }}
                onCancel={() => setShowBulkAccommodationForm(false)}
              />
            </CardContent>
          </Card>
        )}
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