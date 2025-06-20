'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/DashboardHeader';
import { User } from '@/types';
import useCurrentUser from '@/lib/hooks/useCurrentUser';
import { apiClient, ApiResponse } from '@/lib/api/apiClient';
import Footer from '@/components/Footer';

// Pass preference breakdown data types
interface PassPreference {
  id: number;
  event_id: number;
  block_id: number;
  its_id: number;
  vaaz_center_id: number;
  vaaz_center_name: string;
  pass_type: string;
}

interface PassBreakdownData {
  its_id: number;
  hof_id: number;
  fullname: string;
  gender: string;
  jamaat: string;
  pass_preferences?: PassPreference[];
}





export default function ReportsPage() {

  
  // Pass breakdown data state
  const [passBreakdownData, setPassBreakdownData] = useState<PassBreakdownData[]>([]);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState<boolean>(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);



  // Fetch current user data
  const { user, isLoading: userLoading, error: userError, showAccessDenied, countdown } = useCurrentUser();

  // Fetch pass preference breakdown data
  const fetchPassBreakdown = useCallback(async () => {
    if (!user?.its_id) return;
    
    setIsLoadingBreakdown(true);
    setBreakdownError(null);
    
    try {
      const response = await apiClient<PassBreakdownData[]>('/mumineen/pass-preference/breakdown?event_id=1');
      
      if (response.error) {
        setBreakdownError(response.error);
        setPassBreakdownData([]);
      } else if (response.data) {
        setPassBreakdownData(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setBreakdownError('No data received');
        setPassBreakdownData([]);
      }
    } catch (error) {
      console.error('Error fetching pass breakdown data:', error);
      setBreakdownError('Error fetching pass breakdown data');
      setPassBreakdownData([]);
    } finally {
      setIsLoadingBreakdown(false);
    }
  }, [user?.its_id]);



  // Fetch data when user is available
  useEffect(() => {
    if (user?.its_id) {
      fetchPassBreakdown();
    }
  }, [user?.its_id, fetchPassBreakdown]);







  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if user data failed to load
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading user data: {userError || 'User not found'}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Management Reports</h1>
            <p className="text-gray-600 mt-1">Track and analyze pass preferences for events</p>
          </div>
        </div>







        {/* Pass Preference Breakdown Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pass Preference Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBreakdown && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading pass preferences...</span>
              </div>
            )}
            
            {breakdownError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 font-medium">Error loading pass preferences</div>
                <div className="text-red-600 text-sm mt-1">{breakdownError}</div>
                <Button 
                  onClick={fetchPassBreakdown} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            )}
            
            {!isLoadingBreakdown && !breakdownError && passBreakdownData.length > 0 && (
              <div className="space-y-6">
                {passBreakdownData.map((person) => (
                  <div key={person.its_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{person.fullname}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                          <span>ITS ID: {person.its_id}</span>
                          <span>HOF ID: {person.hof_id}</span>
                          <span>Gender: {person.gender}</span>
                          <span>Jamaat: {person.jamaat}</span>
                        </div>
                      </div>
                    </div>
                    
                    {person.pass_preferences && person.pass_preferences.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Pass Preferences ({person.pass_preferences?.length || 0})</h4>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {(person.pass_preferences || []).map((preference) => (
                            <div key={preference.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="font-medium text-gray-900">{preference.vaaz_center_name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                <div>Pass Type: {preference.pass_type}</div>
                                <div>Block ID: {preference.block_id}</div>
                                <div>Center ID: {preference.vaaz_center_id}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">No pass preferences found</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {!isLoadingBreakdown && !breakdownError && passBreakdownData.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg">No pass preference data available</div>
                <div className="text-gray-400 text-sm mt-1">Data will appear here once loaded from the API</div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}