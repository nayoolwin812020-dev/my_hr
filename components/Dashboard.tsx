import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, LeaveRequest, UserRole, Payslip } from '../types';
import { QrCode, LogOut, Clock, CalendarDays, MapPin, Wallet, TrendingUp, AlertCircle, Coffee, CheckCircle2, Users, FileText, Briefcase } from 'lucide-react';
import AdminEmployeeManager from './AdminEmployeeManager';
import AdminPayrollManager from './AdminPayrollManager';

interface DashboardProps {
  user: User;
  checkedIn: boolean;
  onScanClick: (mode: 'IN' | 'OUT') => void;
  history: AttendanceRecord[];
  leaves: LeaveRequest[];
  employees?: User[];
  onAddEmployee?: (user: User) => void;
  payslips?: Payslip[];
  onPaySalary?: (employeeId: string, amount: number, month: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, checkedIn, onScanClick, history, leaves, employees = [], onAddEmployee, payslips = [], onPaySalary }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminTab, setAdminTab] = useState<'OVERVIEW' | 'PEOPLE' | 'PAYROLL'>('OVERVIEW');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const dateString = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const todayIso = currentTime.toISOString().split('T')[0];
  const isWeekend = currentTime.getDay() === 5;

  // --- ADMIN VIEW LOGIC ---
  const renderAdminView = () => {
      // Admin Stats
      const totalEmployees = employees.length;
      const presentToday = history.filter(h => h.date === todayIso && h.status !== 'ABSENT').length;
      const pendingLeaves = leaves.filter(l => l.status === 'PENDING').length;

      return (
          <div className="space-y-6">
              {/* Admin Navigation Pills */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-md">
                  <button onClick={() => setAdminTab('OVERVIEW')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${adminTab === 'OVERVIEW' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'}`}>Overview</button>
                  <button onClick={() => setAdminTab('PEOPLE')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${adminTab === 'PEOPLE' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'}`}>People</button>
                  <button onClick={() => setAdminTab('PAYROLL')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${adminTab === 'PAYROLL' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'}`}>Payroll</button>
              </div>

              {adminTab === 'OVERVIEW' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl transition-shadow">
                              <div className="flex items-center gap-2 mb-2 opacity-80">
                                  <Users size={16} /> <span className="text-xs font-bold uppercase">Total Staff</span>
                              </div>
                              <div className="text-3xl font-bold">{totalEmployees}</div>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                              <div className="flex items-center gap-2 mb-2 text-green-600">
                                  <CheckCircle2 size={16} /> <span className="text-xs font-bold uppercase">Present Today</span>
                              </div>
                              <div className="text-3xl font-bold text-slate-900 dark:text-white">{presentToday}</div>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                              <div className="flex items-center gap-2 mb-2 text-orange-500">
                                  <AlertCircle size={16} /> <span className="text-xs font-bold uppercase">Pending Leave</span>
                              </div>
                              <div className="text-3xl font-bold text-slate-900 dark:text-white">{pendingLeaves}</div>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                              <div className="flex items-center gap-2 mb-2 text-purple-600">
                                  <Wallet size={16} /> <span className="text-xs font-bold uppercase">Payroll Run</span>
                              </div>
                              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Due in 5 days</div>
                          </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-6">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                          <div className="flex flex-wrap gap-3">
                              <button onClick={() => setAdminTab('PEOPLE')} className="flex flex-col items-center justify-center min-w-[100px] p-4 bg-slate-50 dark:bg-slate-700 rounded-xl gap-2 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex-1 md:flex-none">
                                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400"><Users size={20} /></div>
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Add Staff</span>
                              </button>
                              <button onClick={() => setAdminTab('PAYROLL')} className="flex flex-col items-center justify-center min-w-[100px] p-4 bg-slate-50 dark:bg-slate-700 rounded-xl gap-2 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex-1 md:flex-none">
                                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400"><Wallet size={20} /></div>
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Pay Salary</span>
                              </button>
                              <button className="flex flex-col items-center justify-center min-w-[100px] p-4 bg-slate-50 dark:bg-slate-700 rounded-xl gap-2 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex-1 md:flex-none">
                                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-orange-600 dark:text-orange-400"><FileText size={20} /></div>
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Reports</span>
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {adminTab === 'PEOPLE' && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                      {onAddEmployee ? (
                          <AdminEmployeeManager employees={employees} onAddEmployee={onAddEmployee} />
                      ) : <div>Loading...</div>}
                  </div>
              )}

              {adminTab === 'PAYROLL' && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                      {onPaySalary ? (
                          <AdminPayrollManager employees={employees} onPaySalary={onPaySalary} payslips={payslips} />
                      ) : <div>Loading...</div>}
                  </div>
              )}
          </div>
      );
  };

  // --- EMPLOYEE VIEW LOGIC ---
  const renderEmployeeView = () => {
      // Data Logic
      const todayRecord = history.find(r => r.date === todayIso);
      const approvedLeave = leaves.find(l => l.startDate <= todayIso && l.endDate >= todayIso && l.status === 'APPROVED');
      
      const currentMonth = currentTime.getMonth();
      const currentYear = currentTime.getFullYear();
      const monthlyRecords = history.filter(r => {
          const d = new Date(r.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      
      const totalAttendance = monthlyRecords.length;
      const totalLate = monthlyRecords.filter(r => r.status === 'LATE').length;

      const parseTime = (t: string) => {
        if (!t) return 0;
        try {
            const [time, modifier] = t.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
            return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
        } catch(e) { return 0; }
      };

      const calculateWorkDuration = () => {
          if (!todayRecord) return null;
          const startMinutes = parseTime(todayRecord.checkInTime);
          let endMinutes = 0;
          if (todayRecord.checkOutTime) {
              endMinutes = parseTime(todayRecord.checkOutTime);
          } else {
              endMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
          }
          const diff = endMinutes - startMinutes;
          if (diff < 0) return "0h 0m";
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          return `${h}h ${m}m`;
      };

      const workDuration = calculateWorkDuration();

      const renderStatusCard = () => {
        if (approvedLeave) {
            return (
                <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl relative overflow-hidden h-full">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                            <Coffee size={16} /> <span className="text-sm font-semibold">On Leave</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Enjoy your time off!</h2>
                        <p className="text-purple-100 text-sm">Return Date: {approvedLeave.endDate}</p>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                        <Coffee size={120} />
                    </div>
                </div>
            );
        }

        if (isWeekend && !todayRecord) {
            return (
                 <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-xl relative overflow-hidden h-full">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                            <CalendarDays size={16} /> <span className="text-sm font-semibold">Weekend</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">It's your day off</h2>
                        <p className="text-slate-300 text-sm">Enjoy your weekend!</p>
                    </div>
                </div>
            );
        }

        if (todayRecord) {
            const isLate = todayRecord.status === 'LATE';
            return (
                <div className={`rounded-2xl p-5 text-white shadow-xl transition-all relative overflow-hidden h-full flex flex-col justify-between ${
                    todayRecord.checkOutTime 
                     ? 'bg-gradient-to-br from-slate-700 to-slate-900' 
                     : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-200 dark:shadow-none'
                }`}>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                <Clock size={16} /> 
                                <span className="text-sm font-semibold">
                                    {todayRecord.checkOutTime ? 'Shift Completed' : 'Currently Working'}
                                </span>
                            </div>
                            {isLate && (
                                <div className="flex items-center gap-1 bg-yellow-500/80 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                                    <AlertCircle size={12} /> Late
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                                <div className="text-xs text-blue-100 mb-1">Check In</div>
                                <div className="text-xl font-bold">{todayRecord.checkInTime}</div>
                            </div>
                             <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                                <div className="text-xs text-blue-100 mb-1">Check Out</div>
                                <div className="text-xl font-bold">{todayRecord.checkOutTime || '--:--'}</div>
                            </div>
                             <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm col-span-2 flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-blue-100 mb-0.5">Work Duration</div>
                                    <div className="text-lg font-bold">{workDuration}</div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <TrendingUp size={16} />
                                </div>
                            </div>
                        </div>

                        {!todayRecord.checkOutTime && (
                             <button 
                                onClick={() => onScanClick('OUT')}
                                className="w-full bg-white text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 active:scale-95 transition-all shadow-sm mt-auto"
                            >
                                <LogOut size={20} /> Check Out
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200 dark:shadow-none h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Clock size={24} className="text-white" />
                        </div>
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            Not Checked In
                        </span>
                    </div>
                    
                    <div className="mb-8">
                        <div className="text-4xl font-bold mb-1">{timeString}</div>
                        <div className="text-white/80 text-sm flex items-center gap-1">
                            <MapPin size={12} /> Office HQ
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => onScanClick('IN')}
                    className="w-full bg-white text-blue-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
                >
                    <QrCode size={20} /> Scan QR & Check In
                </button>
            </div>
        );
      };

      return (
          <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Wallet & Monthly Stats */}
                  <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                                  <Wallet size={24} />
                              </div>
                              <div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Wallet Balance</div>
                                  <div className="text-2xl font-bold text-slate-900 dark:text-white">${user.walletBalance.toLocaleString()}</div>
                              </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-xl">
                              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">+${user.dailyRate}/day</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 w-fit rounded-lg mb-3">
                            <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-3xl font-bold text-slate-800 dark:text-white">{totalAttendance}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Present Days</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 w-fit rounded-lg mb-3">
                            <AlertCircle size={20} className="text-orange-500 dark:text-orange-400" />
                          </div>
                          <div className="text-3xl font-bold text-slate-800 dark:text-white">{totalLate}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Late Days</div>
                        </div>
                      </div>
                  </div>

                  {/* Right Column: Active Status Card */}
                  <div className="h-full">
                      {renderStatusCard()}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              {user.role === UserRole.ADMIN ? 'Organization Dashboard' : `Hello, ${user.name.split(' ')[0]} 👋`}
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">{dateString}</p>
        </div>
        <img 
          src={user.avatar} 
          alt="Profile" 
          className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover shadow-sm"
        />
      </div>

      {user.role === UserRole.ADMIN ? renderAdminView() : renderEmployeeView()}
    </div>
  );
};

export default Dashboard;