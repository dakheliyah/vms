// src/components/AccommodationDetailsContent.tsx
'use client';

import { User, FamilyMember, Hotel } from '@/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, User as UserIcon, Home as HomeIconLucide, HotelIcon } from 'lucide-react'; // Renamed Home to HomeIconLucide to avoid conflict

type UpdateMode = 'individual' | 'bulk' | null;
type AccommodationType = 'hotel' | 'relative' | null;

interface FamilyMemberFromApi {
  id: number; // Assuming API returns 'id' as a numeric primary key for the family member record itself
  its_id: string; // The ITS ID
  fullname: string; // Full name
  // Add other relevant fields like current accommodation, gender, etc.
  gender?: string;
  current_acc_zone?: string;
  current_acc_hotel_id?: number;
}

// Removed local Hotel interface, using imported one from @/types

interface AccommodationDetailsContentProps {
  currentUser: User | null;
}

export default function AccommodationDetailsContent({ currentUser }: AccommodationDetailsContentProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberFromApi[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [updateMode, setUpdateMode] = useState<UpdateMode>(null);
  const [accommodationType, setAccommodationType] = useState<AccommodationType>(null);
  const [accommodationData, setAccommodationData] = useState<Partial<AccommodationData>>({ type: null });
  const [memberAccommodations, setMemberAccommodations] = useState<{[key: string]: Partial<AccommodationData>}>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.its_id) {
        // console.error('Current user or ITS ID not available for accommodation details.');
        setFamilyMembers([]);
        setHotels([]);
        return;
      }

      const its_no = localStorage.getItem('its_no');
      if (!its_no) {
        console.error('ITS number not found in localStorage');
        return;
      }

      // Fetch family members
      try {
        const familyResponse = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/family-by-its-id?its_id=${its_no}`);
        const familyData = await familyResponse.json();
        if (familyData.success && familyData.data) {
          setFamilyMembers(familyData.data.map((member: any) => ({
            id: member.id, // Ensure your API provides this, or use its_id if it's the unique key for selections
            its_id: member.its_id,
            fullname: member.fullname,
            gender: member.gender,
            current_acc_zone: member.acc_zone, // Assuming API provides this
            current_acc_hotel_id: member.hotel_id // Assuming API provides this
          })));
        } else {
          console.error('Failed to fetch family members:', familyData.message);
          setFamilyMembers([]);
        }
      } catch (error) {
        console.error('Error fetching family members:', error);
        setFamilyMembers([]);
      }

      // Fetch hotels
      try {
        const hotelsResponse = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/hotels');
        const hotelsData = await hotelsResponse.json();
        if (hotelsData.success && hotelsData.data) {
          setHotels(hotelsData.data);
        } else {
          console.error('Failed to fetch hotels:', hotelsData.message);
          setHotels([]);
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setHotels([]);
      }
    };

    fetchData();
  }, [currentUser]);

  const fetchHotels = async () => {
    setLoadingHotels(true);
    try {
      // Assuming API route is set up correctly
      const response = await fetch('/api/hotel'); 
      const data = await response.json();
      if (data.success) {
        setHotels(data.data);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoadingHotels(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleAccommodationSubmit = async () => {
    try {
      const dataToSubmit = updateMode === 'bulk' ? { allMembers: accommodationData, members: familyMembers.map(m => m.its_id) } : { individualMembers: memberAccommodations };
      console.log('Submitting accommodation data:', dataToSubmit);
      // TODO: Replace with actual API endpoint and logic for bulk/individual
      // const response = await fetch('/api/accommodation-update', { // Example endpoint
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dataToSubmit)
      // });
      alert('Accommodation details updated successfully! (Mocked)');
    } catch (error) {
      console.error('Error updating accommodation:', error);
      alert('Error updating accommodation details.');
    }
  };

  const resetForm = () => {
    setUpdateMode(null);
    setAccommodationType(null);
    setAccommodationData({ type: null });
    setMemberAccommodations({});
  };

  const updateIndividualAccommodation = (memberItsId: string, data: Partial<AccommodationData>) => {
    setMemberAccommodations(prev => ({
      ...prev,
      [memberItsId]: { ...(prev[memberItsId] || { type: null }), ...data }
    }));
  };

  interface AccommodationData {
    type: AccommodationType;
    hotelId?: number;
    hotelName?: string;
    hotelAddress?: string; // Assuming Hotel interface might have an address
    relativeAddress?: string;
  }
  
  const handleBulkHotelChange = (hotelIdString: string) => {
    const hotelId = parseInt(hotelIdString, 10);
    const selectedHotel = hotels.find(h => h.id === hotelId);
    setAccommodationData(prev => ({
      ...prev,
      type: 'hotel',
      hotelId,
      hotelName: selectedHotel?.name,
      hotelAddress: selectedHotel?.address, // Ensure 'address' is a valid property of the Hotel type from @/types
      relativeAddress: undefined
    }));
  };

  const handleBulkRelativeAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccommodationData(prev => ({
      ...prev,
      type: 'relative',
      relativeAddress: e.target.value,
      hotelId: undefined,
      hotelName: undefined,
      hotelAddress: undefined
    }));
  };

  if (!currentUser) {
    return <div>Loading user information or user not available...</div>;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-primary-green mb-6">Accommodation Details</h1>

      {!updateMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Choose Update Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setUpdateMode('individual')}>
                <UserIcon className="h-8 w-8" />
                <span>Update Individual Members</span>
                <span className="text-xs text-muted-foreground">Set accommodation for each family member separately</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setUpdateMode('bulk')}>
                <Users className="h-8 w-8" />
                <span>Bulk Update All Members</span>
                <span className="text-xs text-muted-foreground">Set same accommodation for all family members</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {updateMode === 'individual' && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Member Accommodation Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {familyMembers.map((member) => {
                const memberData = memberAccommodations[member.its_id] || { type: null };
                return (
                  <div key={member.its_id} className="border rounded-lg p-4 space-y-4">
                    <div className="font-medium">{member.fullname} (ITS: {member.its_id})</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        variant={memberData.type === 'hotel' ? 'default' : 'outline'}
                        onClick={() => updateIndividualAccommodation(member.its_id.toString(), { type: 'hotel' })}
                      >
                        <HotelIcon className="mr-2 h-4 w-4" /> Hotel
                      </Button>
                      <Button
                        variant={memberData.type === 'relative' ? 'default' : 'outline'}
                        onClick={() => updateIndividualAccommodation(member.its_id.toString(), { type: 'relative' })}
                      >
                        <HomeIconLucide className="mr-2 h-4 w-4" /> Relative's Place
                      </Button>
                    </div>
                    {memberData.type === 'hotel' && (
                      <Select
                        onValueChange={(hotelIdString) => {
                          const hotelId = parseInt(hotelIdString, 10);
                          const selectedHotel = hotels.find(h => h.id === hotelId);
                          updateIndividualAccommodation(member.its_id.toString(), { hotelId: hotelId, hotelName: selectedHotel?.name, hotelAddress: selectedHotel?.address, relativeAddress: undefined });
                        }}
                        value={memberData.hotelId?.toString() || ''}
                      >
                        <SelectTrigger><SelectValue placeholder="Select Hotel" /></SelectTrigger>
                        <SelectContent>
                          {loadingHotels ? <SelectItem value="loading" disabled>Loading hotels...</SelectItem> :
                            hotels.map(hotel => <SelectItem key={hotel.id} value={hotel.id.toString()}>{hotel.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    {memberData.type === 'relative' && (
                      <Input
                        placeholder="Enter Relative's Address"
                        value={memberData.relativeAddress || ''}
                        onChange={(e) => updateIndividualAccommodation(member.its_id.toString(), { relativeAddress: e.target.value, hotelId: undefined, hotelName: undefined, hotelAddress: undefined })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {updateMode === 'bulk' && (
        <Card>
          <CardHeader><CardTitle>Bulk Update All Members</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant={accommodationType === 'hotel' ? 'default' : 'outline'} onClick={() => setAccommodationType('hotel') }>
                <HotelIcon className="mr-2 h-4 w-4" /> Hotel
              </Button>
              <Button variant={accommodationType === 'relative' ? 'default' : 'outline'} onClick={() => setAccommodationType('relative') }>
                <HomeIconLucide className="mr-2 h-4 w-4" /> Relative's Place
              </Button>
            </div>
            {accommodationType === 'hotel' && (
              <Select onValueChange={handleBulkHotelChange} value={accommodationData.hotelId?.toString() || ''}>
                <SelectTrigger><SelectValue placeholder="Select Hotel" /></SelectTrigger>
                <SelectContent>
                  {loadingHotels ? <SelectItem value="loading" disabled>Loading hotels...</SelectItem> :
                    hotels.map(hotel => <SelectItem key={hotel.id} value={hotel.id.toString()}>{hotel.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {accommodationType === 'relative' && (
              <Input placeholder="Enter Relative's Address" value={accommodationData.relativeAddress || ''} onChange={handleBulkRelativeAddressChange} />
            )}
          </CardContent>
        </Card>
      )}

      {updateMode && (
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={resetForm}>Cancel</Button>
          <Button onClick={handleAccommodationSubmit}>Save Accommodation Details</Button>
        </div>
      )}
    </>
  );
}