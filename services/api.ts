import { User, UserRole, AttendanceRecord, Project, Task, LeaveRequest, Transaction, Payslip } from '../types';

const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }
  return data;
};

// --- Mappers (Backend snake_case to Frontend camelCase) ---

const mapUser = (u: any): User => ({
  id: u.id?.toString() || '',
  name: u.name,
  role: u.role as UserRole,
  avatar: u.avatar_url || 'https://via.placeholder.com/150',
  department: u.department || '',
  hourlyRate: parseFloat(u.hourly_rate || 0),
  dailyRate: parseFloat(u.daily_rate || 0),
  monthlyRate: parseFloat(u.monthly_rate || 0),
  walletBalance: parseFloat(u.wallet_balance || 0),
  points: 0,
  lateDeductionAmount: 5000, // Config defaults
  overtimeRatePerHour: 5000,
  monthlyBonus: 0,
  companyName: 'TechNova Myanmar',
  joinDate: u.join_date,
  jobTitle: u.role === 'ADMIN' ? 'Administrator' : 'Employee',
  paymentType: 'Bank Transfer'
});

const mapAttendance = (a: any): AttendanceRecord => ({
  id: a.id.toString(),
  userId: a.user_id.toString(),
  date: new Date(a.date).toISOString().split('T')[0],
  checkInTime: a.check_in_time,
  checkOutTime: a.check_out_time,
  status: a.status,
  photoUrl: a.photo_url,
  location: a.location
});

const mapProject = (p: any): Project => ({
  id: p.id.toString(),
  title: p.title,
  description: p.description,
  department: p.department,
  assignedTo: p.assigned_to?.toString(),
  authorId: p.author_id?.toString(),
  team: p.team || [],
  status: p.status,
  progress: p.progress,
  deadline: new Date(p.deadline).toISOString().split('T')[0],
  tags: p.tags || [],
  tasks: (p.tasks || []).map(mapTask)
});

const mapTask = (t: any): Task => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  status: t.status,
  dueDate: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '',
  priority: t.priority,
  assigneeIds: t.assigneeIds || [],
  comments: (t.comments || []).map((c: any) => ({
    id: c.id.toString(),
    userId: c.userId.toString(),
    text: c.text,
    createdAt: new Date(c.createdAt).toLocaleString()
  }))
});

const mapLeave = (l: any): LeaveRequest => ({
  id: l.id.toString(),
  userId: l.user_id.toString(),
  type: l.type,
  startDate: new Date(l.start_date).toISOString().split('T')[0],
  endDate: new Date(l.end_date).toISOString().split('T')[0],
  days: l.days,
  reason: l.reason,
  status: l.status
});

const mapTransaction = (t: any): Transaction => ({
  id: t.id.toString(),
  type: t.type,
  title: t.title,
  amount: parseFloat(t.amount),
  date: t.date || new Date(t.created_at).toLocaleDateString(),
  tags: t.tags || []
});

const mapPayslip = (p: any): Payslip => ({
  id: p.id.toString(),
  month: p.month,
  year: p.year,
  periodStart: new Date(p.period_start).toISOString().split('T')[0],
  periodEnd: new Date(p.period_end).toISOString().split('T')[0],
  generatedDate: new Date(p.generated_date).toISOString().split('T')[0],
  basicSalary: parseFloat(p.basic_salary),
  totalEarnings: parseFloat(p.total_earnings),
  totalDeductions: parseFloat(p.total_deductions),
  netSalary: parseFloat(p.net_salary),
  status: p.status,
  items: p.items || []
});

// --- API Methods ---

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await handleResponse(res);
      // Return user with mapped fields
      return { token: data.token, user: mapUser(data.user) };
    },
    register: async (userData: any) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    }
  },
  employees: {
    getProfile: async (id: string) => {
      const res = await fetch(`${API_URL}/employees/${id}`, { headers: getHeaders() });
      const data = await handleResponse(res);
      return mapUser(data);
    },
    getAll: async () => {
      const res = await fetch(`${API_URL}/employees`, { headers: getHeaders() });
      const data = await handleResponse(res);
      return data.map(mapUser);
    },
    updateProfile: async (id: string, data: any) => {
      const res = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
            name: data.name,
            department: data.department,
            avatar_url: data.avatar
        })
      });
      return handleResponse(res);
    }
  },
  attendance: {
    checkIn: async (userId: string, photoUrl: string, location: string) => {
      const res = await fetch(`${API_URL}/attendance/check-in`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ user_id: userId, photo_url: photoUrl, location })
      });
      return handleResponse(res);
    },
    checkOut: async (userId: string) => {
      const res = await fetch(`${API_URL}/attendance/check-out`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ user_id: userId })
      });
      return handleResponse(res);
    },
    getHistory: async (userId: string) => {
      const res = await fetch(`${API_URL}/attendance/history/${userId}`, { headers: getHeaders() });
      const data = await handleResponse(res);
      return data.map(mapAttendance);
    }
  },
  leaves: {
    getAll: async (userId: string, role: string) => {
      const res = await fetch(`${API_URL}/leaves?user_id=${userId}&role=${role}`, { headers: getHeaders() });
      const data = await handleResponse(res);
      return data.map(mapLeave);
    },
    request: async (leave: Partial<LeaveRequest>) => {
      const res = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(leave)
      });
      return handleResponse(res);
    }
  },
  projects: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
      const data = await handleResponse(res);
      return data.map(mapProject);
    },
    create: async (project: any) => {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(project)
      });
      return handleResponse(res);
    },
    createTask: async (task: any) => {
       const res = await fetch(`${API_URL}/projects/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task)
      });
      return handleResponse(res); 
    }
  },
  finance: {
    getWallet: async (userId: string) => {
      const res = await fetch(`${API_URL}/finance/wallet/${userId}`, { headers: getHeaders() });
      const data = await handleResponse(res);
      return {
        balance: parseFloat(data.balance),
        transactions: data.transactions.map(mapTransaction)
      };
    },
    addTransaction: async (tx: any) => {
      const res = await fetch(`${API_URL}/finance/transaction`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tx)
      });
      return handleResponse(res);
    },
    getPayslips: async (userId: string) => {
        const res = await fetch(`${API_URL}/finance/payslips/${userId}`, { headers: getHeaders() });
        const data = await handleResponse(res);
        return data.map(mapPayslip);
    },
    getAllPayslips: async () => {
        const res = await fetch(`${API_URL}/finance/all-payslips`, { headers: getHeaders() });
        const data = await handleResponse(res);
        return data.map(mapPayslip);
    },
    generatePayslip: async (data: any) => {
        const res = await fetch(`${API_URL}/finance/payslips/generate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    }
  }
};