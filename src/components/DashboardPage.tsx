'use client';

import { useState } from 'react';
import { mockUser, mockFamilyMembers } from '@/data/mockData';
import { FamilyMember } from '@/types';
import DashboardHeader from './DashboardHeader';
import FamilyMembersTable from './FamilyMembersTable';
import PassStatusSection from './PassStatusSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

export default function DashboardPage() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [familyMembers] = useState<FamilyMember[]>(mockFamilyMembers);

  const handleMemberSelection = (memberId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedMembers(prev => [...prev, memberId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedMembers(familyMembers.map(member => member.id));
    } else {
      setSelectedMembers([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream/20 to-white">
      {/* Header */}
      <DashboardHeader user={mockUser} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Pass Status
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-tertiary-gold hover:bg-tertiary-gold-dark text-white border-tertiary-gold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add / Edit
            </Button>
            <Button 
              className="bg-primary-green hover:bg-primary-green-dark"
            >
              Pass Status
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="border-primary-green/20">
          <CardHeader className="bg-primary-green/5">
            <CardTitle className="text-primary-green">
              {mockUser.name} - {mockUser.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <PassStatusSection />
          </CardContent>
        </Card>

        {/* Family Members Section */}
        <Card className="border-primary-green/20">
          <CardHeader className="bg-primary-green/5">
            <CardTitle className="text-primary-green flex items-center gap-2">
              <Users className="h-5 w-5" />
              List of group member(s)
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              To get the <span className="font-semibold text-red-600">Allocation Status</span>, Click on radio button next to your name.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <FamilyMembersTable 
              members={familyMembers}
              selectedMembers={selectedMembers}
              onMemberSelection={handleMemberSelection}
              onSelectAll={handleSelectAll}
            />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-tertiary-gold text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          Developed & Designed by Istarahat Ta'reef al Shaikh
        </div>
      </footer>
    </div>
  );
}