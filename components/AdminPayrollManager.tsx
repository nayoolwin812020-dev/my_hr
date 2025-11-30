import React, { useState } from 'react';
import { User, Payslip } from '../types';
import { DollarSign, CheckCircle2, Calendar, Send } from 'lucide-react';

interface AdminPayrollManagerProps {
  employees: User[];
  onPaySalary: (employeeId: string, amount: number, month: string) => void;
  payslips: Payslip[];
}

const AdminPayrollManager: React.FC<AdminPayrollManagerProps> = ({ employees, onPaySalary, payslips }) => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isPaid = (userId: string) => {
      return payslips.some(p => p.month === currentMonth && p.year === currentYear && p.id.includes(userId));
  };

  const handlePay = (emp: User) => {
      setProcessingId(emp.id);
      setTimeout(() => {
          onPaySalary(emp.id, emp.monthlyRate || 0, currentMonth);
          setProcessingId(null);
      }, 1000);
  };

  const totalMonthlyLiability = employees.reduce((sum, emp) => sum + (emp.monthlyRate || 0), 0);
  const paidCount = employees.filter(e => isPaid(e.id)).length;

  return (
    <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="text-emerald-100 text-xs font-bold uppercase mb-1">Total Payroll Liability</div>
                    <div className="text-3xl font-bold">{totalMonthlyLiability.toLocaleString()} <span className="text-lg opacity-70">MMK</span></div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <DollarSign size={24} />
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium bg-white/10 w-fit px-3 py-1 rounded-full">
                <Calendar size={14} /> {currentMonth} {currentYear}
            </div>
            <div className="mt-4 w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                <div 
                    className="bg-white h-full transition-all duration-500" 
                    style={{ width: `${(paidCount / employees.length) * 100}%` }} 
                />
            </div>
            <div className="text-right text-xs mt-1 text-emerald-100">{paidCount} / {employees.length} Paid</div>
        </div>

        {/* List */}
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Employee Payroll</h3>
            {employees.map(emp => {
                const paid = isPaid(emp.id);
                return (
                    <div key={emp.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</h4>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{(emp.monthlyRate || 0).toLocaleString()} MMK</div>
                            </div>
                        </div>
                        
                        {paid ? (
                            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-100 dark:border-green-900/30">
                                <CheckCircle2 size={14} /> Paid
                            </div>
                        ) : (
                            <button 
                                onClick={() => handlePay(emp)}
                                disabled={!!processingId}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                                {processingId === emp.id ? 'Sending...' : <><Send size={14} /> Pay Now</>}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default AdminPayrollManager;