import React, { useState, useEffect } from 'react';
import { LeaveRequest, UserRole, AttendanceRecord } from '../types';
import { MOCK_TEAM_LEAVES } from '../constants';
import { Plus, Sparkles, X, Check, XCircle, User as UserIcon, ChevronDown, Clock, FileText, ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { generateLeaveReason } from '../services/geminiService';
import History from './History';

interface LeaveProps {
  userRole?: UserRole;
  history: AttendanceRecord[];
  leaves: LeaveRequest[];
  onAddLeave: (leave: LeaveRequest) => void;
}

const Leave: React.FC<LeaveProps> = ({ userRole = UserRole.EMPLOYEE, history, leaves, onAddLeave }) => {
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
    onAddLeave(newLeave);
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

  const getDayDetails = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Find all attendance records for this day
    const dailyAttendance = history.filter(h => h.date === dateStr);
    
    // Find leaves
    const myLeave = leaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate);
    const teamLeave = userRole === UserRole.ADMIN ? teamLeaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate) : null;
    
    return {
        dateStr,
        attendance: dailyAttendance, // Array of records
        leave: myLeave,
        teamLeave: teamLeave
    };
  };

  // Filter history for the current view month for list display
  const monthlyHistory = history.filter(h => {
      const hDate = new Date(h.date);
      return hDate.getMonth() === currentDate.getMonth() && hDate.getFullYear() === currentDate.getFullYear();
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = startDayOfMonth(currentDate);
    const blanks = Array.from({ length: startDay }, (_, i) => <div key={`blank-${i}`} className="h-14 sm:h-20" />);
    
    const daysArray = Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const details = getDayDetails(day);
      const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
      
      const hasAttendance = details.attendance.length > 0;
      const hasLeave = !!details.leave;
      const hasTeamLeave = !!details.teamLeave;
      
      // Determine what badge to show
      const displayLeave = hasTeamLeave ? details.teamLeave : (hasLeave ? details.leave : null);
      const isTeamLeave = !!hasTeamLeave;

      return (
        <div 
            key={day} 
            onClick={() => setShowDetailModal({ day, ...details })}
            className={`h-14 sm:h-20 border-t border-r border-slate-100 dark:border-slate-700 relative p-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs font-medium ${isToday ? 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-700 dark:text-slate-300'}`}>
              {day}
            </span>
            {hasAttendance && (
                <div className="flex gap-0.5 flex-wrap max-w-[50%] justify-end">
                    {details.attendance.map((att, idx) => (
                         <div key={idx} className={`w-1.5 h-1.5 rounded-full ${att.status === 'LATE' ? 'bg-yellow-500' : 'bg-green-500'}`} title={att.status}></div>
                    ))}
                </div>
            )}
          </div>
          
          {displayLeave && (
            <div className={`mt-1 text-[9px] sm:text-[10px] rounded px-1 py-0.5 truncate font-medium
                ${isTeamLeave ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                  displayLeave.status === 'APPROVED' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300'}
            `}>
              {isTeamLeave ? `User ${displayLeave.userId}` : displayLeave.type}
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
           {userRole === UserRole.ADMIN ? 'Team Calendar & Activity' : 'My Calendar & Activity'}
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

      {/* Monthly Attendance List */}
      <div>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Activity - {currentDate.toLocaleDateString('en-US', { month: 'long' })}</h3>
          {/* Note: In History component we now need leaves passed too, but for simple calendar view we reuse History component. 
              Ideally we should pass leaves to History inside Leave component too, but for now we pass full lists. 
          */}
          <History records={monthlyHistory} leaves={leaves} />
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowDetailModal(null)}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{currentDate.toLocaleString('default', { month: 'long' })} {showDetailModal.day}</div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Day Details</h3>
                    </div>
                    <button onClick={() => setShowDetailModal(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {/* Attendance Info List */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Attendance Records</h4>
                        {showDetailModal.attendance && showDetailModal.attendance.length > 0 ? (
                            <div className="space-y-3">
                                {showDetailModal.attendance.map((record: AttendanceRecord, index: number) => (
                                    <div key={index} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3 mb-3">
                                            {record.photoUrl ? (
                                                <img src={record.photoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-600" alt="Checkin" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center"><UserIcon size={20} /></div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white">Present</div>
                                                <div className={`text-xs font-bold ${record.status === 'LATE' ? 'text-yellow-600' : 'text-green-600'}`}>{record.status}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-600">
                                                <div className="text-xs text-slate-400">Check In</div>
                                                <div className="font-medium dark:text-white">{record.checkInTime}</div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-600">
                                                <div className="text-xs text-slate-400">Check Out</div>
                                                <div className="font-medium dark:text-white">{record.checkOutTime || '--:--'}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin size={12} /> {record.location || 'Office'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-500">No attendance records.</p>
                            </div>
                        )}
                    </div>

                    {/* Leave Info */}
                    {(showDetailModal.leave || showDetailModal.teamLeave) && (
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Leave Request</h4>
                            {/* Determine which leave to show (My Leave or Team Leave) */}
                            {(() => {
                                const leaveData = showDetailModal.teamLeave || showDetailModal.leave;
                                return (
                                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                {showDetailModal.teamLeave ? `User: ${leaveData.userId}` : 'My Request'}
                                            </span>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${leaveData.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {leaveData.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm dark:text-gray-300"><span className="font-medium">Type:</span> {leaveData.type}</div>
                                            <div className="text-sm dark:text-gray-300"><span className="font-medium">Reason:</span> {leaveData.reason}</div>
                                        </div>
                                        {userRole === UserRole.ADMIN && leaveData.status === 'PENDING' && showDetailModal.teamLeave && (
                                            <div className="flex gap-2 pt-3">
                                                <button 
                                                    onClick={() => { handleTeamAction(leaveData.id, 'APPROVED'); setShowDetailModal(null); }}
                                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold"
                                                >Approve</button>
                                                <button 
                                                    onClick={() => { handleTeamAction(leaveData.id, 'REJECTED'); setShowDetailModal(null); }}
                                                    className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-lg text-xs font-bold"
                                                >Reject</button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
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