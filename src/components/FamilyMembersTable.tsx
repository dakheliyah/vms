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
  selectionMode: 'radio' | 'checkbox';
  bulkEditMode?: boolean; // Added for bulk edit mode
  onUpdateMemberDetails: (memberId: string, details: Partial<Pick<FamilyMember, 'zone' | 'specialPassRequest'>>) => void; // Added for updating details
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added for Select component

export default function FamilyMembersTable({ 
  members, 
  selectedMembers, 
  onMemberSelection, 
  onSelectAll, 
  selectionMode, 
  bulkEditMode,
  onUpdateMemberDetails
}: FamilyMembersTableProps) {
  const isRadioAndSelected = selectionMode === 'radio' && selectedMembers.length > 0;
  const allSelected = members.length > 0 && selectedMembers.length === members.length;
  const someSelected = selectedMembers.length > 0 && selectedMembers.length < members.length;

  const handleSelectAll = () => {
    onSelectAll(!allSelected);
  };

  const handleMemberSelect = (memberId: string) => {
    // Toggle selection - if already selected, deselect; otherwise select
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
      {/* Clear Selection Button for Radio Mode */} 
      {isRadioAndSelected && (
        <div className="p-2 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMemberSelection(selectedMembers[0], false)} 
          >
            Clear Selection
          </Button>
        </div>
      )}
      {/* Table Header */} 
      {/* TODO: Adjust column spans if necessary for new columns */} 
      <div className="bg-tertiary-gold text-white">
        <div className="grid grid-cols-12 gap-2 p-3 text-sm font-medium text-primary">
          <div className="col-span-1 flex items-center"></div> {/* Checkbox/Radio */} 
          <div className="col-span-1">ITS No</div>
          <div className="col-span-3">Full Name</div> {/* Increased span */}
          <div className="col-span-2">Registration Status</div>
          <div className="col-span-2">Pass Status</div>
          <div className="col-span-1">Zone</div> {/* Adjusted span */}
          <div className="col-span-2">Special Pass</div> {/* Adjusted span */}
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
                type={selectionMode}
                name={selectionMode === 'radio' ? 'selectedMember' : `member-${member.id}`}
                checked={isSelected}
                onChange={() => handleMemberSelect(member.id)}
                className={`h-5 w-5 border-2 ${selectionMode === 'radio' ? 'rounded-full' : ''} border-gray-300 text-primary-green focus:ring-2 focus:ring-primary-green focus:ring-offset-2`}
              />
              </div>
              
              {/* Serial Number */}
              <div className="col-span-1 font-medium text-gray-700">
                {member.id}
              </div>
              
              {/* Full Name */}
              <div className="col-span-3 font-medium text-gray-900"> {/* Increased span */}
                <div>{member.fullName}</div>
              </div>
              
              {/* Registration Status */}
              <div className="col-span-2"> {/* Adjusted span */}
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
              <div className="col-span-2"> {/* Adjusted span */}
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

              {/* Zone and Special Pass Request - Display and Edit (if bulkEditMode) */}
              {bulkEditMode ? (
                <>
                  <div className="col-span-1"> {/* Adjusted span */}
                    <Select 
                      value={member.zone || ''} 
                      onValueChange={(value) => onUpdateMemberDetails(member.id, { zone: value as 'CMZ' | 'MCZ' })}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CMZ">CMZ</SelectItem>
                        <SelectItem value="MCZ">MCZ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2"> {/* Adjusted span */}
                    <Select 
                      value={member.specialPassRequest || ''} 
                      onValueChange={(value) => onUpdateMemberDetails(member.id, { specialPassRequest: value as 'Rahat' | 'Non Critical Rahat' | 'Mum with Kids' })}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Special Pass" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rahat">Rahat</SelectItem>
                        <SelectItem value="Non Critical Rahat">Non Critical Rahat</SelectItem>
                        <SelectItem value="Mum with Kids">Mum with Kids</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-1"> {/* Adjusted span */}
                    {member.zone || '-'}
                  </div>
                  <div className="col-span-2"> {/* Adjusted span */}
                    {member.specialPassRequest || '-'}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}