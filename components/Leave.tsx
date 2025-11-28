import React, { useState, useEffect } from 'react';
import { LeaveRequest, UserRole } from '../types';
import { MOCK_LEAVES, MOCK_TEAM_LEAVES } from '../constants';
import { Calendar, Plus, Sparkles, X, Check, XCircle, User as UserIcon } from 'lucide-react';
import { generateLeaveReason } from '../services/geminiService';

interface LeaveProps {
  userRole?: UserRole;
}

const Leave: React.FC<LeaveProps> = ({ userRole = UserRole.EMPLOYEE }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(MOCK_LEAVES);
  const [teamLeaves, setTeamLeaves] = useState<LeaveRequest[]>(MOCK_TEAM_LEAVES);
  const [showForm, setShowForm] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  
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

  return (
    <div className="p-4 space-y-6 pb-24 relative min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {userRole === UserRole.ADMIN ? 'Team Leave Management' : 'Leave Management'}
        </h2>
        {userRole === UserRole.EMPLOYEE && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-200 active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {userRole === UserRole.EMPLOYEE ? (
        <>
          {/* Employee View: Balances & My Requests */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            <div className="min-w-[140px] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-gray-500 text-xs mb-1">Casual Leave</div>
              <div className="text-xl font-bold text-blue-600">8 / 12</div>
            </div>
            <div className="min-w-[140px] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-gray-500 text-xs mb-1">Sick Leave</div>
              <div className="text-xl font-bold text-orange-500">5 / 7</div>
            </div>
            <div className="min-w-[140px] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-gray-500 text-xs mb-1">Privilege</div>
              <div className="text-xl font-bold text-purple-600">10 / 15</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3">My Recent Requests</h3>
            <div className="space-y-3">
              {leaves.map(leave => (
                <div key={leave.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        leave.type === 'SICK' ? 'bg-red-100 text-red-700' :
                        leave.type === 'VACATION' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {leave.type}
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      leave.status === 'APPROVED' ? 'border-green-200 text-green-600 bg-green-50' :
                      leave.status === 'REJECTED' ? 'border-red-200 text-red-600 bg-red-50' :
                      'border-yellow-200 text-yellow-600 bg-yellow-50'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 mb-1 flex items-center justify-between">
                    <span>{leave.startDate} {leave.endDate !== leave.startDate && ` - ${leave.endDate}`}</span>
                    {leave.days && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{leave.days} days</span>}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{leave.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Admin View: Team Requests */
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
             <UserIcon className="text-blue-600 mt-1" size={20} />
             <div>
               <h4 className="font-bold text-blue-800 text-sm">Manager Actions</h4>
               <p className="text-blue-600 text-xs">Review and approve pending leave requests from your team.</p>
             </div>
          </div>

          {teamLeaves.map(leave => (
            <div key={leave.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {leave.userId.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">User {leave.userId}</div>
                      <div className="text-xs text-gray-500">{leave.type}</div>
                    </div>
                 </div>
                 {leave.status === 'PENDING' ? (
                   <span className="text-xs font-medium bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-200">Pending</span>
                 ) : (
                   <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      leave.status === 'APPROVED' ? 'border-green-200 text-green-600 bg-green-50' : 'border-red-200 text-red-600 bg-red-50'
                   }`}>{leave.status}</span>
                 )}
               </div>
               
               <div className="my-2 p-2 bg-gray-50 rounded-lg">
                 <div className="flex justify-between mb-1">
                   <div className="text-xs font-semibold text-gray-500">Duration</div>
                   {leave.days && <div className="text-xs font-bold text-blue-600">{leave.days} days</div>}
                 </div>
                 <div className="text-sm text-gray-800">{leave.startDate} to {leave.endDate}</div>
                 <div className="text-xs font-semibold text-gray-500 mt-1">Reason</div>
                 <div className="text-sm text-gray-800 italic">"{leave.reason}"</div>
               </div>

               {leave.status === 'PENDING' && (
                 <div className="flex gap-2 mt-3">
                   <button 
                     onClick={() => handleTeamAction(leave.id, 'APPROVED')}
                     className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 active:scale-95 transition-transform"
                   >
                     <Check size={16} /> Approve
                   </button>
                   <button 
                     onClick={() => handleTeamAction(leave.id, 'REJECTED')}
                     className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 active:scale-95 transition-transform"
                   >
                     <XCircle size={16} /> Reject
                   </button>
                 </div>
               )}
            </div>
          ))}

          {teamLeaves.length === 0 && (
            <div className="text-center py-10 text-gray-400">
               <p>No pending requests.</p>
            </div>
          )}
        </div>
      )}

      {/* New Leave Modal - Only for Employees */}
      {showForm && userRole === UserRole.EMPLOYEE && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-full sm:w-[400px] rounded-t-2xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">New Leave Request</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select 
                  className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="SICK">Sick Leave</option>
                  <option value="VACATION">Vacation</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="MATERNITY">Maternity/Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                  <input 
                    type="date" 
                    className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="e.g. 1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <button 
                    type="button"
                    onClick={handleAiDraft}
                    disabled={loadingAi || !startDate}
                    className="text-xs text-purple-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    <Sparkles size={12} /> {loadingAi ? 'Drafting...' : 'AI Draft'}
                  </button>
                </div>
                <textarea 
                  required
                  rows={3}
                  className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
