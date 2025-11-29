import React from 'react';
import { User, AttendanceRecord } from '../types';
import { QrCode, LogOut, Clock, CalendarDays, MapPin } from 'lucide-react';

interface DashboardProps {
  user: User;
  checkedIn: boolean;
  onScanClick: (mode: 'IN' | 'OUT') => void;
  lastRecord?: AttendanceRecord;
}

const Dashboard: React.FC<DashboardProps> = ({ user, checkedIn, onScanClick, lastRecord }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Hello, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{currentDate}</p>
        </div>
        <img 
          src={user.avatar} 
          alt="Profile" 
          className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700"
        />
      </div>

      {/* Main Status Card */}
      <div className={`rounded-2xl p-6 text-white shadow-xl transition-all duration-500 ${checkedIn ? 'bg-gradient-to-br from-green-500 to-emerald-700 shadow-green-200 dark:shadow-none' : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-200 dark:shadow-none'}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Clock size={24} className="text-white" />
          </div>
          <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {checkedIn ? 'Currently In Office' : 'Not Checked In'}
          </span>
        </div>
        
        <div className="mb-8">
          <div className="text-4xl font-bold mb-1">{currentTime}</div>
          <div className="text-white/80 text-sm flex items-center gap-1">
            <MapPin size={12} /> Office HQ, New York
          </div>
        </div>

        <button 
          onClick={() => onScanClick(checkedIn ? 'OUT' : 'IN')}
          className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
        >
          {checkedIn ? (
            <>
              <LogOut size={20} className="text-red-500" /> Check Out
            </>
          ) : (
            <>
              <QrCode size={20} className="text-blue-600" /> Check In
            </>
          )}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 w-fit rounded-lg mb-2">
            <Clock size={20} className="text-orange-500 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">07:30</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Working Hours</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 w-fit rounded-lg mb-2">
            <CalendarDays size={20} className="text-purple-500 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">24</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Days Present</div>
        </div>
      </div>

      {/* Last Activity */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Recent Activity</h3>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center ${lastRecord ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
              <QrCode size={20} />
           </div>
           <div>
              <div className="font-semibold text-slate-800 dark:text-white">{lastRecord ? `Checked ${lastRecord.checkOutTime ? 'Out' : 'In'}` : 'No activity today'}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{lastRecord ? (lastRecord.checkOutTime || lastRecord.checkInTime) : '--:--'}</div>
           </div>
           {lastRecord?.photoUrl && (
             <img src={lastRecord.photoUrl} alt="Check-in snap" className="w-10 h-10 rounded object-cover ml-auto border border-slate-200 dark:border-slate-600" />
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;