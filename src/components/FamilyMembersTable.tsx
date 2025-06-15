'use client';

import { FamilyMember } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusConfig } from '@/lib/statusConfig';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react'; // Added for state and effect

interface FamilyMembersTableProps {
  members: FamilyMember[];
  selectedMembers: string[];
  onMemberSelection: (memberId: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  selectionMode: 'radio' | 'checkbox';
  onUpdateMemberDetails?: (memberId: string, details: Partial<Pick<FamilyMember, 'zone' | 'specialPassRequest'>>) => void;
  onSaveChanges?: (memberId: string, zone: string | undefined, specialPassRequest: string | undefined) => Promise<void>; // Added for saving changes
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define types for API response
interface ApiBlock {
  id: number;
  type: string;
  capacity: number;
  issued_passes: number;
  availability: number;
}

interface ApiZone {
  id: number;
  name: string;
  blocks: ApiBlock[];
}

export default function FamilyMembersTable({ 
  members, 
  selectedMembers, 
  onMemberSelection, 
  onSelectAll,
  selectionMode,
  onUpdateMemberDetails,
  onSaveChanges // Added for saving changes
}: FamilyMembersTableProps) {
  const [apiData, setApiData] = useState<ApiZone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStates, setUpdatingStates] = useState<Record<string, boolean>>({}); // To track loading state for each row's update button

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/summary?event_id=1');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setApiData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
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
      {/* Table Header */} 
      <div className="bg-tertiary-gold text-white">
        <div className="grid grid-cols-12 gap-2 p-3 text-sm font-medium text-primary">
          <div className="col-span-1">ITS No</div>
          <div className="col-span-4">Full Name</div>
          <div className="col-span-2">Waaz Center</div>
          <div className="col-span-2">Special Pass</div>
          <div className="col-span-2 text-center">Actions</div> {/* New Actions column */}
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
              
              {/* Serial Number */}
              <div className="col-span-1 font-medium text-gray-700">
                {member.id}
              </div>
              
              {/* Full Name */}
              <div className="col-span-4 font-medium text-gray-900"> {/* Increased span */}
                <div>{member.fullname}</div>
              </div>

              {/* Zone and Special Pass Request - Editable if onUpdateMemberDetails is provided */}
              {onUpdateMemberDetails ? (
                <>
                  <div className="col-span-2">
                    <Select
                      value={member.zone || ''}
                      onValueChange={(value) => {
                        // When zone changes, reset specialPassRequest as block types are dependent
                        onUpdateMemberDetails(member.id, { zone: value as "CMZ" | "MCZ", specialPassRequest: undefined });
                      }}
                      disabled={loading || !!error}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={loading ? "Loading Waaz Centers..." : (error ? "Error loading" : "Select Waaz Center")} />
                      </SelectTrigger>
                      <SelectContent>
                        {error && <SelectItem value="error" disabled>{error}</SelectItem>}
                        {!loading && !error && apiData.map((zone) => (
                          <SelectItem key={zone.id} value={zone.name}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={(() => {
                        if (!member.zone || !member.specialPassRequest) return '';
                        const selectedZoneData = apiData.find(z => z.name === member.zone);
                        const currentBlock = selectedZoneData?.blocks.find(b => b.type === member.specialPassRequest);
                        return currentBlock ? currentBlock.id.toString() : '';
                      })()}
                      onValueChange={(selectedBlockId: string) => {
                        if (onUpdateMemberDetails) {
                          const selectedZoneData = apiData.find(z => z.name === member.zone);
                          const selectedBlock = selectedZoneData?.blocks.find(b => b.id.toString() === selectedBlockId);
                          if (selectedBlock) {
                            onUpdateMemberDetails(member.id, { specialPassRequest: selectedBlock.type as "Rahat" | "Non Critical Rahat" | "Mum with Kids" });
                          }
                        }
                      }}
                      disabled={loading || !!error || !member.zone}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={!member.zone ? "Select Zone First" : (loading ? "Loading..." : "Select Pass Type")} />
                      </SelectTrigger>
                      <SelectContent>
                        {member.zone && apiData.find(z => z.name === member.zone)?.blocks.map(block => (
                          <SelectItem key={block.id} value={block.id.toString()}>
                            {block.type} (Avail: {block.availability})
                          </SelectItem>
                        ))}
                        {!member.zone && <SelectItem value="no-zone" disabled>Please select a waaz center first</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Update Button Column */}
                  <div className="col-span-2 flex items-center justify-center">
                    {onSaveChanges && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          setUpdatingStates(prev => ({ ...prev, [member.id]: true }));
                          try {
                            await onSaveChanges(member.id, member.zone, member.specialPassRequest);
                            // Optionally, provide feedback to the user upon successful save
                          } catch (err) {
                            // Optionally, handle/display error to the user
                            console.error("Failed to save changes:", err);
                          }
                          setUpdatingStates(prev => ({ ...prev, [member.id]: false }));
                        }}
                        disabled={updatingStates[member.id] || !member.zone || !member.specialPassRequest}
                        className="text-xs h-8"
                      >
                        {updatingStates[member.id] ? 'Updating...' : 'Update'}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2">
                    {member.zone || '-'}
                  </div>
                  <div className="col-span-2">
                    {member.specialPassRequest || '-'}
                  </div>
                  {/* Placeholder for actions column in non-editable mode */}
                  <div className="col-span-2"> 
                    {/* If there's a non-editable action, it would go here */}
                  </div>
                  <div className="col-span-2"> {/* This div seems redundant or misplaced from original code, keeping structure for now */}
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