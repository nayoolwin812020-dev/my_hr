import React, { useState } from 'react';
import { AttendanceRecord, LeaveRequest } from '../types';
import { Clock, MapPin, AlertCircle, CheckCircle2, User, CalendarRange, Filter, ArrowDown, ArrowUp, CalendarDays, FileText } from 'lucide-react';

interface HistoryProps {
  records: AttendanceRecord[];
  leaves: LeaveRequest[];
}

const History: React.FC<HistoryProps> = ({ records, leaves = [] }) => {
  const [filter, setFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVES'>('ALL');

  // Merge and sort all activities
  const allActivities = [
      ...records.map(r => ({ type: 'ATTENDANCE', date: r.date, data: r } as const)),
      ...leaves.map(l => ({ type: 'LEAVE', date: l.startDate, data: l } as const))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredActivities = allActivities.filter(item => {
      if (filter === 'ALL') return true;
      if (filter === 'LEAVES') return item.type === 'LEAVE';
      if (item.type === 'ATTENDANCE') {
          return item.data.status === filter;
      }
      return false;
  });

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'LATE': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
      case 'ABSENT': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      case 'APPROVED': return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'PENDING': return 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
      case 'REJECTED': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      default: return 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const calculateDuration = (inTime: string, outTime?: string) => {
    if (!outTime) return null;
    try {
        const parseTime = (t: string) => {
            const [time, modifier] = t.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
            return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
        };
        const start = parseTime(inTime);
        const end = parseTime(outTime);
        const diff = end - start;
        if (diff < 0) return null; // Handle overnight or errors simply
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return `${h}h ${m}m`;
    } catch (e) {
        return null;
    }
  };

  const stats = {
      total: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      late: records.filter(r => r.status === 'LATE').length,
      absent: records.filter(r => r.status === 'ABSENT').length
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
              <div className="text-xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Records</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30 text-center shadow-sm">
              <div className="text-xl font-bold text-green-700 dark:text-green-400">{stats.present}</div>
              <div className="text-[10px] text-green-600 dark:text-green-500 uppercase font-bold">On Time</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/30 text-center shadow-sm">
              <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{stats.late}</div>
              <div className="text-[10px] text-yellow-600 dark:text-yellow-500 uppercase font-bold">Late</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 text-center shadow-sm">
              <div className="text-xl font-bold text-red-700 dark:text-red-400">{stats.absent}</div>
              <div className="text-[10px] text-red-600 dark:text-red-500 uppercase font-bold">Absent</div>
          </div>
      </div>

      <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarRange className="text-blue-600" size={20} /> Activity Log
          </h2>
          {/* Simple Filter */}
          <div className="flex overflow-x-auto no-scrollbar bg-slate-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
              {['ALL', 'PRESENT', 'LATE', 'ABSENT', 'LEAVES'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`flex-1 min-w-[60px] px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${filter === f ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                      {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
              ))}
          </div>
      </div>
      
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Clock size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">No activity found</p>
          <p className="text-xs mt-1 opacity-70">Try changing the filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((item, index) => {
             // ----------------- ATTENDANCE ITEM -----------------
             if (item.type === 'ATTENDANCE') {
                const record = item.data;
                const duration = calculateDuration(record.checkInTime, record.checkOutTime);
                return (
                    <div key={`att-${record.id}-${index}`} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        {/* Avatar / Photo Section */}
                        <div className="relative">
                        {record.photoUrl ? (
                            <img 
                            src={record.photoUrl} 
                            alt="Record Snap" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-white dark:border-slate-600 shadow-sm">
                            <User size={24} />
                            </div>
                        )}
                        
                        {/* Status Indicator Icon Overlay */}
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-[2px]">
                            {record.status === 'LATE' ? (
                            <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 rounded-full p-0.5">
                                <AlertCircle size={12} strokeWidth={3} />
                            </div>
                            ) : record.status === 'ABSENT' ? (
                                <div className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full p-0.5">
                                <AlertCircle size={12} strokeWidth={3} />
                            </div>
                            ) : (
                            <div className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full p-0.5">
                                <CheckCircle2 size={12} strokeWidth={3} />
                            </div>
                            )}
                        </div>
                        </div>

                        {/* Record Details */}
                        <div>
                        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {record.date}
                            {duration && <span className="text-[10px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Clock size={10} /> {duration}</span>}
                        </div>
                        <div className="flex flex-col gap-1 mt-0.5">
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin size={10} /> {record.location || 'Unknown Location'}
                            </div>
                            <div className="flex gap-2">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyles(record.status)}`}>
                                    {record.status}
                                </span>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Times */}
                    <div className="text-right flex flex-col gap-1 min-w-[60px]">
                        <div className="flex items-center justify-end gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-white text-sm">{record.checkInTime}</span>
                            <div className="p-1 bg-green-50 dark:bg-green-900/30 rounded text-green-600 dark:text-green-400">
                                <ArrowDown size={10} strokeWidth={3} />
                            </div>
                        </div>
                        {record.checkOutTime ? (
                            <div className="flex items-center justify-end gap-1.5">
                                <span className="font-medium text-slate-600 dark:text-slate-300 text-xs">{record.checkOutTime}</span>
                                <div className="p-1 bg-red-50 dark:bg-red-900/30 rounded text-red-600 dark:text-red-400">
                                    <ArrowUp size={10} strokeWidth={3} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-end gap-1.5 opacity-50">
                                <span className="font-medium text-slate-400 text-xs">--:-- --</span>
                                <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-400">
                                    <ArrowUp size={10} strokeWidth={3} />
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                );
             } 
             
             // ----------------- LEAVE ITEM -----------------
             else {
                 const leave = item.data;
                 return (
                    <div key={`leave-${leave.id}-${index}`} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all hover:shadow-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 dark:bg-blue-600"></div>
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                <FileText size={20} />
                             </div>
                             <div>
                                <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    {leave.startDate}
                                    {leave.startDate !== leave.endDate && (
                                        <span className="text-slate-400 text-xs font-normal">to {leave.endDate}</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 mt-0.5">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <CalendarDays size={10} /> {leave.type} Request • {leave.days} day(s)
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyles(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                </div>
                             </div>
                        </div>
                        <div className="text-right">
                             <div className="text-[10px] text-slate-400 mb-1 uppercase font-bold tracking-wider">Leave</div>
                        </div>
                    </div>
                 );
             }
          })}
        </div>
      )}
    </div>
  );
};

export default History;