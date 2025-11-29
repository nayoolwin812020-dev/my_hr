import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Bell, Shield, LogOut, ChevronRight, Moon, HelpCircle, User as UserIcon, Users } from 'lucide-react';

interface SettingsProps {
  user: User;
  onRoleToggle?: () => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onRoleToggle, onLogout }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is currently active on mount
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
      setIsDark(true);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 dark:text-gray-100">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h2>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 relative overflow-hidden transition-colors">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900 relative z-10"
        />
        <div className="relative z-10">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">{user.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
            {user.department} • 
            <span className={`font-semibold ${user.role === UserRole.ADMIN ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {user.role}
            </span>
          </p>
        </div>
        {user.role === UserRole.ADMIN && (
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none dark:opacity-5">
             <Shield size={100} />
          </div>
        )}
      </div>

      {/* Role Switcher (For Demo) */}
      {onRoleToggle && (
        <div 
          onClick={onRoleToggle}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 p-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none text-white flex items-center justify-between cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users size={20} />
            </div>
            <div>
              <div className="font-bold text-sm">Switch Mode (Demo)</div>
              <div className="text-xs text-indigo-100">
                Current: {user.role === UserRole.ADMIN ? 'Admin View' : 'Employee View'}
              </div>
            </div>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            Toggle
          </div>
        </div>
      )}

      {/* Settings List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <UserIcon size={20} />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Edit Profile</span>
          </div>
          <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
              <Bell size={20} />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Notifications</span>
          </div>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5" defaultChecked/>
            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer checked:bg-blue-500"></label>
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Moon size={20} />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isDark ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Shield size={20} />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Privacy & Security</span>
          </div>
          <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">
              <HelpCircle size={20} />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Help & Support</span>
          </div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
      >
        <LogOut size={20} />
        Log Out
      </button>

      <div className="text-center text-xs text-gray-400 dark:text-gray-600 pt-4">
        v1.1.0 • OrgAttendance AI
      </div>
    </div>
  );
};

export default Settings;