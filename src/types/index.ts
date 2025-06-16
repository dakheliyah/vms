// Types for the VMS Pass Allocation System

export interface Accommodation {
  type: string;
  roomNumber: string;
  building: string;
  checkIn: string;
  checkOut: string;
}

export interface Hotel {
  id: number;
  name: string;
  address: string;
}

export interface FamilyMember {
  its_id: number;
  fullname: string;
  country?: string | null;
  venue_waaz?: string | null;
  acc_zone?: string | null;
  gender?: string;
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
  its_id: string;
  fullname: string;
  familyId: string;
  relayCenter: string;
  location: string;
  country?: string;
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

export interface ApiBlock {
  id: number;
  type: string;
  capacity: number;
  gender: 'male' | 'female' | 'both';
  min_age: number;
  max_age: number;
  vaaz_center_name: string;
  issued_passes: number;
  availability: number;
}

export interface PassPreference {
  id: number;
  name: string;
  blocks: ApiBlock[];
}