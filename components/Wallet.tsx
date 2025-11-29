
import React from 'react';
import { User, AttendanceRecord } from '../types';
import { Wallet as WalletIcon, TrendingUp, DollarSign, Award, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';

interface WalletProps {
  user: User;
  history: AttendanceRecord[];
}

const Wallet: React.FC<WalletProps> = ({ user, history }) => {
  // Calculate earnings based on history (Mock calculation)
  const calculateTotalEarned = () => {
    return history.filter(h => h.status === 'PRESENT').length * user.dailyRate;
  };

  const transactions = [
    { id: 1, type: 'credit', title: 'Salary Credited', date: 'Oct 30, 2023', amount: user.dailyRate * 20 },
    { id: 2, type: 'credit', title: 'Daily Rate Added', date: 'Yesterday', amount: user.dailyRate },
    { id: 3, type: 'debit', title: 'Advance Withdrawal', date: 'Oct 20, 2023', amount: 200 },
    { id: 4, type: 'credit', title: 'Performance Bonus', date: 'Oct 15, 2023', amount: 150 },
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <WalletIcon className="text-blue-600" /> My Wallet
      </h2>

      {/* Main Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div className="relative z-10">
            <div className="text-indigo-100 text-sm font-medium mb-1">Total Balance</div>
            <div className="text-4xl font-bold mb-6">${user.walletBalance.toLocaleString()}</div>
            
            <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex-1">
                    <div className="text-xs text-indigo-100 mb-1 flex items-center gap-1">
                        <DollarSign size={12} /> Daily Rate
                    </div>
                    <div className="font-semibold text-lg">${user.dailyRate}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex-1">
                    <div className="text-xs text-indigo-100 mb-1 flex items-center gap-1">
                        <Award size={12} /> Reward Points
                    </div>
                    <div className="font-semibold text-lg">{user.points} pts</div>
                </div>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <ArrowUpRight size={16} />
                </div>
                <span className="text-xs font-bold uppercase">Earned</span>
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">${calculateTotalEarned()}</div>
            <div className="text-[10px] text-gray-400">From attendance</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <ArrowDownRight size={16} />
                </div>
                <span className="text-xs font-bold uppercase">Spent</span>
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">$200.00</div>
            <div className="text-[10px] text-gray-400">Advance/Deductions</div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-lg">Recent Transactions</h3>
        <div className="space-y-3">
            {transactions.map((tx) => (
                <div key={tx.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                            tx.type === 'credit' 
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        }`}>
                            {tx.type === 'credit' ? <ArrowUpRight size={20} /> : <CreditCard size={20} />}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-800 dark:text-white">{tx.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{tx.date}</div>
                        </div>
                    </div>
                    <div className={`font-bold ${
                         tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-white'
                    }`}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
