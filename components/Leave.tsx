
import React, { useState, useEffect } from 'react';
import { LeaveRequest, UserRole } from '../types';
import { MOCK_LEAVES, MOCK_TEAM_LEAVES } from '../constants';
import { Plus, Sparkles, X, Check, XCircle, User as UserIcon, ChevronDown, Clock, FileText, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { generateLeaveReason } from '../services/geminiService';

interface LeaveProps {
  userRole?: UserRole;
}

const Leave: React.FC<LeaveProps> = ({ userRole = UserRole.EMPLOYEE }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(MOCK_LEAVES);
  const [teamLeaves, setTeamLeaves] = useState<LeaveRequest[]>(MOCK_TEAM_LEAVES);
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Form State
  const [leaveType, setLeaveType] = useState('SICK');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState('1');
  const [reason, setReason] = useState('');

  // Auto-calculate days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        setDays(diffDays.toString());
      }
    } else if (startDate) {
      setDays('1');
    }
  }, [startDate, endDate]);

  const handleAiDraft = async () => {
    if (!leaveType || !startDate) return;
    setLoadingAi(true);
    const dates = `${startDate} to ${endDate || startDate} (${days} days)`;
    const generatedReason = await generateLeaveReason(leaveType, dates);
    setReason(generatedReason);
    setLoadingAi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLeave: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'u1',
      type: leaveType as any,
      startDate,
      endDate: endDate || startDate,
      days: parseFloat(days),
      reason,
      status: 'PENDING'
    };
    setLeaves([newLeave, ...leaves]);
    setShowForm(false);
    // Reset form
    setStartDate('');
    setEndDate('');
    setDays('1');
    setReason('');
  };

  const handleTeamAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    const updated = teamLeaves.map(l => l.id === id ? { ...l, status: action } : l);
    setTeamLeaves(updated);
  };

  // Calendar Helpers
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const getLeaveForDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Check local leaves
    const myLeave = leaves.find(l => {
        return dateStr >= l.startDate && dateStr <= l.endDate;
    });

    if (myLeave) return { type: 'LEAVE', data: myLeave };

    // Check team leaves if admin
    if (userRole === UserRole.ADMIN) {
        const teamLeave = teamLeaves.find(l => {
             return dateStr >= l.startDate && dateStr <= l.endDate;
        });
        if (teamLeave) return { type: 'TEAM_LEAVE', data: teamLeave };
    }

    // Mock "Absent" logic for past dates without records (Simplified)
    // In a real app, this would check AttendanceRecords
    const isPast = new Date(dateStr) < new Date() && new Date(dateStr).getDay() !== 0 && new Date(dateStr).getDay() !== 6;
    if (isPast && Math.random() > 0.9) return { type: 'ABSENT', data: null };

    return null;
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = startDayOfMonth(currentDate);
    const blanks = Array.from({ length: startDay }, (_, i) => <div key={`blank-${i}`} className="h-14 sm:h-20" />);
    
    const daysArray = Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const leaveInfo = getLeaveForDate(day);
      const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
      
      return (
        <div 
            key={day} 
            onClick={() => leaveInfo && setShowDetailModal({ day, ...leaveInfo })}
            className={`h-14 sm:h-20 border-t border-r border-slate-100 dark:border-slate-700 relative p-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
        >
          <span className={`text-xs font-medium ${isToday ? 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-700 dark:text-slate-300'}`}>
            {day}
          </span>
          
          {leaveInfo && (
            <div className={`mt-1 text-[10px] sm:text-xs rounded px-1 py-0.5 truncate font-medium
                ${leaveInfo.type === 'ABSENT' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 
                  leaveInfo.type === 'TEAM_LEAVE' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                  leaveInfo.data.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'}
            `}>
              {leaveInfo.type === 'ABSENT' ? 'Absent' : leaveInfo.type === 'TEAM_LEAVE' ? `User ${leaveInfo.data.userId}` : leaveInfo.data.type}
            </div>
          )}
        </div>
      );
    });

    return [...blanks, ...daysArray];
  };

  return (
    <div className="p-4 space-y-6 pb-24 relative min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
           <CalendarIcon className="text-blue-600" />
           {userRole === UserRole.ADMIN ? 'Team Calendar' : 'My Calendar'}
        </h2>
        {userRole === UserRole.EMPLOYEE && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {/* Calendar Header */}
      <div className="bg-white dark:bg-slate-800 rounded-t-2xl p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
         <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300">
            <ChevronLeft size={20} />
         </button>
         <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
         </h3>
         <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300">
            <ChevronRight size={20} />
         </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
         <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-500">
                    {day}
                </div>
            ))}
         </div>
         <div className="grid grid-cols-7">
            {renderCalendar()}
         </div>
      </div>

      {/* Leave Balances (Compact) */}
      {userRole === UserRole.EMPLOYEE && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pt-2">
            <div className="flex-shrink-0 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
               <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
               <div>
                 <div className="text-xs text-slate-500 dark:text-slate-400">Casual</div>
                 <div className="font-bold text-slate-800 dark:text-white">8/12</div>
               </div>
            </div>
            <div className="flex-shrink-0 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
               <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
               <div>
                 <div className="text-xs text-slate-500 dark:text-slate-400">Sick</div>
                 <div className="font-bold text-slate-800 dark:text-white">5/7</div>
               </div>
            </div>
        </div>
      )}

      {/* Leave Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowDetailModal(null)}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {showDetailModal.type === 'ABSENT' ? 'Absence Record' : 'Leave Details'}
                    </h3>
                    <button onClick={() => setShowDetailModal(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                {showDetailModal.type === 'ABSENT' ? (
                    <div className="text-center py-6">
                        <XCircle size={48} className="text-red-500 mx-auto mb-3" />
                        <p className="text-slate-800 dark:text-white font-medium">Marked Absent</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No check-in record found for this date.</p>
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-300 text-sm">
                            Daily Rate Deducted
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</span>
                            <div className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                showDetailModal.data.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {showDetailModal.data.status}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Type</span>
                            <div className="font-medium text-slate-800 dark:text-white">{showDetailModal.data.type}</div>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Duration</span>
                            <div className="font-medium text-slate-800 dark:text-white">
                                {showDetailModal.data.startDate} - {showDetailModal.data.endDate}
                                <span className="ml-2 text-sm text-slate-500">({showDetailModal.data.days} days)</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Reason</span>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 italic">
                                "{showDetailModal.data.reason}"
                            </div>
                        </div>
                        {userRole === UserRole.ADMIN && showDetailModal.data.status === 'PENDING' && (
                           <div className="flex gap-2 pt-2">
                               <button 
                                 onClick={() => { handleTeamAction(showDetailModal.data.id, 'APPROVED'); setShowDetailModal(null); }}
                                 className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium"
                               >Approve</button>
                               <button 
                                 onClick={() => { handleTeamAction(showDetailModal.data.id, 'REJECTED'); setShowDetailModal(null); }}
                                 className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-lg text-sm font-medium"
                               >Reject</button>
                           </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Modern Leave Form Modal */}
      {showForm && userRole === UserRole.EMPLOYEE && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Request Leave</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the details below</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Leave Type Dropdown */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Leave Type</label>
                <div className="relative">
                  <select 
                    className="w-full p-3.5 pl-4 pr-10 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none appearance-none transition-all font-medium"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="SICK">🤒 Sick Leave</option>
                    <option value="VACATION">✈️ Vacation</option>
                    <option value="PERSONAL">🏠 Personal</option>
                    <option value="MATERNITY">👶 Maternity/Paternity</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Date Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      required
                      className="w-full p-3.5 pl-10 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">End Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full p-3.5 pl-10 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Days</label>
                <div className="relative">
                   <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      required
                      className="w-full p-3.5 pl-10 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      placeholder="e.g. 1"
                  />
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Reason Area */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reason</label>
                  <button 
                    type="button"
                    onClick={handleAiDraft}
                    disabled={loadingAi || !startDate}
                    className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-md flex items-center gap-1.5 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={12} /> 
                    {loadingAi ? 'Generating...' : 'Auto-Draft with AI'}
                  </button>
                </div>
                <div className="relative">
                  <textarea 
                    required
                    rows={3}
                    className="w-full p-3.5 pl-10 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all resize-none font-medium"
                    placeholder="Briefly describe why you need leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <FileText className="absolute left-3.5 top-4 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="py-3.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="py-3.5 rounded-xl font-semibold text-white bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
