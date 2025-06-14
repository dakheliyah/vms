import { FamilyMember, User, RelayCenter } from '@/types';

// Mock user data
export const mockUser: User = {
  id: '30429860',
  name: 'Fatema bai Nooruddin bhai Nagarwala',
  familyId: 'FAM001',
  relayCenter: 'RELAY CENTRE - BANGALORE - BUJHANI MOHALLA',
  location: 'Ashara Mubaraka 1447H'
};

// Mock relay center data
export const mockRelayCenter: RelayCenter = {
  id: 'RC001',
  name: 'RELAY CENTRE - BANGALORE - BUJHANI MOHALLA',
  location: 'Bangalore',
  capacity: 500
};

// Mock family members data
export const mockFamilyMembers: FamilyMember[] = [
  {
    id: '28336149',
    serialNumber: 1,
    fullName: 'Shaikh Husain bhai Mulla Dilawar bhai Nagarwala',
    registrationStatus: 'REGISTERED',
    passStatus: 'ALLOCATED',
    dataStatus: 'VERIFIED',
    venue: 'RELAY CENTRE - BANGALORE - BUJHANI MOHALLA',
    seat: 'A-101',
    gate: 'Gate 1',
    scanStatus: 'SCANNED',
    zone: 'CMZ',
    specialPassRequest: 'Rahat',
    accommodation: {
      type: 'Standard',
      roomNumber: '101',
      building: 'Block A',
      checkIn: '2023-11-15',
      checkOut: '2023-11-20'
    }
  },
  {
    id: '30429862',
    serialNumber: 2,
    fullName: 'Nafisa bai Shaikh Husain bhai Nagarwala',
    registrationStatus: 'REGISTERED',
    passStatus: 'ALLOCATED',
    dataStatus: 'VERIFIED',
    venue: 'RELAY CENTRE - BANGALORE - BUJHANI MOHALLA',
    seat: 'A-102',
    gate: 'Gate 1',
    scanStatus: 'NOT_SCANNED',
    zone: 'MCZ',
    specialPassRequest: 'Non Critical Rahat',
    accommodation: {
      type: 'Deluxe',
      roomNumber: '201',
      building: 'Block B',
      checkIn: '2023-11-15',
      checkOut: '2023-11-20'
    }
  },
  {
    id: '30429861',
    serialNumber: 3,
    fullName: 'Nooruddin bhai Shaikh Husain bhai Nagarwala',
    registrationStatus: 'REGISTERED',
    passStatus: 'ALLOCATED',
    dataStatus: 'VERIFIED',
    venue: 'RELAY CENTRE - BANGALORE - BUJHANI MOHALLA',
    seat: 'A-103',
    gate: 'Gate 1',
    scanStatus: 'NOT_SCANNED',
    accommodation: {
      type: 'Family',
      roomNumber: '301',
      building: 'Block C',
      checkIn: '2023-11-15',
      checkOut: '2023-11-20'
    }
  },
  {
    id: '30429860',
    serialNumber: 4,
    fullName: 'Fatema bai Nooruddin bhai Nagarwala',
    registrationStatus: 'REGISTERED',
    passStatus: 'ALLOCATED',
    dataStatus: 'VERIFIED',
    venue: 'RELAY CENTRE - BANGALORE - BUJHANI MOHALLA',
    seat: 'A-104',
    gate: 'Gate 1',
    scanStatus: 'NOT_SCANNED',
    accommodation: {
      type: 'Family',
      roomNumber: '301',
      building: 'Block C',
      checkIn: '2023-11-15',
      checkOut: '2023-11-20'
    }
  }
];