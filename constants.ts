import { User, UserRole, AttendanceRecord, LeaveRequest } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  role: UserRole.EMPLOYEE,
  // Using a stable real person image for face verification testing
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  department: 'Engineering',
  hourlyRate: 45
};

export const MOCK_HISTORY: AttendanceRecord[] = [
  {
    id: 'r1',
    userId: 'u1',
    date: '2023-10-25',
    checkInTime: '08:55 AM',
    checkOutTime: '05:05 PM',
    status: 'PRESENT',
    location: 'Office HQ'
  },
  {
    id: 'r2',
    userId: 'u1',
    date: '2023-10-24',
    checkInTime: '09:10 AM',
    checkOutTime: '05:15 PM',
    status: 'LATE',
    location: 'Office HQ'
  },
  {
    id: 'r3',
    userId: 'u1',
    date: '2023-10-23',
    checkInTime: '08:45 AM',
    checkOutTime: '04:55 PM',
    status: 'PRESENT',
    location: 'Remote'
  },
  {
    id: 'r4',
    userId: 'u1',
    date: '2023-10-20',
    checkInTime: '09:00 AM',
    checkOutTime: '05:00 PM',
    status: 'PRESENT',
    location: 'Office HQ'
  }
];

export const MOCK_LEAVES: LeaveRequest[] = [
  {
    id: 'l1',
    userId: 'u1',
    type: 'SICK',
    startDate: '2023-09-15',
    endDate: '2023-09-16',
    days: 2,
    reason: 'Flu',
    status: 'APPROVED'
  }
];

export const MOCK_TEAM_LEAVES: LeaveRequest[] = [
  {
    id: 'tl1',
    userId: 'u2',
    type: 'VACATION',
    startDate: '2023-11-01',
    endDate: '2023-11-05',
    days: 5,
    reason: 'Family trip to Hawaii',
    status: 'PENDING'
  },
  {
    id: 'tl2',
    userId: 'u3',
    type: 'SICK',
    startDate: '2023-10-28',
    endDate: '2023-10-29',
    days: 2,
    reason: 'High fever',
    status: 'PENDING'
  },
  {
    id: 'tl3',
    userId: 'u4',
    type: 'PERSONAL',
    startDate: '2023-11-10',
    endDate: '2023-11-10',
    days: 1,
    reason: 'Car service appointment',
    status: 'PENDING'
  }
];

export const PAYROLL_DATA = [
  { name: 'Week 1', hours: 40, pay: 1800 },
  { name: 'Week 2', hours: 38, pay: 1710 },
  { name: 'Week 3', hours: 42, pay: 1935 }, // Overtime
  { name: 'Week 4', hours: 40, pay: 1800 },
];
