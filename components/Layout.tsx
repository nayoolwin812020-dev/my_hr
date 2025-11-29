
import React from 'react';
import { ViewState } from '../types';
import { Home, Wallet, Calendar, Settings as SettingsIcon, Briefcase } from 'lucide-react';

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
        className={`flex flex-col items-center justify-center min-w-[64px] py-1 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">{label}</span>
      </button>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 dark:bg-slate-900 min-h-screen relative shadow-2xl overflow-hidden transition-colors duration-300">
      <main className="h-full overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 max-w-md w-full bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-2 py-3 pb-6 sm:pb-3 z-40 transition-colors duration-300">
        <div className="flex justify-between overflow-x-auto no-scrollbar px-2 gap-2">
            <NavItem tab="DASHBOARD" icon={Home} label="Home" />
            <NavItem tab="PROJECTS" icon={Briefcase} label="Projects" />
            <NavItem tab="LEAVE" icon={Calendar} label="Calendar" />
            <NavItem tab="WALLET" icon={Wallet} label="Wallet" />
            <NavItem tab="SETTINGS" icon={SettingsIcon} label="Settings" />
        </div>
      </div>
    </div>
  );
};

export default Layout;
