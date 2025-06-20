// src/app/accommodation-details/page.tsx
'use client';

import DashboardHeader from '@/components/DashboardHeader';
import NavigationTabs from '@/components/NavigationTabs';
import { User, FamilyMember, Hotel } from '@/types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, User as UserIcon, Home, HotelIcon } from 'lucide-react';

type UpdateMode = 'individual' | 'bulk' | null;
type AccommodationType = 'hotel' | 'relative' | null;

interface AccommodationData {
  type: AccommodationType;
  hotelId?: number;
  hotelName?: string;
  hotelAddress?: string;
  relativeAddress?: string;
}

export default function AccommodationDetailsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [updateMode, setUpdateMode] = useState<UpdateMode>(null);
  const [accommodationType, setAccommodationType] = useState<AccommodationType>(null);
  const [accommodationData, setAccommodationData] = useState<AccommodationData>({ type: null });
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [memberAccommodations, setMemberAccommodations] = useState<Record<number, AccommodationData>>({});
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const its_no = localStorage.getItem('its_no');
      if (!its_no) {
        console.error('ITS number not found in localStorage');
        return;
      }

      try {
        // Fetch current user data
        const userResponse = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen?its_id=${its_no}`);
        const userData = await userResponse.json();
        if (userData.success && userData.data) {
          setCurrentUser(userData.data);

          // Fetch family members using the same API as pass-details page
          const familyResponse = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/family-by-its-id?its_id=${its_no}`);
          const familyData = await familyResponse.json();
          if (familyData.success && familyData.data) {
            const transformedFamilyMembers: FamilyMember[] = familyData.data.map((apiMember: any) => ({
              its_id: apiMember.its_id,
              fullname: apiMember.fullname,
              gender: apiMember.gender,
              country: apiMember.country,
              venue_waaz: apiMember.venue_waaz,
              acc_zone: apiMember.acc_zone
            }));
            setFamilyMembers(transformedFamilyMembers);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchHotels = async () => {
    setLoadingHotels(true);
    try {
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

  // Call in useEffect
  useEffect(() => {
    fetchHotels();
  }, []);

  const handleAccommodationSubmit = async () => {
    try {
      const dataToSubmit = updateMode === 'bulk' ? accommodationData : memberAccommodations;
      console.log('Submitting accommodation data:', dataToSubmit);
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/accommodation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dataToSubmit)
      // });
      alert('Accommodation details updated successfully!');
    } catch (error) {
      console.error('Error updating accommodation:', error);
      alert('Error updating accommodation details.');
    }
  };

  const resetForm = () => {
    setUpdateMode(null);
    setAccommodationType(null);
    setAccommodationData({ type: null });
    setSelectedMember(null);
    setMemberAccommodations({});
  };

  const updateIndividualAccommodation = (memberId: number, data: AccommodationData) => {
    setMemberAccommodations(prev => ({ ...prev, [memberId]: data }));
  };

  if (!currentUser) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-secondary-cream/20 to-white">
      <DashboardHeader user={currentUser} />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* <NavigationTabs /> */}
        <h1 className="text-2xl font-semibold text-primary-green">Accommodation Details</h1>

        {/* Step 1: Choose Update Mode */}
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
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setUpdateMode('individual')}
                >
                  <UserIcon className="h-8 w-8" />
                  <span>Update Individual Members</span>
                  <span className="text-xs text-muted-foreground">Set accommodation for each family member separately</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setUpdateMode('bulk')}
                >
                  <Users className="h-8 w-8" />
                  <span>Bulk Update All Members</span>
                  <span className="text-xs text-muted-foreground">Set same accommodation for all family members</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Individual Member Accommodation Setup */}
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
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{member.fullname}</div>
                          <div className="text-sm text-muted-foreground">ITS: {member.its_id}</div>
                        </div>
                      </div>

                      {/* Accommodation Type Selection for this member */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          variant={memberData.type === 'hotel' ? 'default' : 'outline'}
                          className="h-16 flex flex-col gap-1"
                          onClick={() => updateIndividualAccommodation(member.its_id, { type: 'hotel' })}
                        >
                          <HotelIcon className="h-5 w-5" />
                          <span className="text-sm">Hotel</span>
                        </Button>
                        <Button
                          variant={memberData.type === 'relative' ? 'default' : 'outline'}
                          className="h-16 flex flex-col gap-1"
                          onClick={() => updateIndividualAccommodation(member.its_id, { type: 'relative' })}
                        >
                          <Home className="h-5 w-5" />
                          <span className="text-sm">Relative/Friend</span>
                        </Button>
                      </div>

                      {/* Accommodation Details Form for this member */}
                      {memberData.type && (
                        <div className="space-y-3 bg-gray-50 p-3 rounded">
                          {memberData.type === 'hotel' ? (
                            <div className='flex gap-4 w-full'>
                              <div>
                                <label className="block text-sm font-medium mb-1">Hotel</label>
                                <Select
                                  value={memberData.hotelId?.toString() || ''}
                                  onValueChange={(value) => {
                                    const selectedHotel = hotels.find(h => h.id === parseInt(value));
                                    updateIndividualAccommodation(member.its_id, {
                                      ...memberData,
                                      hotelId: parseInt(value),
                                      hotelName: selectedHotel?.name || '',
                                      hotelAddress: selectedHotel?.address || '',
                                      type: 'hotel'
                                    });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a hotel" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {loadingHotels ? (
                                      <SelectItem value="loading" disabled>Loading hotels...</SelectItem>
                                    ) : (
                                      hotels.map((hotel) => (
                                        <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                          {hotel.name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className='w-full'>
                                <label className="block text-sm font-medium mb-1">Hotel Address</label>
                                <Input
                                  className='w-full'
                                  placeholder="Enter hotel address"
                                  value={memberData.hotelAddress || ''}
                                  onChange={(e) => updateIndividualAccommodation(member.its_id, {
                                    ...memberData,
                                    hotelAddress: e.target.value,
                                    type: 'hotel'
                                  })}
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium mb-1">Address</label>
                              <Input
                                placeholder="Enter relative/friend's address"
                                value={memberData.relativeAddress || ''}
                                onChange={(e) => updateIndividualAccommodation(member.its_id, {
                                  ...memberData,
                                  relativeAddress: e.target.value,
                                  type: 'relative'
                                })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAccommodationSubmit}
                    disabled={Object.keys(memberAccommodations).length === 0}
                  >
                    Update All Individual Accommodations
                  </Button>
                  <Button variant="ghost" onClick={resetForm}>
                    ← Back to Update Method
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Bulk Accommodation Type Selection */}
        {updateMode === 'bulk' && !accommodationType && (
          <Card>
            <CardHeader>
              <CardTitle>Accommodation for All Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setAccommodationType('hotel')}
                >
                  <HotelIcon className="h-8 w-8" />
                  <span>Staying at Hotel</span>
                  <span className="text-xs text-muted-foreground">Hotel accommodation details</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setAccommodationType('relative')}
                >
                  <Home className="h-8 w-8" />
                  <span>Staying at Relative/Friend's House</span>
                  <span className="text-xs text-muted-foreground">Private accommodation details</span>
                </Button>
              </div>
              <div className="mt-4">
                <Button variant="ghost" onClick={resetForm}>
                  ← Back to Update Method
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Bulk Accommodation Details Form */}
        {updateMode === 'bulk' && accommodationType && (
          <Card>
            <CardHeader>
              <CardTitle>
                {accommodationType === 'hotel' ? 'Hotel Details for All Members' : 'Relative/Friend Address for All Members'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accommodationType === 'hotel' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hotel</label>
                      <Select
                        value={accommodationData.hotelId?.toString() || ''}
                        onValueChange={(value) => {
                          const selectedHotel = hotels.find(h => h.id === parseInt(value));
                          setAccommodationData(prev => ({
                            ...prev,
                            hotelId: parseInt(value),
                            hotelName: selectedHotel?.name || '',
                            hotelAddress: selectedHotel?.address || '',
                            type: 'hotel'
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a hotel" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingHotels ? (
                            <SelectItem value="loading" disabled>Loading hotels...</SelectItem>
                          ) : (
                            hotels.map((hotel) => (
                              <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                {hotel.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hotel Address</label>
                      <Input
                        placeholder="Enter hotel address"
                        value={accommodationData.hotelAddress || ''}
                        onChange={(e) => setAccommodationData(prev => ({ ...prev, hotelAddress: e.target.value, type: 'hotel' }))}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Input
                      placeholder="Enter relative/friend's address"
                      value={accommodationData.relativeAddress || ''}
                      onChange={(e) => setAccommodationData(prev => ({ ...prev, relativeAddress: e.target.value, type: 'relative' }))}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAccommodationSubmit}>
                    Update All Members
                  </Button>
                  <Button variant="outline" onClick={() => setAccommodationType(null)}>
                    ← Back to Accommodation Type
                  </Button>
                  <Button variant="ghost" onClick={resetForm}>
                    Start Over
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary of Current Selections */}
        {updateMode && (
          <Card>
            <CardHeader>
              <CardTitle>Current Selection Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Update Mode:</strong> {updateMode === 'bulk' ? 'Bulk Update (All Members)' : 'Individual Update'}</div>
                {updateMode === 'individual' && Object.keys(memberAccommodations).length > 0 && (
                  <div>
                    <strong>Individual Accommodations Set:</strong>
                    <ul className="mt-1 ml-4">
                      {Object.entries(memberAccommodations).map(([memberId, data]) => {
                        const member = familyMembers.find(m => m.its_id === parseInt(memberId));
                        return (
                          <li key={memberId} className="text-xs">
                            {member?.fullname}: {data.type === 'hotel' ? 'Hotel' : 'Relative/Friend\'s House'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {updateMode === 'bulk' && accommodationType && (
                  <div><strong>Bulk Accommodation Type:</strong> {accommodationType === 'hotel' ? 'Hotel' : 'Relative/Friend\'s House'}</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="bg-primary text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-white">
          Developed & Designed by <b>Umoor Dakheliyah Colombo</b>
        </div>
      </footer>
    </div>
  );
}