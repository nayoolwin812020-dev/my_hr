import React from 'react';
import { User, UserRole } from '../types';
import { Bell, Shield, LogOut, ChevronRight, Moon, HelpCircle, User as UserIcon, Users } from 'lucide-react';

interface SettingsProps {
  user: User;
  onRoleToggle?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onRoleToggle }) => {
  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>

      {/* Profile Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 relative z-10"
        />
        <div className="relative z-10">
          <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            {user.department} • 
            <span className={`font-semibold ${user.role === UserRole.ADMIN ? 'text-blue-600' : 'text-gray-500'}`}>
              {user.role}
            </span>
          </p>
        </div>
        {user.role === UserRole.ADMIN && (
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
             <Shield size={100} />
          </div>
        )}
      </div>

      {/* Role Switcher (For Demo) */}
      {onRoleToggle && (
        <div 
          onClick={onRoleToggle}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl shadow-lg shadow-indigo-200 text-white flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UserIcon size={20} />
            </div>
            <span className="font-medium text-gray-700">Edit Profile</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </div>

        <div className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Bell size={20} />
            </div>
            <span className="font-medium text-gray-700">Notifications</span>
          </div>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5" defaultChecked/>
            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer checked:bg-blue-500"></label>
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Moon size={20} />
            </div>
            <span className="font-medium text-gray-700">Dark Mode</span>
          </div>
          <span className="text-xs text-gray-400">Off</span>
        </div>

        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Shield size={20} />
            </div>
            <span className="font-medium text-gray-700">Privacy & Security</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
              <HelpCircle size={20} />
            </div>
            <span className="font-medium text-gray-700">Help & Support</span>
          </div>
        </div>
      </div>

      <button className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
        <LogOut size={20} />
        Log Out
      </button>

      <div className="text-center text-xs text-gray-400 pt-4">
        v1.1.0 • OrgAttendance AI
      </div>
    </div>
  );
};

export default Settings;
