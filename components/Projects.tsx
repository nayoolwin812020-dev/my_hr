import React, { useState, useEffect } from 'react';
import { Project, Task, Comment } from '../types';
import { MOCK_PROJECTS, MOCK_EMPLOYEES, CURRENT_USER } from '../constants';
import { Briefcase, CheckCircle2, Circle, MoreVertical, Plus, X, Calendar as CalendarIcon, User as UserIcon, Trash2, AlignLeft, Flag, ArrowUpDown, MessageSquare, Send, Users, Info, ChevronDown, Pencil, ListTodo, Search, AlertCircle, Tag, Clock, CornerDownRight } from 'lucide-react';
import MultiSelectUser from './MultiSelectUser';

interface ProjectsProps {
  initialProjectId?: string | null;
  onProjectOpened?: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ initialProjectId, onProjectOpened }) => {
  // Initialize projects from localStorage if available, otherwise use MOCK_PROJECTS
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
            deadline: p.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tags: p.tags || [],
            tasks: p.tasks.map(t => ({
                ...t, 
                // Migration logic for old data
                assigneeIds: t.assigneeIds || ((t as any).assigneeId ? [(t as any).assigneeId] : [])
            }))
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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectDepartment, setNewProjectDepartment] = useState('Engineering');
  const [newProjectAssignee, setNewProjectAssignee] = useState(MOCK_EMPLOYEES[0].id);
  const [newProjectTeam, setNewProjectTeam] = useState<string[]>([MOCK_EMPLOYEES[0].id]); // Default includes Lead
  const [newProjectDeadline, setNewProjectDeadline] = useState('');
  const [newProjectTags, setNewProjectTags] = useState('');

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectDepartment, setEditProjectDepartment] = useState('');
  const [editProjectAssignee, setEditProjectAssignee] = useState('');
  const [editProjectStatus, setEditProjectStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ACTIVE');
  const [editProjectTeam, setEditProjectTeam] = useState<string[]>([]);
  const [editProjectDeadline, setEditProjectDeadline] = useState('');
  const [editProjectTags, setEditProjectTags] = useState('');

  // Create Task Modal State
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([]);

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<{ projectId: string, task: Task } | null>(null);
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

  const openEditTask = (projectId: string, task: Task) => {
    setEditingTask({ projectId, task });
    setEditTaskForm({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        assigneeIds: task.assigneeIds || []
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
        deadline: newProjectDeadline,
        tags: newProjectTags.split(',').map(t => t.trim()).filter(Boolean),
        tasks: []
    };
    
    setProjects([newProject, ...projects]);
    
    // Reset and Close
    setNewProjectTitle('');
    setNewProjectDescription('');
    setNewProjectDepartment('Engineering');
    setNewProjectAssignee(MOCK_EMPLOYEES[0].id);
    setNewProjectTeam([MOCK_EMPLOYEES[0].id]);
    setNewProjectDeadline('');
    setNewProjectTags('');
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
    setEditProjectDeadline(project.deadline || '');
    setEditProjectTags(project.tags ? project.tags.join(', ') : '');
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
                team: editProjectTeam,
                deadline: editProjectDeadline,
                tags: editProjectTags.split(',').map(t => t.trim()).filter(Boolean)
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
        assigneeIds: newTaskAssignees,
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
    setNewTaskAssignees([]);
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
                            p.description.toLowerCase().includes(searchLower) ||
                            (p.tags && p.tags.some(t => t.toLowerCase().includes(searchLower)));
      return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 space-y-6 pb-24 relative">
      <div className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-900 pb-2 pt-2 transition-colors">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="text-blue-600" /> Projects & Tasks
                </h2>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-transform"
                >
                    <Plus size={20} />
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
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <div className="flex-1 flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl min-w-max">
                    {['ALL', 'ACTIVE', 'ON_HOLD', 'COMPLETED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                filter === f 
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-700 dark:text-blue-400 ring-1 ring-black/5 dark:ring-white/10' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setSortByPriority(!sortByPriority)}
                    className={`px-3 rounded-xl border flex items-center gap-1 transition-colors ${sortByPriority ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                >
                    <ArrowUpDown size={16} />
                </button>
            </div>
          </div>
      </div>

      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Briefcase size={48} className="mx-auto mb-2 opacity-20" />
                <p>No projects found.</p>
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
                        className={`${projectIsOverdue ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-slate-800'} rounded-2xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-all group ${projectIsOverdue ? 'border-red-200 dark:border-red-900/50' : 'border-slate-100 dark:border-slate-700'}`}
                    >
                        {/* Project Card Content */}
                        <div className="p-4 border-b border-slate-50 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
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
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{project.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{project.description}</p>
                                </div>
                                <MoreVertical className="text-slate-400" size={20} />
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
                                        onClick={(e) => { e.stopPropagation(); openEditTask(project.id, task); }}
                                        className={`flex items-center gap-3 p-2 ${taskIsOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800'} hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-lg cursor-pointer transition-colors shadow-sm border group ${taskIsOverdue ? 'border-red-200 dark:border-red-900/50' : 'border-slate-100 dark:border-slate-700/50'}`}
                                    >
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); toggleTaskStatus(project.id, task.id); }}
                                            className={`text-slate-400 dark:text-slate-500 transition-colors p-1 -m-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 ${task.status === 'DONE' ? 'text-green-600 dark:text-green-400' : ''}`}
                                        >
                                            {task.status === 'DONE' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
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
                                        {/* Multi-Avatar Display */}
                                        <div className="flex -space-x-2">
                                            {(task.assigneeIds || []).slice(0, 3).map((uid) => {
                                                const u = getUserDetails(uid);
                                                return (
                                                    <img 
                                                        key={uid}
                                                        src={u.avatar} 
                                                        className="w-5 h-5 rounded-full border border-white dark:border-slate-700 object-cover" 
                                                        alt={u.name}
                                                        title={u.name}
                                                    />
                                                );
                                            })}
                                            {(task.assigneeIds?.length || 0) > 3 && (
                                                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 border border-white dark:border-slate-600 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                    +{task.assigneeIds.length - 3}
                                                </div>
                                            )}
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

      {/* Viewing Project Modal */}
      {viewingProject && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewingProject(null)}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
               {/* Header and Tabs */}
               <div className="border-b border-slate-100 dark:border-slate-700 p-4 flex justify-between bg-white dark:bg-slate-800 z-10 sticky top-0">
                   <div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project</div>
                       <h2 className="font-bold text-xl dark:text-white leading-none">{viewingProject.title}</h2>
                   </div>
                   <button onClick={() => setViewingProject(null)} className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"><X size={20} className="text-slate-400" /></button>
               </div>
               
               <div className="flex border-b border-slate-100 dark:border-slate-700 px-4 gap-6 bg-slate-50 dark:bg-slate-800/50">
                   <button onClick={() => setProjectDetailTab('TASKS')} className={`py-3 text-sm font-bold border-b-2 transition-colors ${projectDetailTab === 'TASKS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Tasks</button>
                   <button onClick={() => setProjectDetailTab('INFO')} className={`py-3 text-sm font-bold border-b-2 transition-colors ${projectDetailTab === 'INFO' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Info</button>
                   <button onClick={() => setProjectDetailTab('MEMBERS')} className={`py-3 text-sm font-bold border-b-2 transition-colors ${projectDetailTab === 'MEMBERS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Members</button>
               </div>

               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                   {projectDetailTab === 'TASKS' && (
                       <div className="space-y-4">
                           <div className="flex justify-between items-center sticky top-0 bg-slate-50/90 dark:bg-slate-900/80 backdrop-blur-sm z-10 py-2 -my-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex gap-2">
                                    <select value={taskFilterStatus} onChange={e => setTaskFilterStatus(e.target.value as any)} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-1.5 px-2 text-xs font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-100">
                                        <option value="ALL">All Status</option>
                                        <option value="TODO">To Do</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                    <select value={taskFilterAssignee} onChange={e => setTaskFilterAssignee(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-1.5 px-2 text-xs font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-100">
                                        <option value="ALL">All Members</option>
                                        {viewingProject.team?.map(id => <option key={id} value={id}>{getUserDetails(id).name}</option>)}
                                    </select>
                                </div>
                                <button onClick={() => { setActiveProjectId(viewingProject.id); setNewTaskDueDate(new Date().toISOString().split('T')[0]); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors">
                                    <Plus size={14} /> Add Task
                                </button>
                           </div>
                           
                           <div className="space-y-2">
                               {viewingProject.tasks
                                .filter(t => taskFilterStatus === 'ALL' || t.status === taskFilterStatus)
                                .filter(t => taskFilterAssignee === 'ALL' || t.assigneeIds.includes(taskFilterAssignee))
                                .map(task => (
                                   <div key={task.id} onClick={() => openEditTask(viewingProject.id, task)} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all group">
                                       <div onClick={(e) => { e.stopPropagation(); toggleTaskStatus(viewingProject.id, task.id); }}>
                                           {task.status === 'DONE' ? <CheckCircle2 className="text-green-500" size={20} /> : <Circle className="text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />}
                                       </div>
                                       <div className="flex-1">
                                           <div className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{task.title}</div>
                                           <div className="text-xs text-slate-500 flex gap-2 items-center mt-0.5">
                                               <span className={`font-semibold flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                                                   <Flag size={10} /> {task.priority}
                                               </span>
                                               <span className="flex items-center gap-1"><CalendarIcon size={10} /> {task.dueDate}</span>
                                           </div>
                                       </div>
                                       <div className="flex -space-x-2 pl-2">
                                           {task.assigneeIds?.map(uid => (
                                               <img key={uid} src={getUserDetails(uid).avatar} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-700 object-cover" alt="" />
                                           ))}
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}
                   {projectDetailTab === 'INFO' && (
                       <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">{viewingProject.description}</div>
                   )}
                   {projectDetailTab === 'MEMBERS' && (
                       <div className="space-y-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                           {viewingProject.team?.map(id => {
                               const u = getUserDetails(id);
                               return <div key={id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"><img src={u.avatar} className="w-8 h-8 rounded-full object-cover" /> <span className="font-medium dark:text-white">{u.name}</span></div>
                           })}
                       </div>
                   )}
               </div>
            </div>
        </div>
      )}

      {/* Create Task Modal - Simplified for brevity in this update, focusing on Edit Task */}
      {activeProjectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Task</h3>
                    <button onClick={() => setActiveProjectId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleCreateTask} className="space-y-4">
                    {/* ... (Create Task Form fields maintained) ... */}
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
                    {/* Simplified for response length, assumimg other fields are similar to previous but maintained */}
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

      {/* Enhanced Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
                {/* Header - Sticky */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-md z-20">
                     <div className="flex flex-col">
                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            <Briefcase size={10} />
                            <span>{projects.find(p => p.id === editingTask.projectId)?.title || 'Unknown Project'}</span>
                         </div>
                         <h3 className="text-base font-bold text-slate-900 dark:text-white leading-none">Task Details</h3>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={handleDeleteTask} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Delete Task">
                            <Trash2 size={18} />
                        </button>
                        <button onClick={() => setEditingTask(null)} className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                            <X size={20} />
                        </button>
                     </div>
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800">
                    <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur px-6 py-3 border-b border-slate-50 dark:border-slate-700/50">
                        <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl">
                            <button onClick={() => setTaskModalTab('DETAILS')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${taskModalTab === 'DETAILS' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Details</button>
                            <button onClick={() => setTaskModalTab('COMMENTS')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${taskModalTab === 'COMMENTS' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Discussion</button>
                        </div>
                    </div>

                    <div className="p-6">
                        {taskModalTab === 'DETAILS' ? (
                            <form id="task-form" onSubmit={handleSaveTaskChanges} className="space-y-6">
                                {/* Hero Title Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
                                    <textarea 
                                        className="w-full text-xl font-bold bg-transparent border-0 border-b border-transparent focus:border-slate-200 dark:focus:border-slate-700 focus:ring-0 p-0 resize-none placeholder:text-slate-300 dark:text-white leading-tight" 
                                        rows={1}
                                        value={editTaskForm.title} 
                                        onChange={(e) => setEditTaskForm({...editTaskForm, title: e.target.value})}
                                        placeholder="Task Title"
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = "auto";
                                            target.style.height = `${target.scrollHeight}px`;
                                        }}
                                    />
                                </div>
                                
                                {/* Property Pills */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-700/30 rounded-xl p-2 border border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1"><CheckCircle2 size={10} /> Status</div>
                                        <select 
                                            className="w-full bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none appearance-none"
                                            value={editTaskForm.status} 
                                            onChange={(e) => setEditTaskForm({...editTaskForm, status: e.target.value as any})}
                                        >
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-700/30 rounded-xl p-2 border border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1"><Flag size={10} /> Priority</div>
                                        <select 
                                            className="w-full bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none appearance-none"
                                            value={editTaskForm.priority} 
                                            onChange={(e) => setEditTaskForm({...editTaskForm, priority: e.target.value as any})}
                                        >
                                            <option value="HIGH">High</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="LOW">Low</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-700/30 rounded-xl p-2 border border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1"><CalendarIcon size={10} /> Due Date</div>
                                        <input 
                                            type="date" 
                                            className="w-full bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none p-0"
                                            value={editTaskForm.dueDate} 
                                            onChange={(e) => setEditTaskForm({...editTaskForm, dueDate: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                     <MultiSelectUser 
                                        label="Assignees"
                                        options={MOCK_EMPLOYEES}
                                        selectedIds={editTaskForm.assigneeIds}
                                        onChange={(ids) => setEditTaskForm({...editTaskForm, assigneeIds: ids})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                                    <textarea 
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all resize-none dark:text-white text-slate-700 text-sm leading-relaxed min-h-[120px]" 
                                        placeholder="Add details..."
                                        value={editTaskForm.description} 
                                        onChange={(e) => setEditTaskForm({...editTaskForm, description: e.target.value})} 
                                    />
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6 pb-20">
                                {editingTask.task.comments && editingTask.task.comments.length > 0 ? (
                                  editingTask.task.comments.map(comment => {
                                    const author = getUserDetails(comment.userId);
                                    const isMe = comment.userId === CURRENT_USER.id;
                                    
                                    return (
                                      <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
                                        <img 
                                            src={author?.avatar} 
                                            alt={author?.name} 
                                            className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-600 mt-2 flex-shrink-0 object-cover" 
                                        />
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                    {isMe ? 'You' : author?.name}
                                                </span>
                                                <span className="text-[9px] text-slate-400">{comment.createdAt}</span>
                                            </div>
                                            <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm break-words ${
                                                isMe 
                                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none'
                                            }`}>
                                                {comment.text}
                                            </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center py-10 opacity-60">
                                      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full mb-3">
                                          <MessageSquare size={24} className="text-slate-400 dark:text-slate-300" />
                                      </div>
                                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No comments yet</p>
                                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start the conversation!</p>
                                  </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Area */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-20">
                    {taskModalTab === 'DETAILS' ? (
                         <div className="flex items-center gap-3">
                            <button 
                                type="submit"
                                form="task-form"
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <input 
                                type="text" 
                                className="flex-1 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder:text-slate-400 transition-all"
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
                                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-95"
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