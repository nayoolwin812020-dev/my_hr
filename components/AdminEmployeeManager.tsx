import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Search, MoreVertical, Mail, Phone, Briefcase, DollarSign, X, Check, User as UserIcon } from 'lucide-react';

interface AdminEmployeeManagerProps {
  employees: User[];
  onAddEmployee: (user: User) => void;
}

const AdminEmployeeManager: React.FC<AdminEmployeeManagerProps> = ({ employees, onAddEmployee }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [newSalary, setNewSalary] = useState('');
  const [newJoinDate, setNewJoinDate] = useState('');

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyRate = parseInt(newSalary) || 0;
    const hourlyRate = Math.round(monthlyRate / 160); // Approx
    const dailyRate = Math.round(monthlyRate / 30); // Approx

    const newUser: User = {
        id: `EMP-${Math.floor(Math.random() * 10000)}`,
        name: newName,
        role: newRole,
        avatar: `https://ui-avatars.com/api/?name=${newName.replace(' ', '+')}&background=random`,
        department: newDept,
        hourlyRate,
        dailyRate,
        monthlyRate,
        walletBalance: 0,
        points: 0,
        lateDeductionAmount: 5000,
        overtimeRatePerHour: 5000,
        monthlyBonus: 0,
        joinDate: newJoinDate || new Date().toISOString().split('T')[0],
        companyName: 'TechNova Myanmar'
    };

    onAddEmployee(newUser);
    setShowModal(false);
    // Reset
    setNewName('');
    setNewSalary('');
    setNewJoinDate('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="relative flex-1 mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search employees..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg outline-none text-sm dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
          >
              <Plus size={20} />
          </button>
      </div>

      <div className="space-y-3">
          {filteredEmployees.map(emp => (
              <div key={emp.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-600" />
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</h4>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <span>{emp.department}</span>
                              <span>•</span>
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 rounded">{emp.role}</span>
                          </div>
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{(emp.monthlyRate || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">MMK</span></div>
                      <div className="text-[10px] text-slate-400">Monthly Salary</div>
                  </div>
              </div>
          ))}
      </div>

      {/* Add Employee Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Employee</h3>
                      <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
                          <input 
                            type="text" 
                            required 
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Department</label>
                              <select 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                value={newDept}
                                onChange={e => setNewDept(e.target.value)}
                              >
                                  <option>Engineering</option>
                                  <option>Marketing</option>
                                  <option>Sales</option>
                                  <option>HR</option>
                                  <option>Design</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Role</label>
                              <select 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                value={newRole}
                                onChange={e => setNewRole(e.target.value as UserRole)}
                              >
                                  <option value={UserRole.EMPLOYEE}>Employee</option>
                                  <option value={UserRole.ADMIN}>Admin</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Monthly Salary (MMK)</label>
                          <input 
                            type="number" 
                            required 
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            value={newSalary}
                            onChange={e => setNewSalary(e.target.value)}
                            placeholder="e.g. 800000"
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Join Date</label>
                          <input 
                            type="date" 
                            required 
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            value={newJoinDate}
                            onChange={e => setNewJoinDate(e.target.value)}
                          />
                      </div>

                      <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold mt-2 shadow-lg transition-transform active:scale-95">
                          Create Account
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminEmployeeManager;