import React from 'react';
import { ViewState } from '../types';
import { Home, Clock, DollarSign, Calendar, Settings as SettingsIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ViewState;
  onTabChange: (tab: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const NavItem = ({ tab, icon: Icon, label }: { tab: ViewState; icon: any; label: string }) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => onTabChange(tab)}
        className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">{label}</span>
      </button>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-2xl overflow-hidden">
      <main className="h-full overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-200 px-2 py-3 pb-6 sm:pb-3 flex justify-around z-40">
        <NavItem tab="DASHBOARD" icon={Home} label="Home" />
        <NavItem tab="HISTORY" icon={Clock} label="History" />
        <NavItem tab="PAYROLL" icon={DollarSign} label="Payroll" />
        <NavItem tab="LEAVE" icon={Calendar} label="Leave" />
        <NavItem tab="SETTINGS" icon={SettingsIcon} label="Settings" />
      </div>
    </div>
  );
};

export default Layout;
