'use client';

import { useEffect } from 'react';

const LocalStorageInitializer = () => {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (response.ok && data.its_no) {
          localStorage.setItem('its_no', data.its_no);
          // Dispatch custom event to notify that localStorage is ready
          window.dispatchEvent(new CustomEvent('localStorageReady', { detail: { its_no: data.its_no } }));
        } else {
          window.location.href = 'https://colombo-relay.asharamubaraka.net/';
        }
      } catch (error) {
        console.error('Failed to check session:', error);
        window.location.href = 'https://colombo-relay.asharamubaraka.net/';
      }
    };

    checkSession();
  }, []); // Empty dependency array ensures this runs only once on mount

  return null; // This component does not render anything
};

export default LocalStorageInitializer;