import React, { useState, useEffect } from 'react';
import { Project, Task, Comment } from '../types';
import { MOCK_PROJECTS, MOCK_EMPLOYEES, CURRENT_USER } from '../constants';
import { CheckSquare, Search, CheckCircle2, Circle, Calendar, Flag, MessageSquare, Briefcase, X, AlignLeft, Send, User as UserIcon, ArrowRight, ChevronRight, Layers, AlertCircle, Filter, ArrowUpDown } from 'lucide-react';
import MultiSelectUser from './MultiSelectUser';

interface MyTasksProps {
  onNavigateToProject?: (projectId: string) => void;
}

const MyTasks: React.FC<MyTasksProps> = ({ onNavigateToProject }) => {
  // Load projects from local storage to stay in sync
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem('projects_data');
      if (savedProjects) {
        const parsed: Project[] = JSON.parse(savedProjects);
        return parsed.map(p => ({
            ...p,
            status: p.status || 'ACTIVE',
            tasks: p.tasks.map(t => ({
                ...t, 
                // Migration logic for old data
                assigneeIds: t.assigneeIds || ((t as any).assigneeId ? [(t as any).assigneeId] : [])
            }))
        }));
      }
      return MOCK_PROJECTS;
    } catch (error) {
      return MOCK_PROJECTS;
    }
  });

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TODO' | 'DONE'>('ALL');
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);
  
  // Task Editing State
  const [editingTask, setEditingTask] = useState<{ projectId: string, task: Task, project: Project } | null>(null);
  const [taskModalTab, setTaskModalTab] = useState<'DETAILS' | 'COMMENTS'>('DETAILS');
  const [editTaskForm, setEditTaskForm] = useState({
      title: '',
      description: '',
      dueDate: '',
      status: 'TODO' as 'TODO' | 'IN_PROGRESS' | 'DONE',
      priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
      assigneeIds: [] as string[]
  });
  const [newComment, setNewComment] = useState('');

  // Persist changes
  useEffect(() => {
    localStorage.setItem('projects_data', JSON.stringify(projects));
  }, [projects]);

  const getUserDetails = (userId: string) => {
    if (userId === CURRENT_USER.id) return CURRENT_USER;
    const emp = MOCK_EMPLOYEES.find(e => e.id === userId);
    return emp || { name: 'Unknown', avatar: '', id: userId };
  };

  const toggleTaskStatus = (projectId: string, taskId: string) => {
    const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
            const updatedTasks = p.tasks.map(t => {
                if (t.id === taskId) {
                    const newStatus = t.status === 'DONE' ? 'TODO' : 'DONE';
                    return { ...t, status: newStatus } as Task;
                }
                return t;
            });
            // Update progress
            const completedCount = updatedTasks.filter(t => t.status === 'DONE').length;
            const newProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
            return { ...p, tasks: updatedTasks, progress: newProgress };
        }
        return p;
    });
    setProjects(updatedProjects);
    
    // Update modal if open
    if (editingTask && editingTask.task.id === taskId) {
        setEditingTask(prev => prev ? { 
            ...prev, 
            task: { ...prev.task, status: prev.task.status === 'DONE' ? 'TODO' : 'DONE' } 
        } : null);
        setEditTaskForm(prev => ({ ...prev, status: prev.status === 'DONE' ? 'TODO' : 'DONE' }));
    }
  };

  const isOverdue = (dateString: string) => {
      if (!dateString) return false;
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
  };

  // Flatten tasks for display - FILTERING BY ASSIGNEE_IDS
  const myTasks = projects.flatMap(project => 
    project.tasks
      .filter(task => task.assigneeIds && task.assigneeIds.includes(CURRENT_USER.id))
      .map(task => ({
        ...task,
        projectId: project.id,
        projectName: project.title,
        projectDepartment: project.department
      }))
  );

  const filteredTasks = myTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          task.projectName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' 
        ? true 
        : filterStatus === 'DONE' 
            ? task.status === 'DONE' 
            : task.status !== 'DONE';

    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
    
    const isTaskOverdue = isOverdue(task.dueDate) && task.status !== 'DONE';
    const matchesOverdue = showOverdueOnly ? isTaskOverdue : true;

    return matchesSearch && matchesStatus && matchesPriority && matchesOverdue;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
      if (!sortByPriority) return 0;
      const priorityMap = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
  });

  const upcomingTasks = sortedTasks.filter(t => t.status !== 'DONE');
  const completedTasks = sortedTasks.filter(t => t.status === 'DONE');

  const openEditTask = (taskItem: typeof myTasks[0]) => {
      const project = projects.find(p => p.id === taskItem.projectId);
      const freshTask = project?.tasks.find(t => t.id === taskItem.id);
      
      if (freshTask && project) {
          setEditingTask({ 
              projectId: project.id, 
              task: freshTask, 
              project: project
          });
          setEditTaskForm({
              title: freshTask.title,
              description: freshTask.description || '',
              dueDate: freshTask.dueDate,
              status: freshTask.status,
              priority: freshTask.priority,
              assigneeIds: freshTask.assigneeIds || []
          });
          setNewComment('');
          setTaskModalTab('DETAILS');
      }
  };

  const handleSaveTaskChanges = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTask) return;

      const updatedProjects = projects.map(p => {
          if (p.id === editingTask.projectId) {
              const updatedTasks = p.tasks.map(t => {
                  if (t.id === editingTask.task.id) {
                      return {
                          ...t,
                          title: editTaskForm.title,
                          description: editTaskForm.description,
                          dueDate: editTaskForm.dueDate,
                          status: editTaskForm.status,
                          priority: editTaskForm.priority,
                          assigneeIds: editTaskForm.assigneeIds
                      };
                  }
                  return t;
              });
              const completedCount = updatedTasks.filter(t => t.status === 'DONE').length;
              const newProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
              return { ...p, tasks: updatedTasks, progress: newProgress };
          }
          return p;
      });

      setProjects(updatedProjects);
      setEditingTask(null);
  };

  const handleAddComment = () => {
      if (!editingTask || !newComment.trim()) return;

      const comment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        userId: CURRENT_USER.id,
        text: newComment,
        createdAt: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' })
      };

      const updatedProjects = projects.map(p => {
          if (p.id === editingTask.projectId) {
              const updatedTasks = p.tasks.map(t => {
                  if (t.id === editingTask.task.id) {
                      return {
                          ...t,
                          comments: [...(t.comments || []), comment]
                      };
                  }
                  return t;
              });
              return { ...p, tasks: updatedTasks };
          }
          return p;
      });

      setProjects(updatedProjects);
      
      setEditingTask(prev => prev ? {
          ...prev,
          task: {
              ...prev.task,
              comments: [...(prev.task.comments || []), comment]
          }
      } : null);
      
      setNewComment('');
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
        case 'HIGH': return 'text-red-500 fill-red-500';
        case 'MEDIUM': return 'text-orange-400 fill-orange-400';
        case 'LOW': return 'text-blue-400 fill-blue-400';
        default: return 'text-slate-400';
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 relative min-h-screen">
      <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="text-blue-600" /> My Tasks
            </h2>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {upcomingTasks.length} Pending
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                  <div className="relative flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                        type="text" 
                        placeholder="Search my tasks..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm placeholder:text-slate-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
                  <button 
                    onClick={() => setSortByPriority(!sortByPriority)}
                    className={`p-2.5 rounded-xl border transition-colors ${sortByPriority ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                    title="Sort by Priority"
                  >
                      <ArrowUpDown size={18} />
                  </button>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                  >
                      <Filter size={18} />
                  </button>
              </div>

              {showFilters && (
                  <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl animate-in slide-in-from-top-2">
                      <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Priority Filter</label>
                          <div className="flex gap-2">
                              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                                  <button
                                    key={p}
                                    onClick={() => setFilterPriority(p as any)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                                        filterPriority === p 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                                    }`}
                                  >
                                      {p}
                                  </button>
                              ))}
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Show Overdue Only</label>
                          <button
                            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${showOverdueOnly ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showOverdueOnly ? 'left-7' : 'left-1'}`} />
                          </button>
                      </div>
                  </div>
              )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
             <button 
                onClick={() => setFilterStatus('ALL')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                    filterStatus === 'ALL' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
             >
                All Tasks
             </button>
             <button 
                onClick={() => setFilterStatus('TODO')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                    filterStatus === 'TODO' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
             >
                To Do
             </button>
             <button 
                onClick={() => setFilterStatus('DONE')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                    filterStatus === 'DONE' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
             >
                Completed
             </button>
          </div>
      </div>

      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <CheckSquare size={48} className="mx-auto mb-2 opacity-20" />
                <p>No tasks found.</p>
                {search || showOverdueOnly || filterPriority !== 'ALL' ? (
                    <button onClick={() => { setSearch(''); setShowOverdueOnly(false); setFilterPriority('ALL'); }} className="text-blue-600 font-medium text-sm mt-2 hover:underline">Clear Filters</button>
                ) : (
                    <p className="text-xs mt-1">You're all caught up!</p>
                )}
            </div>
        ) : (
            <>
                {/* To Do Section */}
                {upcomingTasks.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">To Do</h3>
                        {upcomingTasks.map(task => {
                            const overdue = isOverdue(task.dueDate);
                            return (
                                <div 
                                    key={task.id}
                                    onClick={() => openEditTask(task)}
                                    className={`bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm flex gap-3 cursor-pointer transition-all hover:shadow-md ${overdue ? 'border-red-200 dark:border-red-900/50 bg-red-50/30' : 'border-slate-100 dark:border-slate-700'}`}
                                >
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.projectId, task.id); }}
                                        className="text-slate-400 hover:text-blue-600 transition-colors pt-0.5"
                                    >
                                        <Circle size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{task.title}</h4>
                                            <Flag size={14} className={getPriorityColor(task.priority)} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                <Briefcase size={10} /> {task.projectName}
                                            </span>
                                            <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-bold' : ''}`}>
                                                <Calendar size={12} /> {task.dueDate}
                                            </span>
                                            {task.comments && task.comments.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare size={12} /> {task.comments.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Completed Section */}
                {completedTasks.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Completed</h3>
                        {completedTasks.map(task => (
                            <div 
                                key={task.id}
                                onClick={() => openEditTask(task)}
                                className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex gap-3 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                            >
                                <div 
                                    onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.projectId, task.id); }}
                                    className="text-green-500 dark:text-green-400 pt-0.5"
                                >
                                    <CheckCircle2 size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-500 dark:text-slate-400 text-sm line-clamp-1 line-through">{task.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                        <span>{task.projectName}</span>
                                        <span>•</span>
                                        <span>{task.dueDate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </div>

      {/* Enhanced Task Detail Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md h-[750px] max-h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 z-10">
                    <div>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Task Details</h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Manage your task</p>
                    </div>
                    <button onClick={() => setEditingTask(null)} className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Related Project Section (New) */}
                <div 
                    onClick={() => {
                        if (onNavigateToProject) {
                            onNavigateToProject(editingTask.projectId);
                        }
                    }}
                    className="bg-slate-50 dark:bg-slate-700/30 px-4 py-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Layers size={10} /> Related Project
                        </span>
                        {onNavigateToProject && (
                            <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                View Project
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm text-blue-600 dark:text-blue-400">
                            <Briefcase size={18} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{editingTask.project.title}</h4>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span>{editingTask.project.department}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <UserIcon size={10} /> Lead: {getUserDetails(editingTask.project.assignedTo).name.split(' ')[0]}
                                </span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400" />
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="px-4 pt-4 pb-2">
                    <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl">
                        <button 
                            onClick={() => setTaskModalTab('DETAILS')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${taskModalTab === 'DETAILS' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            <AlignLeft size={16} /> Details
                        </button>
                        <button 
                            onClick={() => setTaskModalTab('COMMENTS')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${taskModalTab === 'COMMENTS' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            <MessageSquare size={16} /> Discussion
                            {editingTask.task.comments && editingTask.task.comments.length > 0 && (
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-[10px] px-1.5 rounded-full">
                                    {editingTask.task.comments.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                    {taskModalTab === 'DETAILS' ? (
                        <form id="task-form" onSubmit={handleSaveTaskChanges} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-3 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-slate-900 font-medium"
                                    value={editTaskForm.title}
                                    onChange={(e) => setEditTaskForm({...editTaskForm, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-3 pl-9 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white text-slate-900 text-sm font-medium"
                                            value={editTaskForm.status}
                                            onChange={(e) => setEditTaskForm({...editTaskForm, status: e.target.value as any})}
                                        >
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <CheckCircle2 size={16} className="text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Due Date</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full p-3 pl-9 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-slate-900 text-sm font-medium"
                                            value={editTaskForm.dueDate}
                                            onChange={(e) => setEditTaskForm({...editTaskForm, dueDate: e.target.value})}
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Priority</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-3 pl-9 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white text-slate-900 text-sm font-medium"
                                            value={editTaskForm.priority}
                                            onChange={(e) => setEditTaskForm({...editTaskForm, priority: e.target.value as any})}
                                        >
                                            <option value="HIGH">High Priority</option>
                                            <option value="MEDIUM">Medium Priority</option>
                                            <option value="LOW">Low Priority</option>
                                        </select>
                                        <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                
                                {/* Assignment / Reassignment Field (Multi-Select) */}
                                <div>
                                    <MultiSelectUser 
                                        label="Assignees"
                                        options={MOCK_EMPLOYEES} // Or filtered by project team
                                        selectedIds={editTaskForm.assigneeIds}
                                        onChange={(ids) => setEditTaskForm({...editTaskForm, assigneeIds: ids})}
                                        placeholder="Select team members..."
                                    />
                                    {editTaskForm.assigneeIds.length > 0 && !editTaskForm.assigneeIds.includes(CURRENT_USER.id) && (
                                        <div className="text-[10px] text-orange-500 mt-1 flex items-center gap-1">
                                            <ArrowRight size={10} /> Task will disappear from "My Tasks"
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Description / Notes</label>
                                <div className="relative">
                                     <textarea 
                                        rows={6}
                                        className="w-full p-3 pl-9 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-colors resize-none dark:text-white text-slate-900 text-sm leading-relaxed"
                                        placeholder="Add more details about this task..."
                                        value={editTaskForm.description}
                                        onChange={(e) => setEditTaskForm({...editTaskForm, description: e.target.value})}
                                    />
                                    <AlignLeft className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* Chat History */}
                            <div className="flex-1 space-y-4 min-h-0 pb-4">
                                {editingTask.task.comments && editingTask.task.comments.length > 0 ? (
                                  editingTask.task.comments.map(comment => {
                                    const author = getUserDetails(comment.userId);
                                    const isMe = comment.userId === CURRENT_USER.id;
                                    
                                    return (
                                      <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
                                        <img 
                                            src={author?.avatar} 
                                            alt={author?.name} 
                                            className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-600 mt-1 flex-shrink-0 object-cover" 
                                        />
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                    {isMe ? 'You' : author?.name}
                                                </span>
                                                <span className="text-[9px] text-slate-400">{comment.createdAt}</span>
                                            </div>
                                            <div className={`p-3 text-sm leading-relaxed shadow-sm break-words ${
                                                isMe 
                                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                                                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-600'
                                            }`}>
                                                {comment.text}
                                            </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full mb-3">
                                          <MessageSquare size={24} className="text-slate-400 dark:text-slate-300" />
                                      </div>
                                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No comments yet</p>
                                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start the conversation!</p>
                                  </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Area */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {taskModalTab === 'DETAILS' ? (
                         <div className="flex items-center gap-3">
                            <button 
                                type="submit"
                                form="task-form"
                                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <input 
                                type="text" 
                                className="flex-1 p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder:text-slate-400"
                                placeholder="Type a message..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment())}
                                autoFocus
                            />
                            <button 
                                type="button"
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;