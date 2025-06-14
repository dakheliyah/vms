// Types for the VMS Pass Allocation System

export interface Accommodation {
  type: string;
  roomNumber: string;
  building: string;
  checkIn: string;
  checkOut: string;
}

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
  zone?: 'CMZ' | 'MCZ';
  specialPassRequest?: 'Rahat' | 'Non Critical Rahat' | 'Mum with Kids';
  accommodation?: Accommodation;
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
  zone?: 'CMZ' | 'MCZ'; // Added zone
  specialPassRequest?: 'Rahat' | 'Non Critical Rahat' | 'Mum with Kids'; // Added specialPassRequest
  accommodation?: {
    type: string;
    roomNumber: string;
    building: string;
    checkIn: string;
    checkOut: string;
  };
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