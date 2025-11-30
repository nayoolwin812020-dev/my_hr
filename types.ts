
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  department: string;
  hourlyRate: number;
  dailyRate: number;
  walletBalance: number;
  points: number;
  
  // Financial Config
  lateDeductionAmount: number;
  overtimeRatePerHour: number;
  monthlyBonus: number;
  
  // Extended Profile Fields
  companyName?: string;
  joinDate?: string;
  jobTitle?: string;
  paymentType?: string;
  address?: string;
  monthlyRate?: number;
}

export interface PayslipItem {
  label: string;
  amount: number;
  type: 'earning' | 'deduction';
}

export interface Payslip {
  id: string;
  month: string;
  year: number;
  periodStart: string;
  periodEnd: string;
  generatedDate: string;
  basicSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  status: 'PAID' | 'PENDING';
  items: PayslipItem[];
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  date: string;
  amount: number;
  tags?: string[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY';
  photoUrl?: string; // Captured during check-in
  location?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'SICK' | 'VACATION' | 'PERSONAL' | 'MATERNITY';
  startDate: string;
  endDate: string;
  days?: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PayrollSummary {
  period: string;
  totalHours: number;
  overtimeHours: number;
  grossPay: number;
  deductions: number;
  netPay: number;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assigneeIds: string[]; // Changed: Supports multiple assignees
  comments?: Comment[]; // Added comments
}

export interface Project {
  id: string;
  title: string;
  description: string;
  department: string;
  assignedTo: string; // Project Lead
  authorId: string; // Added: Who created the project
  team: string[]; // Added: List of user IDs in the team
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  progress: number;
  deadline: string; // Added: Project Deadline
  tags: string[]; // Added: Project Tags
  tasks: Task[];
}

export type ViewState = 'DASHBOARD' | 'SCAN' | 'HISTORY' | 'WALLET' | 'LEAVE' | 'PROJECTS' | 'MY_TASKS' | 'SETTINGS';