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
  pass_preferences: PassPreference[];
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
  email?: string; // Added optional email
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
  block_availability: number;
}

// Generic API Response Wrapper (example)
export interface ApiResponseData<T> {
  data: T;
  message?: string;
  status?: number; // HTTP status or custom status code
}

// Placeholder for a more detailed User Profile from API
export interface UserProfileApiResponse extends User { // Extends existing User, can be more specific
  // Add API specific fields here, e.g.:
  // last_login_at?: string;
  // roles?: string[];
}

// Placeholder for Family Member API response (if different from FamilyMember type)
export interface FamilyMemberApiResponse extends FamilyMember {
  // API specific fields
}

export interface PassPreference {
  id: number;
  event_id: number;
  block_id: number;
  its_id: number;
  vaaz_center_id: number;
  vaaz_center_name: string;
  pass_type: string;
  is_locked: boolean;
  name: string; // This seems to be the venue name, same as vaaz_center_name based on API
  vaaz_center_capacity: number; // This is likely total_capacity
  vaaz_center_issued_passes: number; // This is likely total_issued_passes
  vaaz_center_availability: number; // This is likely total_availability
  male_capacity?: number; // Added
  male_issued_passes?: number; // Added
  male_availability?: number; // Added
  female_capacity?: number; // Added
  female_issued_passes?: number; // Added
  female_availability?: number; // Added
  blocks: ApiBlock[];
}

// Example of a more specific type for an API endpoint if needed
// export interface SpecificEndpointResponse {
//   items: SomeType[];
//   pagination: {
//     total: number;
//     per_page: number;
//     current_page: number;
//   };
// }