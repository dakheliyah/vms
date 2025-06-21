'use client';

import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut, AlertTriangle, Home, HomeIcon } from 'lucide-react';
import Image from 'next/image';

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname.split('.').slice(-2).join('.');
    });
    
    // Redirect to colombo-relay site
    window.location.href = 'https://colombo-relay.asharamubaraka.net/';
  };

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row - Logo and Home Link */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-tertiary-gold rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">VMS</span>
                </div>
              </div>
              <h1 className="text-sm font-semibold leading-tight">
                Colombo Relay Centre<br />
                Ashara Mubaraka 1447H
              </h1>
            </div>
            <button onClick={handleLogout} className="text-xs flex items-center text-white px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </button>
          </div>
          
          {/* Bottom Row - User Info */}
          <div className="text-xs opacity-90 text-center">
            {user.its_id} | {user.fullname}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-tertiary-gold rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">VMS</span>
              </div>
            </div>
            <h1 className="text-lg font-semibold">
              Colombo Relay Centre - Ashara Mubaraka 1447H
            </h1>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-6">
            <div className="text-sm opacity-90">
              {user.its_id} | {user.fullname}
            </div>
            <button onClick={handleLogout} className="text-sm flex gap-1 items-center text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}