const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Projects
router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Tasks
router.post('/tasks', projectController.createTask);
router.put('/tasks/:id', projectController.updateTask);
router.post('/tasks/comments', projectController.addTaskComment);

module.exports = router;