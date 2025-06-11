// Types for the VMS Pass Allocation System

export interface FamilyMember {
  id: string;
  serialNumber: number;
  fullName: string;
  registrationStatus: 'REGISTERED' | 'PENDING' | 'REJECTED';
  passStatus: 'ALLOCATED' | 'PENDING' | 'CANCELLED';
  dataStatus: 'VERIFIED' | 'PENDING' | 'INCOMPLETE';
  venue?: string;
  seat?: string;
  gate?: string;
  scanStatus?: 'SCANNED' | 'NOT_SCANNED';
}

export interface PassRequest {
  id: string;
  memberId: string;
  venue: string;
  requestDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  specialRequest?: string;
}

export interface User {
  id: string;
  name: string;
  familyId: string;
  relayCenter: string;
  location: string;
}

export interface RelayCenter {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

// Status badge variants
export type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface StatusConfig {
  label: string;
  variant: StatusVariant;
  className?: string;
}