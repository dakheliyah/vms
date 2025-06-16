'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/DashboardHeader';
import NavigationTabs from '@/components/NavigationTabs';
// import Footer from '@/components/Footer';
// import UserInfoCard from '@/components/UserInfoCard';
import HomeDashboardContent from '@/components/HomeDashboardContent';
import PassDetailsContent from '@/components/PassDetailsContent';
import AccommodationDetailsContent from '@/components/AccommodationDetailsContent';
import ArrivalDetailsContent from '@/components/ArrivalDetailsContent'; // Added new component
import { User } from '@/types'; // Assuming User type is defined in @/types

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      const itsNo = localStorage.getItem('its_no');
      if (!itsNo) {
        console.error('ITS number not found in localStorage.');
        // Potentially redirect to login or show an error message
        // For now, we'll assume UserInfoCard handles its own fetching or displays a default state
        // Or, we might want to prevent content rendering if user is essential for all tabs
        setCurrentUser(null); // Explicitly set to null if no ITS_NO
        setLoading(false);
        return;
      }

      try {
        // UserInfoCard fetches its own data, but we might need currentUser for other components
        // For now, let's simulate fetching the user if needed by HomeDashboardContent directly
        // This logic might be redundant if UserInfoCard already provides the user via a context or prop
        const userResponse = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen?its_id=${itsNo}`);
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        if (userData.success && userData.data) {
          setCurrentUser(userData.data);
        } else {
          throw new Error(userData.message || 'User data not found.');
        }
      } catch (err: any) {
        console.error('Error fetching initial data:', err);
        setError(err.message || 'Failed to load user data.');
        setCurrentUser(null);
      }
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-10">Loading...</div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    }
    // if (!currentUser && (activeTab === 'dashboard' || activeTab === 'pass-details' || activeTab === 'accommodation-details')) {
    //   return <div className="text-center py-10">Please log in to view this content.</div>;
    // }

    switch (activeTab) {
      case 'dashboard':
        return <HomeDashboardContent currentUser={currentUser} />;
      case 'pass-details':
        return <PassDetailsContent currentUser={currentUser} />;
      case 'accommodation-details':
        return <AccommodationDetailsContent currentUser={currentUser} />;
      case 'arrival-details': // Added case for new tab
        return <ArrivalDetailsContent currentUser={currentUser} />;
      default:
        return <HomeDashboardContent currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {currentUser && <Header user={currentUser} />}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* <UserInfoCard /> */} 
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-8">
          {renderContent()}
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
