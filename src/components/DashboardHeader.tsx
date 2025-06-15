'use client';

import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut, AlertTriangle, Home } from 'lucide-react';
import Image from 'next/image';

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
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
              {user.its_id} | {user.full_name}
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-primary-green-dark">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}