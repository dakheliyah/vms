'use client';

import { useEffect } from 'react';

// Helper function to parse cookies
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

const LocalStorageInitializer = () => {
  useEffect(() => {
    const itsNoFromCookie = getCookie('its_no');
    if (itsNoFromCookie) {
      localStorage.setItem('its_no', itsNoFromCookie);
    } else {
      window.location.href = 'https://colombo-relay.asharamubaraka.net/';
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return null; // This component does not render anything
};

export default LocalStorageInitializer;