import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Payroll from './components/Payroll';
import Leave from './components/Leave';
import Settings from './components/Settings';
import Scanner from './components/Scanner';
import { ViewState, AttendanceRecord, UserRole } from './types';
import { CURRENT_USER, MOCK_HISTORY } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewState>('DASHBOARD');
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<'IN' | 'OUT'>('IN');
  
  // App State
  const [history, setHistory] = useState<AttendanceRecord[]>(MOCK_HISTORY);
  const [checkedIn, setCheckedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);

  const handleScanRequest = (mode: 'IN' | 'OUT') => {
    setScanMode(mode);
    setShowScanner(true);
  };

  const handleScanComplete = (photoUrl: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toISOString().split('T')[0];

    if (scanMode === 'IN') {
      const newRecord: AttendanceRecord = {
        id: Math.random().toString(),
        userId: currentUser.id,
        date: dateString,
        checkInTime: timeString,
        status: 'PRESENT', // Simplified logic
        location: 'Office HQ',
        photoUrl: photoUrl
      };
      setHistory([newRecord, ...history]);
      setCheckedIn(true);
    } else {
      // Find today's record to update
      const updatedHistory = history.map((record, index) => {
        if (index === 0 && !record.checkOutTime) {
          return { ...record, checkOutTime: timeString };
        }
        return record;
      });
      setHistory(updatedHistory);
      setCheckedIn(false);
    }
    
    setShowScanner(false);
  };

  const handleRoleToggle = () => {
    setCurrentUser(prev => ({
      ...prev,
      role: prev.role === UserRole.ADMIN ? UserRole.EMPLOYEE : UserRole.ADMIN
    }));
  };

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
        {activeTab === 'PAYROLL' && <Payroll history={history} userRole={currentUser.role} />}
        {activeTab === 'LEAVE' && <Leave userRole={currentUser.role} />}
        {activeTab === 'SETTINGS' && (
          <Settings 
            user={currentUser} 
            onRoleToggle={handleRoleToggle}
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
