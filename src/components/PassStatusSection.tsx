'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AccommodationForm from './AccommodationForm';

interface PassStatusSectionProps {
  member?: {
    id: string;
    name?: string;
    fullName?: string;
    registrationStatus?: string;
    passStatus?: string;
    dataStatus?: string;
    zone?: 'CMZ' | 'MCZ';
    specialPassRequest?: 'Rahat' | 'Non Critical Rahat' | 'Mum with Kids';
    accommodation?: {
      type: string;
      roomNumber: string;
      building: string;
      checkIn: string;
      checkOut: string;
    };
  };
  bulkEditMode?: boolean;
  selectedForBulkEdit?: string[];
  onUpdateMember: (memberId: string, updates: Partial<FamilyMember>) => void; // Added for updates
}

import { FamilyMember } from '@/types'; // Added for FamilyMember type
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added for Select component

export default function PassStatusSection({ member, onUpdateMember }: PassStatusSectionProps) {
  const [isEditingAccommodation, setIsEditingAccommodation] = useState(false);
  const [isEditingPassDetails, setIsEditingPassDetails] = useState(false);
  const [selectedZone, setSelectedZone] = useState(member?.zone || '');
  const [selectedSpecialPass, setSelectedSpecialPass] = useState(member?.specialPassRequest || '');
  
  if (!member) return null;

  const handleAccommodationSave = (data: {
    type: string;
    roomNumber: string;
    building: string;
    checkIn: string;
    checkOut: string;
  }) => {
    onUpdateMember(member!.id, { accommodation: data });
    setIsEditingAccommodation(false);
  };

  const handlePassDetailsSave = () => {
    onUpdateMember(member!.id, { 
      zone: selectedZone as 'CMZ' | 'MCZ', 
      specialPassRequest: selectedSpecialPass as 'Rahat' | 'Non Critical Rahat' | 'Mum with Kids' 
    });
    setIsEditingPassDetails(false);
  };

  if (isEditingAccommodation) {
    return (
      <div className="space-y-4">
        <AccommodationForm
          initialData={member.accommodation}
          onSubmit={handleAccommodationSave}
          onCancel={() => setIsEditingAccommodation(false)}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Pass Details Edit Form */}
      {isEditingPassDetails ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label htmlFor="zone-select" className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger id="zone-select">
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CMZ">CMZ</SelectItem>
                  <SelectItem value="MCZ">MCZ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="special-pass-select" className="block text-sm font-medium text-gray-700 mb-1">Special Pass Request</label>
              <Select value={selectedSpecialPass} onValueChange={setSelectedSpecialPass}>
                <SelectTrigger id="special-pass-select">
                  <SelectValue placeholder="Select Special Pass Request" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rahat">Rahat</SelectItem>
                  <SelectItem value="Non Critical Rahat">Non Critical Rahat</SelectItem>
                  <SelectItem value="Mum with Kids">Mum with Kids</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditingPassDetails(false)}>Cancel</Button>
              <Button onClick={handlePassDetailsSave}>Save Pass Details</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Display mode (not editing pass details)
        <div className="space-y-4">
          {/* Pass Request Info */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Special Pass Request:</span> {member.specialPassRequest || 'N/A'}
          </div>

          {/* Pass Status Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-tertiary-gold text-white">
              <div className="grid grid-cols-2 gap-4 p-3 text-sm font-medium text-primary">
                <div>Venue</div>
                <div>Selected Zone</div>
              </div>
            </div>
            
            <div className="bg-white">
              <div className="grid grid-cols-2 gap-4 p-3 text-sm">
                <div className="text-gray-700">
                  RELAY CENTRE - COLOMBO
                </div>
                <div className="text-gray-700">{member.zone || '-'}</div>
              </div>
            </div>
          </div>

          {/* Buttons Container */}
          <div className="flex mt-4 space-x-2"> 
            <Button 
              variant="outline" 
              onClick={() => setIsEditingPassDetails(true)}
            >
              Edit Pass Details
            </Button>
            {member.accommodation && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditingAccommodation(true)}
              >
                Edit Accommodation Details
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}