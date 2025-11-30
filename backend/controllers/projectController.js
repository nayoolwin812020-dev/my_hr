const db = require('../config/db');

// --- PROJECTS ---

exports.getAllProjects = async (req, res) => {
  try {
    const [projects] = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    
    // Fetch tasks for each project
    for (let project of projects) {
        // Parse JSON fields
        project.tags = project.tags ? JSON.parse(project.tags) : [];
        project.team = project.team_ids ? JSON.parse(project.team_ids) : [];
        
        const [tasks] = await db.query('SELECT * FROM tasks WHERE project_id = ?', [project.id]);
        
        // Fetch comments for tasks
        for (let task of tasks) {
            task.assigneeIds = task.assignee_ids ? JSON.parse(task.assignee_ids) : [];
            const [comments] = await db.query(
                'SELECT tc.*, u.name as user_name, u.avatar_url as user_avatar FROM task_comments tc JOIN users u ON tc.user_id = u.id WHERE task_id = ? ORDER BY created_at ASC', 
                [task.id]
            );
            task.comments = comments.map(c => ({
                id: c.id,
                userId: c.user_id,
                text: c.text,
                createdAt: c.created_at,
                user: { name: c.user_name, avatar: c.user_avatar }
            }));
        }
        project.tasks = tasks;
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, department, assignedTo, authorId, team, deadline, tags } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO projects (title, description, department, assigned_to, author_id, team_ids, deadline, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, department, assignedTo, authorId, JSON.stringify(team), deadline, JSON.stringify(tags)]
    );

    res.status(201).json({ message: 'Project created', projectId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProject = async (req, res) => {
    try {
        const { title, description, status, progress } = req.body;
        await db.query(
            'UPDATE projects SET title = ?, description = ?, status = ?, progress = ? WHERE id = ?',
            [title, description, status, progress, req.params.id]
        );
        res.json({ message: 'Project updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- TASKS ---

exports.createTask = async (req, res) => {
    try {
        const { projectId, title, description, priority, dueDate, assigneeIds } = req.body;
        const [result] = await db.query(
            'INSERT INTO tasks (project_id, title, description, priority, due_date, assignee_ids) VALUES (?, ?, ?, ?, ?, ?)',
            [projectId, title, description, priority, dueDate, JSON.stringify(assigneeIds)]
        );
        res.status(201).json({ message: 'Task created', taskId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { title, description, status, priority, assigneeIds } = req.body;
        await db.query(
            'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, assignee_ids = ? WHERE id = ?',
            [title, description, status, priority, JSON.stringify(assigneeIds), req.params.id]
        );
        
        // Recalculate Project Progress
        const [task] = await db.query('SELECT project_id FROM tasks WHERE id = ?', [req.params.id]);
        if(task.length > 0) {
            const projectId = task[0].project_id;
            const [allTasks] = await db.query('SELECT status FROM tasks WHERE project_id = ?', [projectId]);
            const total = allTasks.length;
            const completed = allTasks.filter(t => t.status === 'DONE').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            await db.query('UPDATE projects SET progress = ? WHERE id = ?', [progress, projectId]);
        }

        res.json({ message: 'Task updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addTaskComment = async (req, res) => {
    try {
        const { taskId, userId, text } = req.body;
        await db.query(
            'INSERT INTO task_comments (task_id, user_id, text) VALUES (?, ?, ?)',
            [taskId, userId, text]
        );
        res.status(201).json({ message: 'Comment added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
