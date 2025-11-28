import React from 'react';
import { AttendanceRecord } from '../types';
import { Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HistoryProps {
  records: AttendanceRecord[];
}

const History: React.FC<HistoryProps> = ({ records }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-50';
      case 'LATE': return 'text-yellow-600 bg-yellow-50';
      case 'ABSENT': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance History</h2>
      
      {records.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Clock size={48} className="mx-auto mb-2 opacity-20" />
          <p>No records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getStatusColor(record.status)}`}>
                  {record.status === 'LATE' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{record.date}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={12} /> {record.location || 'Unknown'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-800 text-sm">{record.checkInTime}</div>
                <div className="text-xs text-gray-400">{record.checkOutTime || '--:--'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
