import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PayrollSummary, AttendanceRecord, UserRole } from '../types';
import { PAYROLL_DATA } from '../constants';
import { DollarSign, Zap, Clock, TrendingUp, Users, PieChart, Briefcase } from 'lucide-react';
import { analyzePayroll } from '../services/geminiService';

interface PayrollProps {
  history: AttendanceRecord[];
  userRole?: UserRole;
}

const Payroll: React.FC<PayrollProps> = ({ history, userRole = UserRole.EMPLOYEE }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Mock Personal Data
  const summary: PayrollSummary = {
    period: 'October 2023',
    totalHours: 160,
    overtimeHours: 5,
    grossPay: 7200,
    deductions: 1200,
    netPay: 6000
  };
  
  // Mock Admin/Department Data
  const deptSummary = {
    totalPayout: 45200,
    teamCount: 12,
    avgHours: 155,
    overtimeCost: 3400,
    budgetUtilization: 82
  };

  const ADMIN_CHART_DATA = [
    { name: 'Week 1', cost: 11250 },
    { name: 'Week 2', cost: 10800 },
    { name: 'Week 3', cost: 12400 },
    { name: 'Week 4', cost: 10950 },
  ];

  const handleGenerateInsight = async () => {
    setLoading(true);
    const result = await analyzePayroll(history, summary);
    setInsight(result);
    setLoading(false);
  };

  const renderAdminView = () => (
    <div className="space-y-6">
      {/* Admin High-Level Summary */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-xl shadow-lg shadow-slate-200 dark:shadow-none">
         <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-2 text-slate-300 bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              <Users size={14} /> <span>Engineering Dept</span>
           </div>
           <span className="text-xs text-emerald-400 font-medium bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
             On Budget
           </span>
         </div>
         
         <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-slate-400 mb-1">Total Payout</div>
              <div className="text-3xl font-bold tracking-tight">${deptSummary.totalPayout.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-1">Avg Hours/Emp</div>
              <div className="text-2xl font-bold">{deptSummary.avgHours}</div>
            </div>
         </div>

         <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
            <div>
               <div className="text-[10px] text-slate-400">Team Size</div>
               <div className="font-semibold text-sm">{deptSummary.teamCount}</div>
            </div>
            <div className="text-center">
               <div className="text-[10px] text-slate-400">Overtime Cost</div>
               <div className="font-semibold text-sm text-orange-400">${deptSummary.overtimeCost}</div>
            </div>
            <div className="text-right">
               <div className="text-[10px] text-slate-400">Budget Used</div>
               <div className="font-semibold text-sm text-blue-400">{deptSummary.budgetUtilization}%</div>
            </div>
         </div>
      </div>

      {/* Admin Chart */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
            Expenditure Trend
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-gray-500">Last 4 Weeks</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ADMIN_CHART_DATA}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
              />
              <Area type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl transition-colors">
        <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm mb-2">Action Items</h4>
        <ul className="list-disc list-inside text-xs text-orange-700 dark:text-orange-400 space-y-1">
          <li>Review overtime for Week 3 (High Usage)</li>
          <li>Approve 3 pending payroll adjustments</li>
        </ul>
      </div>
    </div>
  );

  const renderEmployeeView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-colors">
          <div className="text-blue-100 text-xs font-medium mb-1">Net Pay</div>
          <div className="text-2xl font-bold flex items-center gap-1">
            <DollarSign size={20} className="text-blue-200" />
            {summary.netPay.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Total Hours</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-1">
            <Clock size={20} className="text-orange-500" />
            {summary.totalHours}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Overtime</div>
          <div className="text-xl font-bold text-slate-800 dark:text-white">{summary.overtimeHours} hrs</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Deductions</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">-${summary.deductions}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-white mb-4">Weekly Earnings</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PAYROLL_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.2} />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: 'black' }}
                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
              />
              <Bar dataKey="pay" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-purple-100 dark:border-purple-900/30 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <Zap size={16} className="fill-purple-600 text-purple-600 dark:text-purple-400 dark:fill-purple-400" />
            AI Payroll Insight
          </h3>
          <button 
            onClick={handleGenerateInsight} 
            disabled={loading}
            className="text-xs bg-white dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-3 py-1.5 rounded-full font-medium shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Generate Report'}
          </button>
        </div>
        
        {insight ? (
          <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed animate-in fade-in slide-in-from-bottom-2">
            {insight}
          </p>
        ) : (
          <p className="text-sm text-purple-400 dark:text-purple-500 italic">
            Tap generate to analyze trends and efficiency.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
        {userRole === UserRole.ADMIN ? (
            <>
                <Briefcase size={24} className="text-slate-700 dark:text-slate-300" /> Department Payroll
            </>
        ) : 'My Payroll & Analytics'}
      </h2>

      {userRole === UserRole.ADMIN ? renderAdminView() : renderEmployeeView()}
      
    </div>
  );
};

export default Payroll;