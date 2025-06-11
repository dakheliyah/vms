'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PassStatusSection() {
  return (
    <div className="space-y-4">
      {/* Pass Request Info */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">Pass Request:</span> No special request
      </div>

      {/* Pass Status Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-tertiary-gold text-white">
          <div className="grid grid-cols-4 gap-4 p-3 text-sm font-medium">
            <div>Venue</div>
            <div>Seat</div>
            <div>Gate</div>
            <div className="flex justify-between">
              <span>Scan Status</span>
              <span>Cancel Pass</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white">
          <div className="grid grid-cols-4 gap-4 p-3 text-sm">
            <div className="text-gray-700">
              RELAY CENTRE - BANGALORE - BUJHANI MOHALLA
            </div>
            <div className="text-gray-500">-</div>
            <div className="text-gray-500">-</div>
            <div className="flex justify-between items-center">
              <div className="text-gray-500">-</div>
              <Button 
                size="sm" 
                variant="outline"
                className="text-tertiary-gold border-tertiary-gold hover:bg-tertiary-gold hover:text-white"
              >
                Cancel this Pass
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}