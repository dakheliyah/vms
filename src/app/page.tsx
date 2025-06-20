'use client';

import { useState } from 'react'; // Removed useEffect
import Header from '@/components/DashboardHeader';
import NavigationTabs from '@/components/NavigationTabs';
import Footer from '@/components/Footer'; // Uncommented
import useCurrentUser from '@/lib/hooks/useCurrentUser'; // Added hook import
import HomeDashboardContent from '@/components/HomeDashboardContent';
import PassDetailsContent from '@/components/PassDetailsContent';
import AccommodationDetailsContent from '@/components/AccommodationDetailsContent';
import ArrivalDetailsContent from '@/components/ArrivalDetailsContent'; // Added new component
import { User } from '@/types'; // Assuming User type is defined in @/types

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard
  const { user: currentUser, isLoading: loading, error, showAccessDenied, countdown, refetch: refetchUser } = useCurrentUser();

  // useEffect(() => {
  //   // If you need to refetch based on some external event, you can call refetchUser() here
  //   // For example, if its_no changes in localStorage and you want to trigger a refetch:
  //   const handleStorageChange = () => {
  //     const itsNo = localStorage.getItem('its_no');
  //     // Add logic to determine if refetch is needed
  //     // refetchUser(); 
  //   };
  //   window.addEventListener('storage', handleStorageChange);
  //   return () => window.removeEventListener('storage', handleStorageChange);
  // }, [refetchUser]);

  const renderContent = () => {
    if (showAccessDenied) {
      return (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="text-red-600 text-xl font-semibold mb-4">
              Access Unavailable
            </div>
            <div className="text-red-700 mb-6">
              Only mumineen with raza to Colombo Relay Center can access this page.
            </div>
            <div className="text-red-600 font-medium">
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </div>
          </div>
        </div>
      );
    }
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your information</p>
          </div>
        </div>
      );
    }
    if (error) {
      return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    }
    // if (!currentUser && (activeTab === 'dashboard' || activeTab === 'pass-details' || activeTab === 'accommodation-details')) {
    //   return <div className="text-center py-10">Please log in to view this content.</div>;
    // }

    switch (activeTab) {
      // case 'dashboard':
      //   return <HomeDashboardContent currentUser={currentUser} />;
      case 'dashboard':
        return <PassDetailsContent currentUser={currentUser} />;
      // case 'accommodation-details':
      //   return <AccommodationDetailsContent currentUser={currentUser} />;
      // case 'arrival-details': // Added case for new tab
      //   return <ArrivalDetailsContent currentUser={currentUser} />;
      default:
        return <HomeDashboardContent currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground">
      {currentUser && <Header user={currentUser} />}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} /> */}
        <div className="mt-8">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
