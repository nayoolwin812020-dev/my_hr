
import React, { useState, useEffect, useRef } from 'react';
import { Project, Task, Comment } from '../types';
import { MOCK_PROJECTS, MOCK_EMPLOYEES, CURRENT_USER } from '../constants';
import { Briefcase, CheckCircle2, Circle, MoreVertical, Plus, X, Calendar as CalendarIcon, User as UserIcon, Trash2, AlignLeft, Flag, ArrowUpDown, MessageSquare, Send, Check, Users, Layout, Clock, ChevronDown, Filter, Pencil, ListTodo, Eye, Search } from 'lucide-react';

const MultiSelectUser = ({ label, options, selectedIds, onChange, placeholder = "Select members..." }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((i: string) => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const filteredOptions = options.filter((opt: any) => 
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[46px] w-full p-2 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-900 cursor-pointer flex flex-wrap gap-2 items-center transition-all"
            >
                {selectedIds.length === 0 && (
                    <span className="text-gray-400 text-sm ml-2">{placeholder}</span>
                )}
                
                {selectedIds.map((id: string) => {
                    const user = options.find((o: any) => o.id === id);
                    if (!user) return null;
                    return (
                        <div key={id} className="flex items-center gap-1 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-full pl-1 pr-2 py-0.5 shadow-sm">
                            <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{user.name.split(' ')[0]}</span>
                            <div 
                                onClick={(e) => { e.stopPropagation(); toggleSelection(id); }}
                                className="p-0.5 hover:bg-gray-100 dark:hover:bg-slate-500 rounded-full text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                            >
                                <X size={12} />
                            </div>
                        </div>
                    );
                })}
                
                <div className="ml-auto pr-2 text-gray-400">
                     <ChevronDown size={16} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-50 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                autoFocus
                                placeholder="Search team..." 
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 dark:text-white transition-all placeholder:text-gray-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="p-3 text-center text-xs text-gray-400">No members found</div>
                        ) : (
                            filteredOptions.map((option: any) => {
                                const isSelected = selectedIds.includes(option.id);
                                return (
                                    <div 
                                        key={option.id}
                                        onClick={() => toggleSelection(option.id)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                            isSelected 
                                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                                            : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <div className="relative">
                                            <img src={option.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-800">
                                                    <Check size={8} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {option.name}
                                            </div>
                                            <div className="text-xs text-gray-400">{option.department}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const Projects: React.FC = () => {
  // Initialize projects from localStorage if available, otherwise use MOCK_PROJECTS
  // We use a map to ensure existing data in localStorage gets default values for new fields like 'team' and 'authorId'
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem('projects_data');
      if (savedProjects) {
        const parsed: Project[] = JSON.parse(savedProjects);
        return parsed.map(p => ({
            ...p,
            status: p.status || 'ACTIVE',
            authorId: p.authorId || CURRENT_USER.id,
            team: p.team || [],
            tasks: p.tasks.map(t => ({...t, assigneeId: t.assigneeId || undefined}))
        }));
      }
      return MOCK_PROJECTS;
    } catch (error) {
      console.error('Failed to load projects from storage', error);
      return MOCK_PROJECTS;
    }
  });

  // Save to localStorage whenever projects state changes
  useEffect(() => {
    localStorage.setItem('projects_data', JSON.stringify(projects));
  }, [projects]);

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ALL');
  const [sortByPriority, setSortByPriority] = useState(false);
  
  // Project View Modal State
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // Task Filter State
  const [taskFilterStatus, setTaskFilterStatus] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [taskFilterAssignee, setTaskFilterAssignee] = useState<string>('ALL');

  // Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectDepartment, setNewProjectDepartment] = useState('Engineering');
  const [newProjectAssignee, setNewProjectAssignee] = useState(MOCK_EMPLOYEES[0].id);
  const [newProjectTeam, setNewProjectTeam] = useState<string[]>([MOCK_EMPLOYEES[0].id]); // Default includes Lead

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectDepartment, setEditProjectDepartment] = useState('');
  const [editProjectAssignee, setEditProjectAssignee] = useState('');
  const [editProjectStatus, setEditProjectStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ACTIVE');
  const [editProjectTeam, setEditProjectTeam] = useState<string[]>([]);

  // Create Task Modal State
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<{ projectId: string, task: Task } | null>(null);
  const [taskModalTab, setTaskModalTab] = useState<'DETAILS' | 'COMMENTS'>('DETAILS');
  const [editTaskForm, setEditTaskForm] = useState({
      title: '',
      description: '',
      dueDate: '',
      status: 'TODO' as 'TODO' | 'IN_PROGRESS' | 'DONE',
      priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
      assigneeId: ''
  });
  const [newComment, setNewComment] = useState('');

  // Helper to get user details
  const getUserDetails = (userId: string) => {
    if (userId === CURRENT_USER.id) return CURRENT_USER;
    const emp = MOCK_EMPLOYEES.find(e => e.id === userId);
    return emp || { name: 'Unknown', avatar: '', id: userId, role: 'EMPLOYEE', department: '' } as any;
  };

  const getProjectRole = (userId: string, project: Project) => {
    const roles = [];
    if (project.assignedTo === userId) roles.push('Lead');
    if (project.authorId === userId) roles.push('Author');
    if (roles.length === 0) roles.push('Member');
    return roles.join(' • ');
  };

  const toggleTaskStatus = (projectId: string, taskId: string) => {
    const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
            const updatedTasks = p.tasks.map(t => {
                if (t.id === taskId) {
                    return { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' } as Task;
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
    
    // Update viewing project if open
    if (viewingProject && viewingProject.id === projectId) {
        setViewingProject(updatedProjects.find(p => p.id === projectId) || null);
    }
  };

  const updateProjectStatus = (projectId: string, status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED') => {
    const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
            return { ...p, status };
        }
        return p;
    });
    setProjects(updatedProjects);
    if (viewingProject && viewingProject.id === projectId) {
        setViewingProject({ ...viewingProject, status });
    }
  };

  const openEditTask = (projectId: string, task: Task) => {
    setEditingTask({ projectId, task });
    setEditTaskForm({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId || ''
    });
    setNewComment('');
    setTaskModalTab('DETAILS');
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
                        assigneeId: editTaskForm.assigneeId || undefined
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
    // Update viewing project if active
    if (viewingProject && viewingProject.id === editingTask.projectId) {
        setViewingProject(updatedProjects.find(p => p.id === editingTask.projectId) || null);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;
    const updatedProjects = projects.map(p => {
        if (p.id === editingTask.projectId) {
            const updatedTasks = p.tasks.filter(t => t.id !== editingTask.task.id);
            const completedCount = updatedTasks.filter(t => t.status === 'DONE').length;
            const newProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
            return { ...p, tasks: updatedTasks, progress: newProgress };
        }
        return p;
    });
    setProjects(updatedProjects);
    if (viewingProject && viewingProject.id === editingTask.projectId) {
        setViewingProject(updatedProjects.find(p => p.id === editingTask.projectId) || null);
    }
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
    setEditingTask({
      ...editingTask,
      task: {
        ...editingTask.task,
        comments: [...(editingTask.task.comments || []), comment]
      }
    });
    
    if (viewingProject && viewingProject.id === editingTask.projectId) {
        setViewingProject(updatedProjects.find(p => p.id === editingTask.projectId) || null);
    }
    setNewComment('');
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        title: newProjectTitle,
        description: newProjectDescription,
        department: newProjectDepartment,
        assignedTo: newProjectAssignee,
        authorId: CURRENT_USER.id,
        team: newProjectTeam.length > 0 ? newProjectTeam : [newProjectAssignee],
        status: 'ACTIVE',
        progress: 0,
        tasks: []
    };
    
    setProjects([newProject, ...projects]);
    
    // Reset and Close
    setNewProjectTitle('');
    setNewProjectDescription('');
    setNewProjectDepartment('Engineering');
    setNewProjectAssignee(MOCK_EMPLOYEES[0].id);
    setNewProjectTeam([MOCK_EMPLOYEES[0].id]);
    setShowCreateModal(false);
  };

  const openEditProject = (project: Project) => {
    setEditingProject(project);
    setEditProjectTitle(project.title);
    setEditProjectDescription(project.description);
    setEditProjectDepartment(project.department);
    setEditProjectAssignee(project.assignedTo);
    setEditProjectStatus(project.status);
    setEditProjectTeam(project.team || []);
    // Close view modal if open
    setViewingProject(null);
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const updatedProjects = projects.map(p => {
        if (p.id === editingProject.id) {
            return {
                ...p,
                title: editProjectTitle,
                description: editProjectDescription,
                department: editProjectDepartment,
                assignedTo: editProjectAssignee,
                status: editProjectStatus,
                team: editProjectTeam
            };
        }
        return p;
    });

    setProjects(updatedProjects);
    setEditingProject(null);
  };

  const handleDeleteProject = () => {
    if (!editingProject) return;
    const updatedProjects = projects.filter(p => p.id !== editingProject.id);
    setProjects(updatedProjects);
    setEditingProject(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return;

    const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: newTaskTitle,
        description: newTaskDescription,
        status: 'TODO',
        dueDate: newTaskDueDate,
        priority: newTaskPriority,
        assigneeId: newTaskAssignee || undefined,
        comments: []
    };

    const updatedProjects = projects.map(p => {
        if (p.id === activeProjectId) {
            const updatedTasks = [...p.tasks, newTask];
            const completedCount = updatedTasks.filter(t => t.status === 'DONE').length;
            const newProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
            return { ...p, tasks: updatedTasks, progress: newProgress };
        }
        return p;
    });

    setProjects(updatedProjects);
    if (viewingProject && viewingProject.id === activeProjectId) {
        setViewingProject(updatedProjects.find(p => p.id === activeProjectId) || null);
    }
    setActiveProjectId(null);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setNewTaskPriority('MEDIUM');
    setNewTaskAssignee('');
  };

  const toggleTeamMember = (userId: string, isEditing: boolean) => {
    if (isEditing) {
        setEditProjectTeam(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    } else {
        setNewProjectTeam(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    }
  };

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
        case 'Engineering': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        case 'Marketing': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
        case 'Sales': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        case 'Design': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
        case 'HIGH': return 'text-red-500 fill-red-500';
        case 'MEDIUM': return 'text-orange-400 fill-orange-400';
        case 'LOW': return 'text-blue-400 fill-blue-400';
        default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'ACTIVE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
          case 'ON_HOLD': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
          case 'COMPLETED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  const filteredProjects = filter === 'ALL' ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="p-4 space-y-6 pb-24 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Briefcase className="text-blue-600" /> Projects & Tasks
        </h2>
        <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-transform"
        >
            <Plus size={20} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <div className="flex-1 flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl min-w-max">
            {['ALL', 'ACTIVE', 'ON_HOLD', 'COMPLETED'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        filter === f 
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                >
                    {f.replace('_', ' ')}
                </button>
            ))}
        </div>
        <button 
            onClick={() => setSortByPriority(!sortByPriority)}
            className={`px-3 rounded-xl border flex items-center gap-1 transition-colors ${sortByPriority ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-white border-gray-100 text-gray-400 dark:bg-slate-800 dark:border-slate-700'}`}
        >
            <ArrowUpDown size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                <Briefcase size={48} className="mx-auto mb-2 opacity-20" />
                <p>No projects found.</p>
                <button onClick={() => setShowCreateModal(true)} className="text-blue-600 font-medium text-sm mt-2 hover:underline">Create one now</button>
            </div>
        ) : (
            filteredProjects.map((project) => {
                const assignee = getUserDetails(project.assignedTo);
                const author = getUserDetails(project.authorId);
                const teamMembers = (project.team || []).map(id => getUserDetails(id));
                
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
                            setTaskFilterStatus('ALL');
                            setTaskFilterAssignee('ALL');
                        }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                    >
                        <div className="p-4 border-b border-gray-50 dark:border-slate-700">
                            {/* Project Header */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getDepartmentColor(project.department)}`}>
                                            {project.department}
                                        </span>
                                        <div 
                                            onClick={(e) => e.stopPropagation()}
                                            className="relative"
                                        >
                                            <select 
                                                value={project.status}
                                                onChange={(e) => updateProjectStatus(project.id, e.target.value as any)}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded border-none outline-none cursor-pointer appearance-none ${getStatusColor(project.status)}`}
                                            >
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="ON_HOLD">ON HOLD</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                            </select>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">{project.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{project.description}</p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdownId(openDropdownId === project.id ? null : project.id);
                                        }}
                                        className={`text-gray-400 ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors ${openDropdownId === project.id ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-200' : ''}`}
                                    >
                                        <MoreVertical size={20} />
                                    </button>
                                    
                                    {openDropdownId === project.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }}></div>
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingProject(project);
                                                        setOpenDropdownId(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                >
                                                    <Layout size={14} /> Project Details
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingProject(project);
                                                        setOpenDropdownId(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                >
                                                    <ListTodo size={14} /> View All Tasks
                                                </button>
                                                 <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveProjectId(project.id);
                                                        setNewTaskDueDate(new Date().toISOString().split('T')[0]);
                                                        setOpenDropdownId(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                >
                                                    <Plus size={14} /> Add Task
                                                </button>
                                                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditProject(project);
                                                        setOpenDropdownId(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                                                >
                                                    <Pencil size={14} /> Edit Project
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Project Meta: Lead, Author, Team */}
                            <div className="mt-4 flex items-end justify-between">
                                <div className="flex flex-col gap-3">
                                    {/* Author & Lead Info */}
                                    <div className="flex items-center gap-4">
                                       {/* Assigned To Badge */}
                                       <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 pl-1 pr-3 py-1 rounded-full border border-gray-100 dark:border-slate-600" title={`Project assigned to ${assignee.name}`}>
                                            <img src={assignee.avatar} className="w-6 h-6 rounded-full object-cover" alt={assignee.name} />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Assigned To</span>
                                                <span className="text-[10px] font-bold text-gray-800 dark:text-white leading-none">{assignee.name}</span>
                                            </div>
                                       </div>
                                       
                                       {/* Author text */}
                                       <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <span>Created by {author.name.split(' ')[0]}</span>
                                       </div>
                                    </div>

                                    {/* Team Members */}
                                    {teamMembers.length > 0 && (
                                        <div className="flex -space-x-2 pl-1">
                                            {teamMembers.slice(0, 5).map(member => (
                                                <img 
                                                    key={member.id} 
                                                    src={member.avatar} 
                                                    alt={member.name}
                                                    title={member.name} 
                                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover" 
                                                />
                                            ))}
                                            {teamMembers.length > 5 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                    +{teamMembers.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="flex flex-col items-end w-28">
                                    <div className="flex justify-between text-[10px] mb-1 w-full">
                                        <span className="font-medium text-gray-500">Progress</span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">{project.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tasks List Preview */}
                        <div className="p-4 bg-gray-50 dark:bg-slate-900/30 space-y-3">
                            {tasksToShow.slice(0, 3).map((task) => {
                                const taskAssignee = task.assigneeId ? getUserDetails(task.assigneeId) : null;
                                return (
                                    <div 
                                        key={task.id} 
                                        onClick={(e) => { e.stopPropagation(); openEditTask(project.id, task); }}
                                        className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-lg cursor-pointer transition-colors shadow-sm border border-gray-100 dark:border-slate-700/50 group"
                                    >
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); toggleTaskStatus(project.id, task.id); }}
                                            className={`text-gray-400 dark:text-gray-500 transition-colors p-1 -m-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 ${task.status === 'DONE' ? 'text-green-500 dark:text-green-400' : ''}`}
                                        >
                                            {task.status === 'DONE' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium transition-all truncate ${
                                                task.status === 'DONE' 
                                                ? 'text-gray-400 dark:text-gray-500 line-through' 
                                                : 'text-gray-800 dark:text-gray-200'
                                            }`}>
                                                {task.title}
                                            </div>
                                            <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                                            <span className="flex items-center gap-1"><CalendarIcon size={10} /> {task.dueDate}</span>
                                            {task.comments && task.comments.length > 0 && (
                                                <span className="flex items-center gap-0.5 text-gray-400">
                                                <MessageSquare size={10} /> {task.comments.length}
                                                </span>
                                            )}
                                            </div>
                                        </div>
                                        {taskAssignee && (
                                            <div className="flex items-center gap-1.5 min-w-0" title={`Assigned to ${taskAssignee.name}`}>
                                                <img 
                                                    src={taskAssignee.avatar} 
                                                    className="w-5 h-5 rounded-full border border-gray-100 dark:border-slate-600 object-cover flex-shrink-0" 
                                                    alt="Assignee" 
                                                />
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[60px] hidden sm:block">
                                                    {taskAssignee.name.split(' ')[0]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {tasksToShow.length > 3 && (
                                <div className="text-center text-xs text-gray-400">
                                    + {tasksToShow.length - 3} more tasks
                                </div>
                            )}

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
            <div className="bg-white dark:bg-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Project</h3>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white"
                            placeholder="e.g. Q4 Marketing Plan"
                            value={newProjectTitle}
                            onChange={(e) => setNewProjectTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea 
                            required
                            rows={2}
                            className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors resize-none dark:text-white"
                            placeholder="Briefly describe the project goals..."
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white"
                                    value={newProjectDepartment}
                                    onChange={(e) => setNewProjectDepartment(e.target.value)}
                                >
                                    <option value="Engineering">Engineering</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Design">Design</option>
                                </select>
                                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Project To</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white"
                                    value={newProjectAssignee}
                                    onChange={(e) => {
                                        setNewProjectAssignee(e.target.value);
                                        // Ensure lead is in team
                                        if(!newProjectTeam.includes(e.target.value)) {
                                            setNewProjectTeam([...newProjectTeam, e.target.value]);
                                        }
                                    }}
                                >
                                    {MOCK_EMPLOYEES.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Team Selection with MultiSelect */}
                    <MultiSelectUser 
                        label="Team Members" 
                        options={MOCK_EMPLOYEES} 
                        selectedIds={newProjectTeam} 
                        onChange={setNewProjectTeam}
                    />
                    
                    <button 
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all mt-4 active:scale-95"
                    >
                        Create Project
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Project</h3>
                    <button onClick={() => setEditingProject(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleUpdateProject} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white"
                            value={editProjectTitle}
                            onChange={(e) => setEditProjectTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea 
                            required
                            rows={2}
                            className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors resize-none dark:text-white"
                            value={editProjectDescription}
                            onChange={(e) => setEditProjectDescription(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white"
                                    value={editProjectDepartment}
                                    onChange={(e) => setEditProjectDepartment(e.target.value)}
                                >
                                    <option value="Engineering">Engineering</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Design">Design</option>
                                </select>
                                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white"
                                    value={editProjectStatus}
                                    onChange={(e) => setEditProjectStatus(e.target.value as any)}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Project To</label>
                        <div className="relative">
                            <select 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white"
                                value={editProjectAssignee}
                                onChange={(e) => {
                                    setEditProjectAssignee(e.target.value);
                                    if(!editProjectTeam.includes(e.target.value)) {
                                        setEditProjectTeam([...editProjectTeam, e.target.value]);
                                    }
                                }}
                            >
                                {MOCK_EMPLOYEES.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                            <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Team Selection with MultiSelect */}
                    <MultiSelectUser 
                        label="Team Members" 
                        options={MOCK_EMPLOYEES} 
                        selectedIds={editProjectTeam} 
                        onChange={setEditProjectTeam}
                    />
                    
                    <div className="flex items-center gap-3 mt-4">
                        <button 
                            type="button"
                            onClick={handleDeleteProject}
                            className="p-3.5 rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Create Task Modal */}
      {activeProjectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Task</h3>
                    <button onClick={() => setActiveProjectId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white"
                            placeholder="e.g. Draft content"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea 
                            className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors resize-none dark:text-white"
                            rows={3}
                            placeholder="Add details (optional)"
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white text-sm"
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                                >
                                    <option value="HIGH">High Priority</option>
                                    <option value="MEDIUM">Medium Priority</option>
                                    <option value="LOW">Low Priority</option>
                                </select>
                                <Flag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    required
                                    className="w-full p-3 pl-9 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-sm"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                />
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                        <div className="relative">
                            <select 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white text-sm"
                                value={newTaskAssignee}
                                onChange={(e) => setNewTaskAssignee(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {projects.find(p => p.id === activeProjectId)?.team?.map(memberId => {
                                    const user = getUserDetails(memberId);
                                    return <option key={memberId} value={memberId}>{user.name}</option>
                                })}
                            </select>
                            <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all mt-2 active:scale-95"
                    >
                        Add Task
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Edit Task / Details Modal (Tabbed Interface) */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md h-[650px] max-h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 z-10">
                    <div>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Task Details</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400">Edit and discuss</p>
                    </div>
                    <button onClick={() => setEditingTask(null)} className="p-2 bg-gray-50 dark:bg-slate-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="px-4 pt-4 pb-2">
                    <div className="flex bg-gray-100 dark:bg-slate-700/50 p-1 rounded-xl">
                        <button 
                            onClick={() => setTaskModalTab('DETAILS')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${taskModalTab === 'DETAILS' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            <AlignLeft size={16} /> Details
                        </button>
                        <button 
                            onClick={() => setTaskModalTab('COMMENTS')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${taskModalTab === 'COMMENTS' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
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
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white font-medium"
                                    value={editTaskForm.title}
                                    onChange={(e) => setEditTaskForm({...editTaskForm, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Status</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-3 pl-9 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white text-sm font-medium"
                                            value={editTaskForm.status}
                                            onChange={(e) => setEditTaskForm({...editTaskForm, status: e.target.value as any})}
                                        >
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <CheckCircle2 size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Due Date</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full p-3 pl-9 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors dark:text-white text-sm font-medium"
                                            value={editTaskForm.dueDate}
                                            onChange={(e) => setEditTaskForm({...editTaskForm, dueDate: e.target.value})}
                                        />
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Priority</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-3 pl-9 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white text-sm font-medium"
                                            value={editTaskForm.priority}
                                            onChange={(e) => setEditTaskForm({...editTaskForm, priority: e.target.value as any})}
                                        >
                                            <option value="HIGH">High Priority</option>
                                            <option value="MEDIUM">Medium Priority</option>
                                            <option value="LOW">Low Priority</option>
                                        </select>
                                        <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Assignee</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-3 pl-9 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors appearance-none dark:text-white text-sm font-medium"
                                            value={editTaskForm.assigneeId}
                                            onChange={(e) => setEditTaskForm({...editTaskForm, assigneeId: e.target.value})}
                                        >
                                            <option value="">Unassigned</option>
                                            {projects.find(p => p.id === editingTask.projectId)?.team?.map(memberId => {
                                                const user = getUserDetails(memberId);
                                                return <option key={memberId} value={memberId}>{user.name}</option>
                                            })}
                                        </select>
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Description / Notes</label>
                                <div className="relative">
                                     <textarea 
                                        rows={6}
                                        className="w-full p-3 pl-9 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-900 outline-none transition-colors resize-none dark:text-white text-sm leading-relaxed"
                                        placeholder="Add more details about this task..."
                                        value={editTaskForm.description}
                                        onChange={(e) => setEditTaskForm({...editTaskForm, description: e.target.value})}
                                    />
                                    <AlignLeft className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={16} />
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
                                            className="w-8 h-8 rounded-full border border-gray-100 dark:border-slate-600 mt-1 flex-shrink-0 object-cover" 
                                        />
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                    {isMe ? 'You' : author?.name}
                                                </span>
                                                <span className="text-[9px] text-gray-400">{comment.createdAt}</span>
                                            </div>
                                            <div className={`p-3 text-sm leading-relaxed shadow-sm ${
                                                isMe 
                                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none'
                                            }`}>
                                                {comment.text}
                                            </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                      <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-full mb-3">
                                          <MessageSquare size={24} className="text-gray-400 dark:text-gray-300" />
                                      </div>
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No comments yet</p>
                                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start the conversation with your team!</p>
                                  </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Area */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    {taskModalTab === 'DETAILS' ? (
                         <div className="flex items-center gap-3">
                            <button 
                                type="button"
                                onClick={handleDeleteTask}
                                className="p-3.5 rounded-xl text-red-600 dark:text-red-400 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
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
                                className="flex-1 p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder:text-gray-400"
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

export default Projects;
