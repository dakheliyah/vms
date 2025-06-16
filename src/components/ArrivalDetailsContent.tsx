// src/components/ArrivalDetailsContent.tsx
'use client';

import React from 'react';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ArrivalDetailsContentProps {
  currentUser: User | null;
}

export default function ArrivalDetailsContent({ currentUser }: ArrivalDetailsContentProps) {
  if (!currentUser) {
    return <div>Loading user data...</div>; // Or some other placeholder
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Arrival Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Arrival details for {currentUser.fullname} (ITS ID: {currentUser.its_id}) will be displayed here.</p>
        {/* Placeholder for arrival form or information */}
        <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md">
          <p className="text-gray-500 text-center">Arrival details form/content will go here.</p>
        </div>
      </CardContent>
    </Card>
  );
}