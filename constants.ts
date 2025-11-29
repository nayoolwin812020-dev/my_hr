
import { User, UserRole, AttendanceRecord, LeaveRequest, Project } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  role: UserRole.EMPLOYEE,
  // Using a stable real person image for face verification testing
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  department: 'Engineering',
  hourlyRate: 45,
  dailyRate: 360, // 8 hours * 45
  walletBalance: 2450.50,
  points: 1250
};

export const MOCK_EMPLOYEES = [
  { id: 'u1', name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', department: 'Engineering' },
  { id: 'u2', name: 'Sarah Smith', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', department: 'Marketing' },
  { id: 'u3', name: 'Mike Brown', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', department: 'Design' },
  { id: 'u4', name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', department: 'Sales' }
];

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
    startDate: '2023-10-15',
    endDate: '2023-10-16',
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

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Q4 Marketing Campaign',
    description: 'Launch the new product line social media assets.',
    department: 'Marketing',
    assignedTo: 'u2', // Sarah (Lead)
    authorId: 'u1', // Created by Alex
    team: ['u2', 'u3', 'u1'], // Sarah, Mike, Alex
    status: 'ACTIVE',
    progress: 65,
    tasks: [
      { 
        id: 't1', 
        title: 'Design Banner Ads', 
        description: 'Create 3 variations of banner ads for FB and IG. Use the new brand colors.', 
        status: 'DONE', 
        dueDate: '2023-10-20', 
        priority: 'HIGH',
        assigneeId: 'u3', // Assigned to Mike
        comments: [
          { id: 'c1', userId: 'u2', text: 'Drafts attached in the drive folder.', createdAt: '2023-10-18 10:30 AM' },
          { id: 'c2', userId: 'u3', text: 'Looks good! Approved.', createdAt: '2023-10-19 09:15 AM' }
        ]
      },
      { id: 't2', title: 'Video Script Writing', description: 'Draft the script for the 30s promo video focusing on new features.', status: 'IN_PROGRESS', dueDate: '2023-10-28', priority: 'MEDIUM', assigneeId: 'u2', comments: [] },
      { id: 't3', title: 'Approval Meeting', description: 'Meeting with the product head to finalize assets before launch.', status: 'TODO', dueDate: '2023-10-30', priority: 'HIGH', assigneeId: 'u2', comments: [] }
    ]
  },
  {
    id: 'p2',
    title: 'Website Redesign',
    description: 'Update the homepage and contact forms.',
    department: 'Engineering',
    assignedTo: 'u1', // Alex (Lead)
    authorId: 'u1', // Created by Alex
    team: ['u1', 'u3'], // Alex, Mike
    status: 'ON_HOLD',
    progress: 30,
    tasks: [
      { id: 't4', title: 'Wireframing', description: 'Create low-fidelity wireframes for the new landing page.', status: 'DONE', dueDate: '2023-10-10', priority: 'MEDIUM', assigneeId: 'u3', comments: [] },
      { id: 't5', title: 'Frontend Implementation', description: 'Implement the design using React and Tailwind.', status: 'TODO', dueDate: '2023-11-15', priority: 'HIGH', assigneeId: 'u1', comments: [] }
    ]
  }
];
