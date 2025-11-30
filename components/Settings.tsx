import React, { useState, useEffect } from 'react';
import { User, UserRole, AttendanceRecord, Transaction } from '../types';
import { Bell, Shield, LogOut, ChevronRight, Moon, HelpCircle, User as UserIcon, Users, Camera, X, Check, Megaphone, Send, ArrowLeft, Lock, Key, Wallet as WalletIcon, Smartphone, QrCode, Building, Briefcase, Calendar, Hash, MapPin, CreditCard, BadgeCent, FileText } from 'lucide-react';
import Wallet from './Wallet';
import Payslips from './Payslips';

interface SettingsProps {
  user: User;
  history: AttendanceRecord[];
  transactions?: Transaction[];
  onRoleToggle?: () => void;
  onLogout: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onAddTransaction: (transaction: Transaction) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, history, transactions, onRoleToggle, onLogout, onUpdateUser, onAddTransaction }) => {
  const [currentView, setCurrentView] = useState<'MAIN' | 'VIEW_PROFILE' | 'EDIT_PROFILE' | 'CHANGE_PASSWORD' | 'WALLET' | 'PAYSLIPS' | 'PRIVACY'>('MAIN');
  const [isDark, setIsDark] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => localStorage.getItem('is_2fa_enabled') === 'true');
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [setupCode, setSetupCode] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user.name);
  const [editDept, setEditDept] = useState(user.department);
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  // Change Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);

  // Announcement Form State
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');

  useEffect(() => {
    // Check if dark mode is currently active on mount
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  // Reset form when user prop changes
  useEffect(() => {
    setEditName(user.name);
    setEditDept(user.department);
    setEditAvatar(user.avatar);
  }, [user]);

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

  const handleToggle2FA = () => {
      if (is2FAEnabled) {
          // Disable 2FA
          setIs2FAEnabled(false);
          localStorage.setItem('is_2fa_enabled', 'false');
          showSuccess("Two-Factor Authentication disabled.");
      } else {
          // Start Setup Flow
          setShow2FASetup(true);
          setSetupCode('');
          setSetupError(null);
      }
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
      e.preventDefault();
      if (setupCode === '123456') { // Mock validation
          setIs2FAEnabled(true);
          localStorage.setItem('is_2fa_enabled', 'true');
          setShow2FASetup(false);
          showSuccess("Two-Factor Authentication enabled!");
      } else {
          setSetupError("Invalid code. For demo, use 123456.");
      }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: editName,
      department: editDept,
      avatar: editAvatar
    });
    setCurrentView('MAIN');
    showSuccess("Profile updated successfully!");
  };

  const handleSavePassword = (e: React.FormEvent) => {
      e.preventDefault();
      setPassError(null);

      if (newPass.length < 6) {
          setPassError("Password must be at least 6 characters");
          return;
      }

      if (newPass !== confirmPass) {
          setPassError("New passwords do not match");
          return;
      }
      
      // Simulate API call
      setTimeout(() => {
          setCurrentPass('');
          setNewPass('');
          setConfirmPass('');
          setCurrentView('PRIVACY');
          showSuccess("Password changed successfully!");
      }, 500);
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API
    setShowAnnounceModal(false);
    setAnnounceTitle('');
    setAnnounceMsg('');
    showSuccess("Announcement sent to all employees!");
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ----------------------------------------------------------------------
  // VIEW: MY PROFILE DETAIL VIEW
  // ----------------------------------------------------------------------
  if (currentView === 'VIEW_PROFILE') {
    return (
      <div className="p-4 space-y-6 pb-24 dark:text-gray-100 animate-in slide-in-from-right duration-300 min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center gap-3">
              <button 
                  onClick={() => setCurrentView('MAIN')}
                  className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              >
                  <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h2>
          </div>

          {/* Identity Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
               <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
               <div className="px-6 pb-6 pt-0 relative">
                   <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 absolute -top-12 left-6 shadow-lg" 
                   />
                   <div className="pt-14">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{user.jobTitle || 'Employee'}</div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                             <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><Hash size={10} /> Employee ID</div>
                             <div className="font-mono font-bold text-slate-800 dark:text-white">{user.id}</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                             <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><Briefcase size={10} /> Department</div>
                             <div className="font-bold text-slate-800 dark:text-white">{user.department}</div>
                          </div>
                      </div>
                   </div>
               </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Employment Information</h3>
               <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-1">
                   {[
                       { icon: Building, label: "Company", value: user.companyName || "Organization" },
                       { icon: Calendar, label: "Join Date", value: user.joinDate || "N/A" },
                       { icon: Users, label: "Role Type", value: user.role === UserRole.ADMIN ? "Administrator" : "Employee" },
                   ].map((item, idx) => (
                       <div key={idx} className="flex items-center gap-4 p-4 border-b last:border-0 border-slate-50 dark:border-slate-700">
                           <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg">
                               <item.icon size={18} />
                           </div>
                           <div>
                               <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.label}</div>
                               <div className="text-sm font-bold text-slate-800 dark:text-white">{item.value}</div>
                           </div>
                       </div>
                   ))}
               </div>
          </div>

          {/* Payment & Financials */}
           <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Compensation</h3>
               <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-1">
                   {[
                       { icon: CreditCard, label: "Payment Type", value: user.paymentType || "Bank Transfer" },
                       { icon: BadgeCent, label: "Daily Rate", value: `${(user.dailyRate || 0).toLocaleString()} MMK` },
                       { icon: WalletIcon, label: "Monthly Rate", value: `${(user.monthlyRate || 0).toLocaleString()} MMK` },
                   ].map((item, idx) => (
                       <div key={idx} className="flex items-center gap-4 p-4 border-b last:border-0 border-slate-50 dark:border-slate-700">
                           <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                               <item.icon size={18} />
                           </div>
                           <div>
                               <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.label}</div>
                               <div className="text-sm font-bold text-slate-800 dark:text-white">{item.value}</div>
                           </div>
                       </div>
                   ))}
               </div>
          </div>

           {/* Contact Info */}
          <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Contact Details</h3>
               <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 flex items-start gap-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg shrink-0">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Address</div>
                        <div className="text-sm font-medium text-slate-800 dark:text-white leading-relaxed">
                            {user.address || "No Address Provided"}
                        </div>
                    </div>
               </div>
          </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: EDIT PROFILE PAGE
  // ----------------------------------------------------------------------
  if (currentView === 'EDIT_PROFILE') {
    return (
      <div className="p-4 space-y-6 pb-24 dark:text-gray-100 animate-in slide-in-from-right duration-300 min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* ... (Existing Edit Profile JSX) ... */}
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('MAIN')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex justify-center py-4">
                <div className="relative group cursor-pointer">
                    <img 
                        src={editAvatar} 
                        alt="Avatar" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl group-hover:opacity-90 transition-opacity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 p-3 rounded-full text-white backdrop-blur-sm">
                            <Camera size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Fields Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input 
                        type="text" 
                        required
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium transition-all"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</label>
                    <div className="relative">
                      <select 
                          className="w-full p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium appearance-none transition-all"
                          value={editDept}
                          onChange={(e) => setEditDept(e.target.value)}
                      >
                          <option value="Engineering">Engineering</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Sales">Sales</option>
                          <option value="Design">Design</option>
                      </select>
                      <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avatar URL</label>
                    <input 
                        type="text" 
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium text-sm transition-all text-slate-500"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
            </div>

            {/* Save Button */}
            <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Check size={20} /> Save Changes
            </button>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: CHANGE PASSWORD PAGE
  // ----------------------------------------------------------------------
  if (currentView === 'CHANGE_PASSWORD') {
    return (
      <div className="p-4 space-y-6 pb-24 dark:text-gray-100 animate-in slide-in-from-right duration-300 min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* ... (Existing Change Password JSX) ... */}
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('PRIVACY')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
        </div>

        <div className="flex justify-center py-6">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                <Lock size={40} />
            </div>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
                
                {passError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        {passError}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            required
                            className="w-full p-3.5 pl-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium transition-all"
                            value={currentPass}
                            onChange={(e) => setCurrentPass(e.target.value)}
                            placeholder="••••••••"
                        />
                         <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            required
                            className="w-full p-3.5 pl-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium transition-all"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            placeholder="••••••••"
                        />
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            required
                            className="w-full p-3.5 pl-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium transition-all"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            placeholder="••••••••"
                        />
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                </div>
            </div>

            <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Check size={20} /> Update Password
            </button>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: PRIVACY & SECURITY PAGE
  // ----------------------------------------------------------------------
  if (currentView === 'PRIVACY') {
    return (
      <div className="p-4 space-y-6 pb-24 dark:text-gray-100 animate-in slide-in-from-right duration-300 min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* ... (Existing Privacy JSX) ... */}
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('MAIN')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Privacy & Security</h2>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
            {/* Change Password */}
            <div 
                onClick={() => setCurrentView('CHANGE_PASSWORD')}
                className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Lock size={20} />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-gray-200">Change Password</span>
                </div>
                <ChevronRight size={18} className="text-slate-400 dark:text-slate-500" />
            </div>

            {/* 2FA Toggle */}
            <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={handleToggle2FA}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
                        <Smartphone size={20} />
                    </div>
                    <div>
                         <span className="font-medium text-slate-700 dark:text-gray-200 block">Two-Factor Auth</span>
                         <span className="text-xs text-slate-400 block">{is2FAEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in pointer-events-none">
                    <input type="checkbox" checked={is2FAEnabled} readOnly className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer right-5 checked:right-0" />
                    <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${is2FAEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}></label>
                </div>
            </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
            <Shield className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
            <div>
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Data Protection</h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                    Your personal data is encrypted and stored securely. We do not share your information with third parties without your consent.
                </p>
            </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: WALLET PAGE
  // ----------------------------------------------------------------------
  if (currentView === 'WALLET') {
    return (
      <div className="animate-in slide-in-from-right duration-300 min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
        {/* Header - Custom for Wallet View in Settings */}
        <div className="p-4 flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('MAIN')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold text-slate-900 dark:text-white text-lg">Back to Settings</span>
        </div>
        
        {/* Render Wallet Component */}
        <div className="-mt-4">
           <Wallet user={user} history={history} transactions={transactions} />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: PAYSLIPS PAGE
  // ----------------------------------------------------------------------
  if (currentView === 'PAYSLIPS') {
      return <Payslips 
                user={user} 
                onBack={() => setCurrentView('MAIN')} 
                onUpdateUser={onUpdateUser}
                onAddTransaction={onAddTransaction}
             />;
  }

  // ----------------------------------------------------------------------
  // VIEW: MAIN SETTINGS MENU
  // ----------------------------------------------------------------------
  return (
    <div className="p-4 space-y-6 pb-24 dark:text-gray-100 relative animate-in fade-in duration-300">
      {/* ... (Existing Main Settings JSX) ... */}
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h2>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 relative overflow-hidden transition-colors">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900 relative z-10"
        />
        <div className="relative z-10">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">{user.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
            {user.jobTitle || 'Employee'} • 
            <span className={`font-semibold ${user.role === UserRole.ADMIN ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {user.role === UserRole.ADMIN ? 'Admin' : 'Employee'}
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        
        {/* View Profile Button - New */}
        <div 
            onClick={() => setCurrentView('VIEW_PROFILE')}
            className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
              <Briefcase size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-gray-200">View My Profile</span>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-500" />
        </div>

        {/* Edit Profile Button - Opens Page View */}
        <div 
            onClick={() => setCurrentView('EDIT_PROFILE')}
            className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <UserIcon size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-gray-200">Edit Profile</span>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-500" />
        </div>

        {/* Wallet Button */}
        <div 
            onClick={() => setCurrentView('WALLET')}
            className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <WalletIcon size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-gray-200">My Wallet</span>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-500" />
        </div>

        {/* Payslips Button */}
        <div 
            onClick={() => setCurrentView('PAYSLIPS')}
            className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg">
              <FileText size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-gray-200">My Payslips</span>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-500" />
        </div>

        {/* Announcement Feature */}
        <div 
            onClick={() => setShowAnnounceModal(true)}
            className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
              <Megaphone size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-gray-200">Broadcast Announcement</span>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-500" />
        </div>

        <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
              <Bell size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-gray-200">Notifications</span>
          </div>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5" defaultChecked/>
            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 dark:bg-slate-600 cursor-pointer checked:bg-blue-500"></label>
          </div>
        </div>

        <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Moon size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-gray-200">Dark Mode</span>
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isDark ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-600'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div 
          onClick={() => setCurrentView('PRIVACY')}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Shield size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-gray-200">Privacy & Security</span>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
              <HelpCircle size={20} />
            </div>
            <span className="font-medium text-slate-700 dark:text-gray-200">Help & Support</span>
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

      <div className="text-center text-xs text-slate-400 dark:text-slate-600 pt-4">
        v1.2.0 • OrgAttendance AI
      </div>

      {/* ... (Existing Modals) ... */}
      {/* 2FA Setup Modal */}
      {show2FASetup && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Smartphone size={20} className="text-teal-500" />
                          Setup 2FA
                      </h3>
                      <button onClick={() => setShow2FASetup(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="text-center space-y-4">
                      <p className="text-sm text-slate-600 dark:text-slate-300">Scan this QR code with your authenticator app (Google Auth, Authy).</p>
                      
                      <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block">
                           {/* Placeholder QR Code */}
                           <div className="w-32 h-32 bg-slate-900 flex items-center justify-center">
                                <QrCode size={64} className="text-white" />
                           </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Enter Verification Code</label>
                          <input 
                              type="text" 
                              maxLength={6}
                              placeholder="123456"
                              className="w-full text-center text-xl tracking-widest p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white font-mono"
                              value={setupCode}
                              onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                          />
                          {setupError && <p className="text-xs text-red-500 font-bold animate-in fade-in">{setupError}</p>}
                      </div>

                      <button 
                          onClick={handleConfirm2FA}
                          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                          Verify & Enable
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Announcement Modal (Kept as modal for quick action) */}
      {showAnnounceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-lg">
                        <Megaphone size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Announce</h3>
                  </div>
                  <button onClick={() => setShowAnnounceModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <X size={20} />
                  </button>
              </div>

              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Title</label>
                      <input 
                          type="text" 
                          required
                          className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-pink-500 dark:text-white"
                          placeholder="e.g. Office Closed for Holiday"
                          value={announceTitle}
                          onChange={(e) => setAnnounceTitle(e.target.value)}
                          autoFocus
                      />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Message</label>
                      <textarea 
                          required
                          rows={4}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-pink-500 dark:text-white resize-none"
                          placeholder="Type your announcement here..."
                          value={announceMsg}
                          onChange={(e) => setAnnounceMsg(e.target.value)}
                      />
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex gap-2">
                     <Users size={16} className="shrink-0" />
                     <p>This message will be broadcast to <strong>all employees</strong> immediately via push notification.</p>
                  </div>

                  <button 
                      type="submit"
                      className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-lg shadow-pink-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                      <Send size={18} /> Send Broadcast
                  </button>
              </form>
           </div>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-[70]">
            <div className="bg-green-500 rounded-full p-1">
                <Check size={12} className="text-white" />
            </div>
            <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;