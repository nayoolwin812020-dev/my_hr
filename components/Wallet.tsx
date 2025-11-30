import React, { useMemo } from 'react';
import { User, AttendanceRecord, Transaction } from '../types';
import { Wallet as WalletIcon, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Clock, Calendar, AlertTriangle, Gift } from 'lucide-react';

interface WalletProps {
  user: User;
  history: AttendanceRecord[];
  transactions?: Transaction[];
}

const Wallet: React.FC<WalletProps> = ({ user, history, transactions = [] }) => {
  const currentDate = new Date();
  
  // 1. Generate Transactions from History (Simulating Ledger)
  const historyTransactions: Transaction[] = useMemo(() => {
      const generated: Transaction[] = [];
      
      // Sort history new to old
      const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      sortedHistory.forEach(record => {
          // Skip if we already have a real transaction for this date (avoid doubles if app persists real ones)
          const hasRealTransaction = transactions.some(t => t.date === new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
          
          if (!hasRealTransaction) {
              const dateStr = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              // Base Salary Entry
              if (record.status === 'PRESENT' || record.status === 'LATE') {
                  generated.push({
                      id: `gen-${record.id}-salary`,
                      type: 'credit',
                      title: 'Daily Salary',
                      date: dateStr,
                      amount: user.dailyRate,
                      tags: ['Salary']
                  });
              } else if (record.status === 'HALF_DAY') {
                   generated.push({
                      id: `gen-${record.id}-salary`,
                      type: 'credit',
                      title: 'Half Day Salary',
                      date: dateStr,
                      amount: user.dailyRate / 2,
                      tags: ['Salary']
                  });
              }

              // Late Fee Entry
              if (record.status === 'LATE') {
                  generated.push({
                      id: `gen-${record.id}-late`,
                      type: 'debit',
                      title: 'Late Fee Deduction',
                      date: dateStr,
                      amount: user.lateDeductionAmount,
                      tags: ['Fee']
                  });
              }
          }
      });

      return generated;
  }, [history, user, transactions]);

  // Combine Real and Generated Transactions
  const allTransactions = [...transactions, ...historyTransactions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // Most recent first
  });

  // 2. Calculate Monthly Balance
  const monthlyBalance = useMemo(() => {
      const currentMonthStr = currentDate.toLocaleString('default', { month: 'short' });
      // Filter transactions for this month (basic string check for demo, robust dates better in prod)
      const thisMonthTx = allTransactions.filter(t => t.date.includes(currentMonthStr) || t.date.includes(currentDate.getFullYear().toString())); // Simple check
      
      const credits = thisMonthTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
      const debits = thisMonthTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
      
      return credits - debits;
  }, [allTransactions]);

  // 3. Today's Estimated Income
  const todayIncome = useMemo(() => {
      const todayIso = currentDate.toISOString().split('T')[0];
      const todayRecord = history.find(h => h.date === todayIso);
      
      if (!todayRecord) return 0;
      
      let income = user.dailyRate;
      if (todayRecord.status === 'LATE') {
          income -= user.lateDeductionAmount;
      } else if (todayRecord.status === 'HALF_DAY') {
          income = user.dailyRate / 2;
      }
      return income > 0 ? income : 0;
  }, [history, user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <WalletIcon className="text-blue-600" /> My Wallet
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-indigo-100 text-sm font-medium mb-1">Total Balance (This Month)</div>
                        <div className="text-4xl md:text-5xl font-bold tracking-tight">{monthlyBalance.toLocaleString()} <span className="text-lg md:text-2xl font-medium opacity-70">MMK</span></div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-row gap-3 w-full md:w-auto">
                <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl flex-1 md:flex-initial md:min-w-[140px] border border-white/10">
                    <div className="text-[10px] text-indigo-100 mb-1 flex items-center gap-1 uppercase font-bold tracking-wider">
                        <ArrowUpRight size={10} /> Income
                    </div>
                    <div className="font-bold text-sm">Today: {todayIncome.toLocaleString()}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl flex-1 md:flex-initial md:min-w-[140px] border border-white/10">
                    <div className="text-[10px] text-indigo-100 mb-1 flex items-center gap-1 uppercase font-bold tracking-wider">
                        <AlertTriangle size={10} /> Deductions
                    </div>
                    <div className="font-bold text-sm">Late: -{user.lateDeductionAmount.toLocaleString()}</div>
                </div>
            </div>
        </div>
      </div>

      {/* Rates & Fees Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                <DollarSign size={16} className="text-blue-500" />
                <span className="text-xs font-bold uppercase">Daily Rate</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{user.dailyRate.toLocaleString()} MMK</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                <Clock size={16} className="text-blue-500" />
                <span className="text-xs font-bold uppercase">Hourly Rate</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{user.hourlyRate.toLocaleString()} MMK</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                <AlertTriangle size={16} className="text-orange-500" />
                <span className="text-xs font-bold uppercase">Late Fee</span>
            </div>
            <div className="text-lg font-bold text-red-500">-{user.lateDeductionAmount.toLocaleString()} MMK</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                <ArrowUpRight size={16} className="text-green-500" />
                <span className="text-xs font-bold uppercase">Overtime/Hr</span>
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">+{user.overtimeRatePerHour.toLocaleString()} MMK</div>
        </div>

        <div className="col-span-2 md:col-span-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-full text-emerald-600 dark:text-emerald-300">
                    <Gift size={20} />
                </div>
                <div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Monthly Bonus</div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">Performance based</div>
                </div>
             </div>
             <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">+{user.monthlyBonus.toLocaleString()} MMK</div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-lg flex items-center gap-2">
            <CreditCard size={18} /> Daily Ledger
        </h3>
        
        {allTransactions.length === 0 ? (
           <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
             <p className="text-sm">No transaction history yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {allTransactions.map((tx) => (
                  <div key={tx.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between animate-in slide-in-from-bottom-2 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full shrink-0 ${
                              tx.type === 'credit' 
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          }`}>
                              {tx.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                          </div>
                          <div>
                              <div className="font-semibold text-slate-900 dark:text-white text-sm">{tx.title}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span>{tx.date}</span>
                                  {tx.tags && tx.tags.map(tag => (
                                      <span key={tag} className="bg-slate-100 dark:bg-slate-700 px-1.5 rounded text-[9px] font-medium text-slate-600 dark:text-slate-300">{tag}</span>
                                  ))}
                              </div>
                          </div>
                      </div>
                      <div className={`font-bold text-sm whitespace-nowrap ${
                          tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                          {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()}
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;