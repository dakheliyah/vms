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
    <header className="bg-primary-green text-white shadow-lg">
      {/* Top Bar */}
      <div className="bg-primary-green-dark">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {/* Logo placeholder */}
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-tertiary-gold rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">VMS</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="text-white hover:bg-primary-green">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-primary-green">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Warning
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-primary-green">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              Colombo Relay Centre - Ashara Mubaraka 1447H
            </h1>
          </div>
          
          <div className="text-right">
            <div className="text-sm opacity-90">
              {user.id} | {user.name}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}