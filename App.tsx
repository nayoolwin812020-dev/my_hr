import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Wallet from './components/Wallet';
import Leave from './components/Leave';
import Projects from './components/Projects';
import MyTasks from './components/MyTasks';
import Settings from './components/Settings';
import Scanner from './components/Scanner';
import Login from './components/Login';
import { ViewState, AttendanceRecord, UserRole, LeaveRequest, User, Transaction, Payslip } from './types';
import { CURRENT_USER, MOCK_HISTORY, MOCK_LEAVES, MOCK_EMPLOYEES, MOCK_PAYSLIPS } from './constants';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });

  const [activeTab, setActiveTab] = useState<ViewState>('DASHBOARD');
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<'IN' | 'OUT'>('IN');
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null);
  
  // App Data State with Persistence
  const [history, setHistory] = useState<AttendanceRecord[]>(() => {
    try {
      const savedHistory = localStorage.getItem('attendance_history');
      return savedHistory ? JSON.parse(savedHistory) : MOCK_HISTORY;
    } catch (e) {
      return MOCK_HISTORY;
    }
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
      try {
          const savedLeaves = localStorage.getItem('leaves_data');
          return savedLeaves ? JSON.parse(savedLeaves) : MOCK_LEAVES;
      } catch(e) {
          return MOCK_LEAVES;
      }
  });

  const [checkedIn, setCheckedIn] = useState(() => {
    return localStorage.getItem('checked_in') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState<User>(() => {
      try {
          const savedUser = localStorage.getItem('current_user');
          return savedUser ? JSON.parse(savedUser) : CURRENT_USER;
      } catch (e) {
          return CURRENT_USER;
      }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
      try {
          const savedTx = localStorage.getItem('transactions_data');
          return savedTx ? JSON.parse(savedTx) : [];
      } catch (e) {
          return [];
      }
  });

  // --- NEW: Organization State ---
  const [employees, setEmployees] = useState<User[]>(() => {
      try {
          const savedEmps = localStorage.getItem('org_employees');
          // Start with Mock + Ensure Current User is in the list
          const base = MOCK_EMPLOYEES;
          // Ensure current user is in the list for demos
          const all = base.find(e => e.id === CURRENT_USER.id) ? base : [CURRENT_USER, ...base];
          return savedEmps ? JSON.parse(savedEmps) : all;
      } catch (e) {
          return MOCK_EMPLOYEES;
      }
  });

  const [payslips, setPayslips] = useState<Payslip[]>(() => {
      try {
          const savedSlips = localStorage.getItem('org_payslips');
          return savedSlips ? JSON.parse(savedSlips) : MOCK_PAYSLIPS;
      } catch (e) {
          return MOCK_PAYSLIPS;
      }
  });

  // Sync Auth to LocalStorage
  useEffect(() => {
    localStorage.setItem('is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  // Sync Data to LocalStorage
  useEffect(() => localStorage.setItem('leaves_data', JSON.stringify(leaves)), [leaves]);
  useEffect(() => localStorage.setItem('current_user', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('transactions_data', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('org_employees', JSON.stringify(employees)), [employees]);
  useEffect(() => localStorage.setItem('org_payslips', JSON.stringify(payslips)), [payslips]);

  const handleScanRequest = (mode: 'IN' | 'OUT') => {
    setScanMode(mode);
    setShowScanner(true);
  };

  const handleScanComplete = (photoUrl: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toISOString().split('T')[0];

    let newHistory = [...history];

    if (scanMode === 'IN') {
      const newRecord: AttendanceRecord = {
        id: Math.random().toString(),
        userId: currentUser.id,
        date: dateString,
        checkInTime: timeString,
        status: 'PRESENT', // Default
        location: 'Office HQ',
        photoUrl: photoUrl
      };
      
      // Simple Late Check (Example: Late after 9:00 AM)
      const hour = now.getHours();
      const minutes = now.getMinutes();
      if (hour > 9 || (hour === 9 && minutes > 0)) {
          newRecord.status = 'LATE';
      }

      newHistory = [newRecord, ...history];
      setCheckedIn(true);
      localStorage.setItem('checked_in', 'true');
    } else {
      // Find today's record to update
      const updatedHistory = history.map((record, index) => {
        // Assuming the most recent record is the one to close if date matches
        if (record.date === dateString && !record.checkOutTime) {
          return { ...record, checkOutTime: timeString };
        }
        return record;
      });
      newHistory = updatedHistory;
      setCheckedIn(false);
      localStorage.setItem('checked_in', 'false');

      // --- WALLET EARNING LOGIC ---
      // Credit Daily Rate upon successful Check Out
      const earnAmount = currentUser.dailyRate;
      
      // Update Balance
      setCurrentUser(prev => ({
          ...prev,
          walletBalance: prev.walletBalance + earnAmount
      }));

      // Create Transaction
      const newTx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'credit',
          title: 'Daily Attendance Earning',
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: earnAmount
      };

      setTransactions(prev => [newTx, ...prev]);
    }
    
    setHistory(newHistory);
    localStorage.setItem('attendance_history', JSON.stringify(newHistory));
    setShowScanner(false);
  };

  const handleAddLeave = (leave: LeaveRequest) => {
      setLeaves([leave, ...leaves]);
  };

  const handleRoleToggle = () => {
    setCurrentUser(prev => ({
      ...prev,
      role: prev.role === UserRole.ADMIN ? UserRole.EMPLOYEE : UserRole.ADMIN
    }));
  };

  const handleUpdateUser = (updatedUser: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updatedUser }));
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleNavigateToProject = (projectId: string) => {
    setTargetProjectId(projectId);
    setActiveTab('PROJECTS');
  };

  // --- Admin Functions ---
  const handleAddEmployee = (newEmployee: User) => {
      setEmployees(prev => [...prev, newEmployee]);
  };

  const handlePaySalary = (employeeId: string, amount: number, month: string) => {
      const year = new Date().getFullYear();
      const payslip: Payslip = {
          id: `PS-${employeeId}-${Date.now()}`,
          month: month,
          year: year,
          periodStart: `${year}-01-01`, // Simplified
          periodEnd: `${year}-01-31`, // Simplified
          generatedDate: new Date().toLocaleDateString(),
          basicSalary: amount,
          totalEarnings: amount,
          totalDeductions: 0,
          netSalary: amount,
          status: 'PAID',
          items: [{ label: 'Basic Salary', amount: amount, type: 'earning' }]
      };
      
      // Update Payslips List
      setPayslips(prev => [payslip, ...prev]);

      // Note: In a real multi-user app, this would credit that specific user's wallet.
      // Since we simulate single-user context mostly, if admin pays "Self", we update current user balance.
      if (employeeId === currentUser.id) {
          // It doesn't auto-credit wallet, user must "Withdraw" via Payslip Receipt, 
          // but we generate the payslip so they CAN withdraw.
      }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'DASHBOARD' && (
          <Dashboard 
            user={currentUser} 
            checkedIn={checkedIn} 
            onScanClick={handleScanRequest}
            history={history}
            leaves={leaves}
            // Admin Props
            employees={employees}
            onAddEmployee={handleAddEmployee}
            payslips={payslips}
            onPaySalary={handlePaySalary}
          />
        )}
        {activeTab === 'HISTORY' && <History records={history} leaves={leaves} />}
        {activeTab === 'PROJECTS' && (
          <Projects 
            initialProjectId={targetProjectId} 
            onProjectOpened={() => setTargetProjectId(null)} 
          />
        )}
        {activeTab === 'MY_TASKS' && (
          <MyTasks onNavigateToProject={handleNavigateToProject} />
        )}
        {activeTab === 'LEAVE' && (
            <Leave 
                userRole={currentUser.role} 
                history={history} 
                leaves={leaves}
                onAddLeave={handleAddLeave}
            />
        )}
        {activeTab === 'SETTINGS' && (
          <Settings 
            user={currentUser}
            history={history} 
            transactions={transactions}
            onRoleToggle={handleRoleToggle}
            onUpdateUser={handleUpdateUser}
            onAddTransaction={handleAddTransaction}
            onLogout={handleLogout}
          />
        )}
      </Layout>

      {/* Overlay Scanner */}
      {showScanner && (
        <Scanner 
          mode={scanMode}
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};

export default App;