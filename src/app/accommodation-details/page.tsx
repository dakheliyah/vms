// src/app/accommodation-details/page.tsx
'use client';

import DashboardHeader from '@/components/DashboardHeader';
import NavigationTabs from '@/components/NavigationTabs';
import { User } from '@/types';
import { useEffect, useState } from 'react';

export default function AccommodationDetailsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Basic user fetching logic, similar to DashboardPage
    // This might be refactored into a custom hook later
    const its_no = localStorage.getItem('its_no');
    if (its_no) {
      fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen?its_id=${its_no}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setCurrentUser(data.data);
          }
        });
    }
  }, []);

  if (!currentUser) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream/20 to-white">
      <DashboardHeader user={currentUser} />
      <NavigationTabs /> {/* Add the NavigationTabs component */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold text-primary-green">Accommodation Details</h1>
        <p>This page will display accommodation details for the family members.</p>
        {/* Placeholder content for accommodation details */}
      </main>
      <footer className="bg-primary text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-white">
          Developed & Designed by <b>Umoor Dakheliyah Colombo</b>
        </div>
      </footer>
    </div>
  );
}