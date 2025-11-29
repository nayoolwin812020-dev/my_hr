
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Wallet from './components/Wallet';
import Leave from './components/Leave';
import Projects from './components/Projects';
import Settings from './components/Settings';
import Scanner from './components/Scanner';
import Login from './components/Login';
import { ViewState, AttendanceRecord, UserRole } from './types';
import { CURRENT_USER, MOCK_HISTORY } from './constants';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });

  const [activeTab, setActiveTab] = useState<ViewState>('DASHBOARD');
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<'IN' | 'OUT'>('IN');
  
  // App Data State with Persistence
  const [history, setHistory] = useState<AttendanceRecord[]>(() => {
    try {
      const savedHistory = localStorage.getItem('attendance_history');
      return savedHistory ? JSON.parse(savedHistory) : MOCK_HISTORY;
    } catch (e) {
      return MOCK_HISTORY;
    }
  });

  const [checkedIn, setCheckedIn] = useState(() => {
    return localStorage.getItem('checked_in') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);

  // Sync Auth to LocalStorage
  useEffect(() => {
    localStorage.setItem('is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

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
        status: 'PRESENT',
        location: 'Office HQ',
        photoUrl: photoUrl
      };
      newHistory = [newRecord, ...history];
      setCheckedIn(true);
      localStorage.setItem('checked_in', 'true');
    } else {
      // Find today's record to update
      const updatedHistory = history.map((record, index) => {
        if (index === 0 && !record.checkOutTime) {
          return { ...record, checkOutTime: timeString };
        }
        return record;
      });
      newHistory = updatedHistory;
      setCheckedIn(false);
      localStorage.setItem('checked_in', 'false');
    }
    
    setHistory(newHistory);
    localStorage.setItem('attendance_history', JSON.stringify(newHistory));
    setShowScanner(false);
  };

  const handleRoleToggle = () => {
    setCurrentUser(prev => ({
      ...prev,
      role: prev.role === UserRole.ADMIN ? UserRole.EMPLOYEE : UserRole.ADMIN
    }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Optionally clear local data if needed, but keeping history is usually better UX
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
            lastRecord={history[0]}
          />
        )}
        {activeTab === 'HISTORY' && <History records={history} />}
        {activeTab === 'WALLET' && <Wallet user={currentUser} history={history} />}
        {activeTab === 'PROJECTS' && <Projects />}
        {activeTab === 'LEAVE' && <Leave userRole={currentUser.role} />}
        {activeTab === 'SETTINGS' && (
          <Settings 
            user={currentUser} 
            onRoleToggle={handleRoleToggle}
            onLogout={handleLogout}
          />
        )}
      </Layout>

      {/* Overlay Scanner */}
      {showScanner && (
        <Scanner 
          mode={scanMode}
          userAvatarUrl={currentUser.avatar}
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};

export default App;
