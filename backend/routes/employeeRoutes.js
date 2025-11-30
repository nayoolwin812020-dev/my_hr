const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Middleware to verify token should be added here in a real app
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', employeeController.updateProfile);

module.exports = router;