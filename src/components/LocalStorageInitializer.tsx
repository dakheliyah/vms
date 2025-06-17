'use client';

import { useEffect } from 'react';

const LocalStorageInitializer = () => {
  useEffect(() => {
    // Set its_no in localStorage on initial load
    localStorage.setItem('its_no', 'Z33mhIvxHDhFetw0qitFocjXONvI%2FMeI8ljrSG821Ak%3D');
  }, []); // Empty dependency array ensures this runs only once on mount

  return null; // This component does not render anything
};

export default LocalStorageInitializer;