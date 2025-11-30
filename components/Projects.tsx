import React, { useState, useEffect } from 'react';
import { Project, Task, Comment } from '../types';
import { MOCK_EMPLOYEES, CURRENT_USER } from '../constants';
import { api } from '../services/api';
import { Briefcase, CheckCircle2, Circle, MoreVertical, Plus, X, Calendar as CalendarIcon, User as UserIcon, Trash2, AlignLeft, Flag, ArrowUpDown, MessageSquare, Send, Users, Info, ChevronDown, Edit, ListTodo, Search, AlertCircle, Tag } from 'lucide-react';
import MultiSelectUser from './MultiSelectUser';

interface ProjectsProps {
  initialProjectId?: string | null;
  onProjectOpened?: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ initialProjectId, onProjectOpened }) => {
  // Load projects from API
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
        const data = await api.projects.getAll();
        setProjects(data);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  // Project View Modal State
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // Handle external navigation (from MyTasks)
  useEffect(() => {
    if (initialProjectId) {
        const target = projects.find(p => p.id === initialProjectId);
        if (target) {
            setViewingProject(target);
            if (onProjectOpened) {
                onProjectOpened();
            }
        }
    }
  }, [initialProjectId, projects, onProjectOpened]);

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ALL');
  const [projectSearch, setProjectSearch] = useState('');
  const [sortByPriority, setSortByPriority] = useState(false);
  
  const [projectDetailTab, setProjectDetailTab] = useState<'TASKS' | 'INFO' | 'MEMBERS'>('TASKS');

  // Task Filter State
  const [taskFilterStatus, setTaskFilterStatus] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [taskFilterAssignee, setTaskFilterAssignee] = useState<string>('ALL');

  // Dropdown State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectDepartment, setNewProjectDepartment] = useState('Engineering');
  const [newProjectAssignee, setNewProjectAssignee] = useState(MOCK_EMPLOYEES[0].id);
  const [newProjectTeam, setNewProjectTeam] = useState<string[]>([MOCK_EMPLOYEES[0].id]); // Default includes Lead
  const [newProjectDeadline, setNewProjectDeadline] = useState('');
  const [newProjectTags, setNewProjectTags] = useState('');

  // Create Task Modal State
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([]);

  // Helper to get user details
  const getUserDetails = (userId: string) => {
    if (userId === CURRENT_USER.id) return CURRENT_USER;
    const emp = MOCK_EMPLOYEES.find(e => e.id === userId);
    return emp || { name: 'Unknown', avatar: '', id: userId, role: 'EMPLOYEE', department: '' } as any;
  };

  const isOverdue = (dateString: string) => {
      if (!dateString) return false;
      const date = new Date(dateString);
      const today = new Date();
      // Reset time for comparison to just date
      today.setHours(0, 0, 0, 0);
      return date < today;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProjectData = {
        title: newProjectTitle,
        description: newProjectDescription,
        department: newProjectDepartment,
        assignedTo: newProjectAssignee,
        authorId: CURRENT_USER.id,
        team: newProjectTeam.length > 0 ? newProjectTeam : [newProjectAssignee],
        deadline: newProjectDeadline,
        tags: newProjectTags.split(',').map(t => t.trim()).filter(Boolean)
    };
    
    try {
        await api.projects.create(newProjectData);
        await loadProjects();
        // Reset and Close
        setNewProjectTitle('');
        setNewProjectDescription('');
        setNewProjectDepartment('Engineering');
        setNewProjectAssignee(MOCK_EMPLOYEES[0].id);
        setNewProjectTeam([MOCK_EMPLOYEES[0].id]);
        setNewProjectDeadline('');
        setNewProjectTags('');
        setShowCreateModal(false);
    } catch(err) {
        alert("Failed to create project");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return;

    const newTaskData = {
        projectId: activeProjectId,
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
        assigneeIds: newTaskAssignees
    };

    try {
        await api.projects.createTask(newTaskData);
        await loadProjects();
        setActiveProjectId(null);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
        setNewTaskPriority('MEDIUM');
        setNewTaskAssignees([]);
    } catch (err) {
        alert("Failed to create task");
    }
  };

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
        case 'Engineering': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'Marketing': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
        case 'Sales': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'Design': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
        case 'HIGH': return 'text-red-500 fill-red-500';
        case 'MEDIUM': return 'text-orange-400 fill-orange-400';
        case 'LOW': return 'text-blue-400 fill-blue-400';
        default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
          case 'ON_HOLD': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
          case 'COMPLETED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
          default: return 'bg-slate-100 text-slate-800';
      }
  };

  const filteredProjects = projects.filter(p => {
      const matchesStatus = filter === 'ALL' || p.status === filter;
      const searchLower = projectSearch.toLowerCase();
      const matchesSearch = p.title.toLowerCase().includes(searchLower) || 
                            (p.description || '').toLowerCase().includes(searchLower) ||
                            (p.tags && p.tags.some(t => t.toLowerCase().includes(searchLower)));
      return matchesStatus && matchesSearch;
  });

  if (isLoading) return <div className="p-10 text-center">Loading Projects...</div>;

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-900 pb-2 pt-1 transition-colors">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="text-blue-600" /> Projects & Tasks
                </h2>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-transform flex items-center gap-2 text-sm font-bold"
                >
                    <Plus size={18} /> <span className="hidden sm:inline">New Project</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search projects, tags..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm placeholder:text-slate-400"
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <div className="flex-1 flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl min-w-max">
                        {['ALL', 'ACTIVE', 'ON_HOLD', 'COMPLETED'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    filter === f 
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-700 dark:text-blue-400 ring-1 ring-black/5 dark:ring-white/10' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Briefcase size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium">No projects found matching your criteria.</p>
            </div>
        ) : (
            filteredProjects.map((project) => {
                const assignee = getUserDetails(project.assignedTo);
                const projectIsOverdue = project.status !== 'COMPLETED' && isOverdue(project.deadline);
                
                const tasksToShow = sortByPriority 
                    ? [...project.tasks].sort((a, b) => {
                        const priorityMap = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                        return priorityMap[b.priority] - priorityMap[a.priority];
                      })
                    : project.tasks;

                return (
                    <div 
                        key={project.id} 
                        onClick={() => {
                            setViewingProject(project);
                            setProjectDetailTab('TASKS');
                            setTaskFilterStatus('ALL');
                            setTaskFilterAssignee('ALL');
                        }}
                        className={`${projectIsOverdue ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-slate-800'} rounded-2xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-lg transition-all group ${projectIsOverdue ? 'border-red-200 dark:border-red-900/50' : 'border-slate-100 dark:border-slate-700'} flex flex-col`}
                    >
                        {/* Project Card Content */}
                        <div className="p-5 border-b border-slate-50 dark:border-slate-700 flex-1">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getDepartmentColor(project.department)}`}>
                                            {project.department}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                        {projectIsOverdue && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle size={10} /> Overdue
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-1">{project.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{project.description}</p>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex items-end justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 pl-1 pr-3 py-1 rounded-full border border-slate-100 dark:border-slate-600">
                                        <img src={assignee.avatar} className="w-6 h-6 rounded-full object-cover" alt={assignee.name} />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Assigned To</span>
                                            <span className="text-[10px] font-bold text-slate-900 dark:text-white leading-none">{assignee.name}</span>
                                        </div>
                                   </div>
                                </div>
                                <div className="flex flex-col items-end w-28">
                                    <div className="flex justify-between text-[10px] mb-1 w-full">
                                        <span className="font-medium text-slate-500">Progress</span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">{project.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 rounded-full ${projectIsOverdue ? 'bg-red-500' : 'bg-blue-600'}`}
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tasks List Preview */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/30 space-y-3">
                            {tasksToShow.slice(0, 3).map((task) => {
                                const taskIsOverdue = task.status !== 'DONE' && isOverdue(task.dueDate);
                                return (
                                    <div 
                                        key={task.id} 
                                        className={`flex items-center gap-3 p-2 ${taskIsOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800'} hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-lg cursor-pointer transition-colors shadow-sm border group ${taskIsOverdue ? 'border-red-200 dark:border-red-900/50' : 'border-slate-100 dark:border-slate-700/50'}`}
                                    >
                                        <div className="text-slate-400 dark:text-slate-500 transition-colors p-1 -m-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                            {task.status === 'DONE' ? <CheckCircle2 size={18} className="text-green-600" /> : <Circle size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium transition-all truncate ${
                                                task.status === 'DONE' 
                                                ? 'text-slate-400 dark:text-slate-500 line-through' 
                                                : 'text-slate-800 dark:text-slate-200'
                                            }`}>
                                                {task.title}
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                            <span className={`flex items-center gap-1 ${taskIsOverdue ? 'text-red-600 font-semibold' : ''}`}><CalendarIcon size={10} /> {task.dueDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveProjectId(project.id); setNewTaskDueDate(new Date().toISOString().split('T')[0]); }}
                                className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/50 rounded-xl border border-dashed border-blue-200 dark:border-blue-900/30 transition-all active:scale-95"
                            >
                                <Plus size={14} /> Add Task
                            </button>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Project</h3>
                      <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleCreateProject} className="space-y-4">
                      {/* ... (Form Fields) ... */}
                      <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Project Title</label>
                          <input 
                              type="text" 
                              required
                              className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-slate-900 font-medium"
                              placeholder="e.g. Q4 Marketing Campaign"
                              value={newProjectTitle}
                              onChange={(e) => setNewProjectTitle(e.target.value)}
                              autoFocus
                          />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                              <div className="relative">
                                <select 
                                    className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-slate-900 font-medium appearance-none"
                                    value={newProjectDepartment}
                                    onChange={(e) => setNewProjectDepartment(e.target.value)}
                                >
                                    <option value="Engineering">Engineering</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Design">Design</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Project Lead</label>
                              <div className="relative">
                                <select 
                                    className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-slate-900 font-medium appearance-none"
                                    value={newProjectAssignee}
                                    onChange={(e) => setNewProjectAssignee(e.target.value)}
                                >
                                    {MOCK_EMPLOYEES.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Deadline</label>
                          <div className="relative">
                            <input 
                                type="date" 
                                required
                                className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-slate-900 font-medium"
                                value={newProjectDeadline}
                                onChange={(e) => setNewProjectDeadline(e.target.value)}
                            />
                             <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                          </div>
                      </div>

                      <MultiSelectUser 
                          label="Team Members"
                          options={MOCK_EMPLOYEES}
                          selectedIds={newProjectTeam}
                          onChange={setNewProjectTeam}
                          placeholder="Select team..."
                      />
                      
                      <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                          <textarea 
                              className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors resize-none dark:text-white text-slate-900"
                              rows={3}
                              placeholder="Project goals and details..."
                              value={newProjectDescription}
                              onChange={(e) => setNewProjectDescription(e.target.value)}
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tags (comma separated)</label>
                          <input 
                              type="text" 
                              className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-slate-900 font-medium"
                              value={newProjectTags}
                              onChange={(e) => setNewProjectTags(e.target.value)}
                              placeholder="e.g. Frontend, Q4, Priority"
                          />
                      </div>
                      
                      <button 
                        type="submit" 
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all mt-2 active:scale-95 flex items-center justify-center gap-2"
                      >
                          <Plus size={18} /> Create Project
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* Create Task Modal */}
      {activeProjectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Task</h3>
                    <button onClick={() => setActiveProjectId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Task Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-slate-900 font-medium"
                            placeholder="e.g. Draft content"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                        <textarea 
                            className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors resize-none dark:text-white text-slate-900"
                            rows={3}
                            placeholder="Add details (optional)"
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white text-slate-900 text-sm font-medium"
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                                >
                                    <option value="HIGH">High Priority</option>
                                    <option value="MEDIUM">Medium Priority</option>
                                    <option value="LOW">Low Priority</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    required
                                    className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-slate-900 text-sm font-medium"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <MultiSelectUser 
                        label="Assign To" 
                        options={MOCK_EMPLOYEES} 
                        selectedIds={newTaskAssignees} 
                        onChange={setNewTaskAssignees}
                        placeholder="Select assignees..."
                    />
                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all mt-2 active:scale-95">Add Task</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Projects;