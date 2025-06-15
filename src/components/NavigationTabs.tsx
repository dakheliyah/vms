'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // To get current path

export default function NavigationTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Family Details', href: '/' },
    { name: 'Pass Details', href: '/pass-details' },
    { name: 'Accommodation Details', href: '/accommodation-details' },
  ];

  return (
    <div className="mb-6 flex space-x-4 border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          href={tab.href}
          className={`pb-2 px-1 border-b-2 font-semibold ${
            pathname === tab.href
              ? 'border-primary-green text-primary-green'
              : 'border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab.name}
        </Link>
      ))}
    </div>
  );
}