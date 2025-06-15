'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Building2, Home } from 'lucide-react';

export default function NavigationTabs() {
  const pathname = usePathname();

  const tabs = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      description: 'Manage family member information'
    },
    { 
      name: 'Pass Details', 
      href: '/pass-details', 
      icon: CreditCard,
      description: 'View and manage pass information'
    },
    { 
      name: 'Accommodation Details', 
      href: '/accommodation-details', 
      icon: Building2,
      description: 'Accommodation booking details'
    },
  ];

  return (
    <div className="mb-8">
      {/* Enhanced navigation with background and shadow */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1">
        <nav className="flex space-x-1" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            
            return (
              <Link
                key={tab.name}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
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
                  ${
                    isActive 
                      ? 'opacity-0' 
                      : 'opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary-green/5 to-primary-green/10'
                  }
                `} />
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Optional: Add a subtle description for the active tab */}
      <div className="mt-3 px-1">
        {tabs.map((tab) => {
          if (pathname === tab.href) {
            return (
              <p key={tab.href} className="text-sm text-gray-500 animate-fade-in">
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