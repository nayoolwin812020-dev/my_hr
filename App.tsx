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
import { CURRENT_USER } from './constants';
import { api } from './services/api';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });

  const [activeTab, setActiveTab] = useState<ViewState>('DASHBOARD');
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<'IN' | 'OUT'>('IN');
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null);
  
  // App Data State (Fetched from API)
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  // Sync Auth to LocalStorage
  useEffect(() => {
    localStorage.setItem('is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  // Fetch Initial Data on Login
  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          // 1. Get User Profile if we have an ID
          const userId = currentUser.id;
          if (userId && userId !== 'EMP-001') {
             const userProfile = await api.employees.getProfile(userId);
             setCurrentUser(userProfile);
          }

          // 2. Fetch Attendance History
          const hist = await api.attendance.getHistory(currentUser.id);
          setHistory(hist);

          // 3. Check today's status
          const today = new Date().toISOString().split('T')[0];
          const todayRecord = hist.find(r => r.date === today);
          if (todayRecord && !todayRecord.checkOutTime) {
            setCheckedIn(true);
          } else {
            setCheckedIn(false);
          }

          // 4. Fetch Leaves
          const myLeaves = await api.leaves.getAll(currentUser.id, currentUser.role);
          setLeaves(myLeaves);

          // 5. Fetch Wallet
          const walletData = await api.finance.getWallet(currentUser.id);
          setTransactions(walletData.transactions);
          setCurrentUser(prev => ({ ...prev, walletBalance: walletData.balance }));

          // 6. Admin Data (Employees & All Payslips)
          if (currentUser.role === UserRole.ADMIN) {
            const allEmps = await api.employees.getAll();
            setEmployees(allEmps);

            const allPayslips = await api.finance.getAllPayslips();
            setPayslips(allPayslips);
          } else {
             // Fetch only my payslips
             const myPayslips = await api.finance.getPayslips(currentUser.id);
             setPayslips(myPayslips);
          }

        } catch (error) {
          console.error("Failed to load initial data", error);
        }
      };
      
      loadData();
    }
  }, [isAuthenticated, currentUser.id, currentUser.role]);

  const handleScanRequest = (mode: 'IN' | 'OUT') => {
    setScanMode(mode);
    setShowScanner(true);
  };

  const handleScanComplete = async (photoUrl: string) => {
    try {
      if (scanMode === 'IN') {
        await api.attendance.checkIn(currentUser.id, photoUrl, 'Office HQ');
        setCheckedIn(true);
      } else {
        await api.attendance.checkOut(currentUser.id);
        setCheckedIn(false);
        // Refresh wallet
        const walletData = await api.finance.getWallet(currentUser.id);
        setCurrentUser(prev => ({ ...prev, walletBalance: walletData.balance }));
      }
      
      // Refresh History
      const hist = await api.attendance.getHistory(currentUser.id);
      setHistory(hist);
      setShowScanner(false);
    } catch (error) {
      alert("Error recording attendance: " + error);
      setShowScanner(false);
    }
  };

  const handleAddLeave = async (leave: LeaveRequest) => {
      try {
        await api.leaves.request(leave);
        // Refresh
        const myLeaves = await api.leaves.getAll(currentUser.id, currentUser.role);
        setLeaves(myLeaves);
      } catch (error) {
        alert("Failed to request leave");
      }
  };

  const handleRoleToggle = () => {
    // For demo/testing: Simply swaps role in local state. 
    // In production, this would require re-login with different credentials.
    setCurrentUser(prev => ({
      ...prev,
      role: prev.role === UserRole.ADMIN ? UserRole.EMPLOYEE : UserRole.ADMIN
    }));
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    try {
        // Optimistic UI Update
        setCurrentUser(prev => ({ ...prev, ...updatedUser }));
        await api.employees.updateProfile(currentUser.id, updatedUser);
    } catch (error) {
        alert("Failed to update profile.");
    }
  };

  const handleAddTransaction = async (transaction: Transaction) => {
    try {
        // We use a custom endpoint to add transaction and update wallet
        await api.finance.addTransaction({
            userId: currentUser.id,
            type: transaction.type,
            amount: transaction.amount,
            title: transaction.title,
            date: transaction.date,
            tags: transaction.tags
        });
        
        // Refresh Wallet Data
        const walletData = await api.finance.getWallet(currentUser.id);
        setTransactions(walletData.transactions);
        setCurrentUser(prev => ({ ...prev, walletBalance: walletData.balance }));
    } catch (error) {
        alert("Failed to add transaction");
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  const handleNavigateToProject = (projectId: string) => {
    setTargetProjectId(projectId);
    setActiveTab('PROJECTS');
  };

  // --- Admin Functions ---
  const handleAddEmployee = async (newEmployeeData: any) => {
      try {
          await api.auth.register(newEmployeeData);
          // Refresh list
          const allEmps = await api.employees.getAll();
          setEmployees(allEmps);
      } catch (error) {
          alert("Failed to register employee");
      }
  };

  const handlePaySalary = async (employeeId: string, amount: number, month: string) => {
      const year = new Date().getFullYear();
      const payslipPayload = {
          userId: employeeId,
          month: month,
          year: year,
          periodStart: `${year}-01-01`, 
          periodEnd: `${year}-01-31`, 
          basicSalary: amount,
          totalEarnings: amount,
          totalDeductions: 0,
          netSalary: amount,
          items: [{ label: 'Basic Salary', amount: amount, type: 'earning' }]
      };
      
      try {
          await api.finance.generatePayslip(payslipPayload);
          // Refresh payslips list
          const allPayslips = await api.finance.getAllPayslips();
          setPayslips(allPayslips);
      } catch (error) {
          alert("Failed to generate payslip");
      }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
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