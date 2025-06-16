'use client';

import { CreditCard, Building2, Home, Plane } from 'lucide-react'; // Added Plane icon
import type { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs: Tab[] = [
    {
      id: 'home',
      name: 'Home',
      icon: Home,
      description: 'Manage family member information'
    },
    {
      id: 'pass-details',
      name: 'Pass Details',
      icon: CreditCard,
      description: 'View and manage pass information'
    },
    {
      id: 'accommodation-details',
      name: 'Accommodation Details',
      icon: Building2,
      description: 'Accommodation booking details'
    },
    {
      id: 'arrival-details',
      name: 'Arrival Details',
      icon: Plane, // Using Plane icon
      description: 'Manage arrival information'
    },
  ];

  return (
    <div className="mb-8">
      {/* Enhanced navigation with background and shadow */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1">
        <nav className="flex space-x-1" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                type="button"
                className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm
                  transition-all duration-200 ease-in-out min-w-0 flex-1
                  ${
                    isActive
                      ? 'bg-primary-green text-white shadow-md transform scale-[1.02]'
                      : 'text-gray-600 hover:text-primary-green hover:bg-gray-50 hover:shadow-sm'
                  }
                `}
                title={tab.description}
              >
                {/* Icon with enhanced styling */}
                <Icon 
                  className={`
                    w-5 h-5 flex-shrink-0 transition-all duration-200
                    ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-400 group-hover:text-primary-green'
                    }
                  `} 
                />
                
                {/* Tab name with responsive text */}
                <span className="truncate font-semibold">
                  {tab.name}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 rounded-md ring-2 ring-primary-green/20 ring-offset-2" />
                )}
                
                {/* Hover effect background */}
                <div className={`
                  absolute inset-0 rounded-md transition-opacity duration-200
                  ${isActive 
                      ? 'opacity-0' 
                      : 'opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary-green/5 to-primary-green/10'
                  }
                `} />
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Optional: Add a subtle description for the active tab */}
      <div className="mt-3 px-1">
        {tabs.map((tab) => {
          if (activeTab === tab.id) {
            return (
              <p key={tab.id} className="text-sm text-gray-500 animate-fade-in">
                {tab.description}
              </p>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}