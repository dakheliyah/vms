'use client';

import { FamilyMember } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusConfig } from '@/lib/statusConfig';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface FamilyMembersTableProps {
  members: FamilyMember[];
  selectedMembers: string[];
  onMemberSelection: (memberId: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
}

export default function FamilyMembersTable({ 
  members, 
  selectedMembers, 
  onMemberSelection, 
  onSelectAll 
}: FamilyMembersTableProps) {
  const allSelected = members.length > 0 && selectedMembers.length === members.length;
  const someSelected = selectedMembers.length > 0 && selectedMembers.length < members.length;

  const handleSelectAll = () => {
    onSelectAll(!allSelected);
  };

  const handleMemberSelect = (memberId: string) => {
    const isSelected = selectedMembers.includes(memberId);
    onMemberSelection(memberId, !isSelected);
  };

  const getStatusIcon = (status: string, type: 'registration' | 'pass' | 'data') => {
    const config = getStatusConfig(status, type);
    
    if (status === 'VERIFIED' || status === 'ALLOCATED' || status === 'REGISTERED') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (status === 'PENDING') {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-tertiary-gold text-white">
        <div className="grid grid-cols-12 gap-2 p-3 text-sm font-medium">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={handleSelectAll}
              className="rounded border-white/20 text-tertiary-gold focus:ring-tertiary-gold"
            />
          </div>
          <div className="col-span-1">S.</div>
          <div className="col-span-2">Full Name</div>
          <div className="col-span-2">Registration Status</div>
          <div className="col-span-2">Pass Status</div>
          <div className="col-span-2">Data Status</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="bg-white">
        {members.map((member, index) => {
          const isSelected = selectedMembers.includes(member.id);
          const registrationConfig = getStatusConfig(member.registrationStatus, 'registration');
          const passConfig = getStatusConfig(member.passStatus, 'pass');
          const dataConfig = getStatusConfig(member.dataStatus, 'data');
          
          return (
            <div 
              key={member.id} 
              className={`grid grid-cols-12 gap-2 p-3 text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-primary-green/5 border-primary-green/20' : ''
              }`}
            >
              {/* Selection Radio */}
              <div className="col-span-1 flex items-center">
                <input
                  type="radio"
                  name="selectedMember"
                  checked={isSelected}
                  onChange={() => handleMemberSelect(member.id)}
                  className="text-primary-green focus:ring-primary-green"
                />
              </div>
              
              {/* Serial Number */}
              <div className="col-span-1 font-medium text-gray-700">
                {member.serialNumber}.
              </div>
              
              {/* Full Name */}
              <div className="col-span-2 font-medium text-gray-900">
                <div>{member.fullName}</div>
                <div className="text-xs text-gray-500 mt-1">{member.id}</div>
              </div>
              
              {/* Registration Status */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(member.registrationStatus, 'registration')}
                  <Badge 
                    variant="outline" 
                    className={registrationConfig.className}
                  >
                    {registrationConfig.label}
                  </Badge>
                </div>
              </div>
              
              {/* Pass Status */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(member.passStatus, 'pass')}
                  <Badge 
                    variant="outline" 
                    className={passConfig.className}
                  >
                    {passConfig.label}
                  </Badge>
                </div>
              </div>
              
              {/* Data Status */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(member.dataStatus, 'data')}
                  <Badge 
                    variant="outline" 
                    className={dataConfig.className}
                  >
                    {dataConfig.label}
                  </Badge>
                </div>
              </div>
              
              {/* Actions */}
              <div className="col-span-2">
                {member.passStatus === 'ALLOCATED' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    Cancel Pass
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Allocation Status Info */}
      {selectedMembers.length > 0 && (
        <div className="bg-primary-green/5 border-t border-primary-green/20 p-3">
          <div className="text-sm text-primary-green font-medium">
            ✓ Allocate yourself - Selected {selectedMembers.length} member(s)
          </div>
        </div>
      )}
    </div>
  );
}