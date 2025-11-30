import React, { useState } from 'react';
import { User, Payslip, Transaction } from '../types';
import { MOCK_PAYSLIPS } from '../constants';
import { FileText, Download, ChevronRight, ArrowLeft, Building, BadgeCent, Calendar, CheckCircle, Share2, CheckSquare, ArrowDownLeft } from 'lucide-react';

interface PayslipsProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
  onAddTransaction: (transaction: Transaction) => void;
}

const Payslips: React.FC<PayslipsProps> = ({ user, onBack, onUpdateUser, onAddTransaction }) => {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [confirmReceipt, setConfirmReceipt] = useState<Payslip | null>(null);

  const handleExport = () => {
    setIsExporting(true);
    // Simulate generation delay
    setTimeout(() => {
        setIsExporting(false);
        // In a real app, this would trigger a PDF download or window.print()
        alert('Payslip downloaded successfully (Simulated)');
    }, 1500);
  };

  const handleConfirmReceipt = () => {
    if (!confirmReceipt) return;

    // 1. Add Transaction (Debit/Withdrawal)
    const newTx: Transaction = {
        id: `tx-wd-${confirmReceipt.id}-${Date.now()}`,
        type: 'debit',
        title: `Salary Withdrawal - ${confirmReceipt.month}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: confirmReceipt.netSalary,
        tags: ['Withdrawal', 'Salary Payout']
    };
    onAddTransaction(newTx);

    // 2. Update Balance (Subtract to clear balance)
    onUpdateUser({
        walletBalance: Math.max(0, user.walletBalance - confirmReceipt.netSalary)
    });

    // 3. UI Feedback and Close
    alert(`Salary of ${confirmReceipt.netSalary.toLocaleString()} MMK has been withdrawn. Wallet balance updated.`);
    setConfirmReceipt(null);
    // Optionally close detail view
    setSelectedPayslip(null);
  };

  // DETAIL VIEW
  if (selectedPayslip) {
      return (
          <div className="p-4 space-y-6 pb-24 dark:text-gray-100 animate-in slide-in-from-right duration-300 min-h-screen bg-slate-50 dark:bg-slate-900">
               {/* Header */}
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSelectedPayslip(null)}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payslip Details</h2>
                  </div>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setConfirmReceipt(selectedPayslip)}
                        className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                        title="Withdraw Salary"
                      >
                          <ArrowDownLeft size={20} />
                      </button>
                      <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                          {isExporting ? <span className="text-xs font-bold animate-pulse">Saving...</span> : <Download size={20} />}
                      </button>
                  </div>
              </div>

              {/* Payslip Receipt Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  {/* Receipt Header */}
                  <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
                      <div className="relative z-10 flex justify-between items-start">
                          <div>
                              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
                                  <Building size={12} /> {user.companyName || 'Organization'}
                              </div>
                              <h1 className="text-2xl font-bold mb-1">Payslip</h1>
                              <p className="text-slate-400 text-sm">{selectedPayslip.month} {selectedPayslip.year}</p>
                          </div>
                          <div className="text-right">
                              <div className="text-xs text-slate-400 mb-1">Status</div>
                              <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">
                                  <CheckCircle size={10} /> {selectedPayslip.status}
                              </div>
                          </div>
                      </div>
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                  </div>

                  {/* Employee Info */}
                  <div className="p-6 border-b border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-4">
                          <img src={user.avatar} className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-600" alt="Avatar" />
                          <div>
                              <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{user.jobTitle} • {user.id}</div>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                          <div>
                              <span className="text-slate-400 block mb-0.5">Payment Method</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{user.paymentType || 'Bank Transfer'}</span>
                          </div>
                          <div>
                              <span className="text-slate-400 block mb-0.5">Pay Period</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedPayslip.periodStart} - {selectedPayslip.periodEnd.split('-')[2]}</span>
                          </div>
                      </div>
                  </div>

                  {/* Breakdown */}
                  <div className="p-6 space-y-4">
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Earnings</h4>
                          <div className="space-y-2">
                              {selectedPayslip.items.filter(i => i.type === 'earning').map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                      <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                                      <span className="font-medium text-slate-900 dark:text-white">{item.amount.toLocaleString()} MMK</span>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-sm font-bold">
                              <span className="text-slate-500">Total Earnings</span>
                              <span className="text-green-600 dark:text-green-400">{selectedPayslip.totalEarnings.toLocaleString()} MMK</span>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Deductions</h4>
                          <div className="space-y-2">
                              {selectedPayslip.items.filter(i => i.type === 'deduction').map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                      <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                                      <span className="font-medium text-red-500">-{item.amount.toLocaleString()} MMK</span>
                                  </div>
                              ))}
                              {selectedPayslip.items.filter(i => i.type === 'deduction').length === 0 && (
                                  <div className="text-xs text-slate-400 italic">No deductions</div>
                              )}
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-sm font-bold">
                              <span className="text-slate-500">Total Deductions</span>
                              <span className="text-red-500">-{selectedPayslip.totalDeductions.toLocaleString()} MMK</span>
                          </div>
                      </div>
                  </div>

                  {/* Total */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Net Pay</span>
                          <span className="text-2xl font-bold text-slate-900 dark:text-white">{selectedPayslip.netSalary.toLocaleString()} <span className="text-sm font-medium text-slate-400">MMK</span></span>
                      </div>
                      <div className="text-xs text-slate-400 mt-2 text-center">
                          Generated on {selectedPayslip.generatedDate} • Ref: {selectedPayslip.id}
                      </div>
                  </div>
              </div>

              <div className="flex gap-3">
                  <button onClick={() => setConfirmReceipt(selectedPayslip)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2">
                      <ArrowDownLeft size={18} /> Withdraw Salary
                  </button>
                  <button onClick={handleExport} className="flex-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                      <Download size={18} /> PDF
                  </button>
              </div>

              {/* Confirmation Modal */}
              {confirmReceipt && (
                  <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
                      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BadgeCent size={32} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Confirm Withdrawal?</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                              Have you received your salary of <strong className="text-slate-900 dark:text-white">{confirmReceipt.netSalary.toLocaleString()} MMK</strong>? 
                              <br/><br/>
                              Confirming this will <strong>deduct</strong> this amount from your in-app wallet balance to reflect the payout.
                          </p>
                          
                          <div className="flex gap-3">
                              <button 
                                  onClick={() => setConfirmReceipt(null)}
                                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                              >
                                  Cancel
                              </button>
                              <button 
                                  onClick={handleConfirmReceipt}
                                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-none transition-colors"
                              >
                                  Confirm Payout
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // LIST VIEW
  return (
    <div className="p-4 space-y-6 pb-24 dark:text-gray-100 animate-in slide-in-from-right duration-300 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
            <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Payslips</h2>
      </div>

      <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 dark:shadow-none relative overflow-hidden">
          <div className="relative z-10">
              <div className="text-blue-100 text-xs font-bold uppercase mb-1">Latest Salary</div>
              <div className="text-3xl font-bold mb-4">{user.monthlyRate?.toLocaleString()} <span className="text-lg opacity-70">MMK</span></div>
              <div className="flex gap-4 text-sm">
                  <div>
                      <span className="block text-blue-200 text-xs">Bank</span>
                      <span className="font-semibold">KBZ Bank</span>
                  </div>
                  <div>
                      <span className="block text-blue-200 text-xs">Last Paid</span>
                      <span className="font-semibold">Nov 1, 2023</span>
                  </div>
              </div>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
             <BadgeCent size={120} />
          </div>
      </div>

      <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">History</h3>
          {MOCK_PAYSLIPS.map((slip) => (
              <div 
                key={slip.id}
                onClick={() => setSelectedPayslip(slip)}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-600">
                          <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500">{slip.month.substring(0,3)}</span>
                          <span className="text-sm leading-none">{slip.year.toString().substring(2)}</span>
                      </div>
                      <div>
                          <div className="font-bold text-slate-900 dark:text-white">{slip.month} {slip.year}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <CheckCircle size={10} className="text-green-500" /> Paid on {slip.generatedDate}
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="text-right">
                          <div className="font-bold text-slate-900 dark:text-white">{slip.netSalary.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">Net Pay</div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default Payslips;