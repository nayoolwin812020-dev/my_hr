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
          <h1 className="text-2xl font-bold text-gray-800">Hello, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-500">{currentDate}</p>
        </div>
        <img 
          src={user.avatar} 
          alt="Profile" 
          className="w-10 h-10 rounded-full border border-gray-200"
        />
      </div>

      {/* Main Status Card */}
      <div className={`rounded-2xl p-6 text-white shadow-xl transition-all duration-500 ${checkedIn ? 'bg-gradient-to-br from-green-500 to-emerald-700 shadow-green-200' : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-200'}`}>
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
          className="w-full bg-white text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
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
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="p-2 bg-orange-50 w-fit rounded-lg mb-2">
            <Clock size={20} className="text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">07:30</div>
          <div className="text-xs text-gray-500">Working Hours</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="p-2 bg-purple-50 w-fit rounded-lg mb-2">
            <CalendarDays size={20} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">24</div>
          <div className="text-xs text-gray-500">Days Present</div>
        </div>
      </div>

      {/* Last Activity */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Recent Activity</h3>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center ${lastRecord ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              <QrCode size={20} />
           </div>
           <div>
              <div className="font-semibold text-gray-800">{lastRecord ? `Checked ${lastRecord.checkOutTime ? 'Out' : 'In'}` : 'No activity today'}</div>
              <div className="text-xs text-gray-500">{lastRecord ? (lastRecord.checkOutTime || lastRecord.checkInTime) : '--:--'}</div>
           </div>
           {lastRecord?.photoUrl && (
             <img src={lastRecord.photoUrl} alt="Check-in snap" className="w-10 h-10 rounded object-cover ml-auto border border-gray-200" />
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
