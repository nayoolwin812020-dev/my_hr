import React from 'react';
import { ViewState } from '../types';
import { Home, Wallet, Calendar, Settings as SettingsIcon, Briefcase, CheckSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ViewState;
  onTabChange: (tab: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { tab: 'DASHBOARD' as ViewState, icon: Home, label: "Home" },
    { tab: 'MY_TASKS' as ViewState, icon: CheckSquare, label: "My Tasks" },
    { tab: 'PROJECTS' as ViewState, icon: Briefcase, label: "Projects" },
    { tab: 'LEAVE' as ViewState, icon: Calendar, label: "Calendar" },
    { tab: 'SETTINGS' as ViewState, icon: SettingsIcon, label: "Settings" }
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden font-sans">
      
      {/* Desktop Sidebar - Hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-colors duration-300 shadow-sm z-30">
        <div className="p-6 flex items-center gap-3">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none">OA</div>
           <div>
             <h1 className="font-bold text-lg tracking-tight leading-none">OrgAttendance</h1>
             <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Workspace</span>
           </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = activeTab === item.tab;
             return (
               <button 
                 key={item.tab}
                 onClick={() => onTabChange(item.tab)}
                 className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                   isActive 
                     ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold shadow-sm' 
                     : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                 }`}
               >
                 <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                 <span>{item.label}</span>
               </button>
             )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
           <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-700 dark:to-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase mb-1">Current Session</p>
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="font-bold text-sm truncate text-slate-700 dark:text-slate-200">Online</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-6 p-4 md:p-8">
           <div className="max-w-7xl mx-auto w-full h-full">
              {children}
           </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Visible only on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 px-4 py-2 pb-safe z-40 transition-colors duration-300">
        <div className="flex justify-between items-center max-w-md mx-auto">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                <button 
                    key={item.tab}
                    onClick={() => onTabChange(item.tab)}
                    className={`flex flex-col items-center justify-center min-w-[64px] py-2 transition-all duration-200 active:scale-95 ${isActive ? 'text-blue-600 dark:text-blue-400 transform -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-transparent'}`}>
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'opacity-100' : 'opacity-0 scale-0'} transition-all duration-200 absolute -bottom-1`}>{item.label}</span>
                </button>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default Layout;