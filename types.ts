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

export type ViewState = 'DASHBOARD' | 'SCAN' | 'HISTORY' | 'PAYROLL' | 'LEAVE' | 'SETTINGS';