import React from 'react';
import { AttendanceRecord } from '../types';
import { Clock, MapPin, AlertCircle, CheckCircle2, User } from 'lucide-react';

interface HistoryProps {
  records: AttendanceRecord[];
}

const History: React.FC<HistoryProps> = ({ records }) => {
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'LATE': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
      case 'ABSENT': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Attendance History</h2>
      
      {records.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <Clock size={48} className="mx-auto mb-2 opacity-20" />
          <p>No records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors">
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
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-white dark:border-slate-600 shadow-sm">
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
                  <div className="font-bold text-gray-800 dark:text-white">{record.date}</div>
                  <div className="flex flex-col gap-1 mt-0.5">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> {record.location || 'Unknown Location'}
                    </div>
                    <div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyles(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Times */}
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">In</span>
                  <span className="font-bold text-gray-800 dark:text-white text-sm">{record.checkInTime}</span>
                </div>
                {record.checkOutTime && (
                  <div className="flex flex-col items-end mt-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Out</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300 text-xs">{record.checkOutTime}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;