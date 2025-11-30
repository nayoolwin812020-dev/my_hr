const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken, checkPermission } = require('../middleware/authMiddleware');

// Note: Ensure the user accessing these routes has 'admin' level permissions usually.
// For initial setup, you might temporarily disable checkPermission if no admin role exists yet.

// Get all roles
router.get('/roles', verifyToken, roleController.getRoles);

// Create new role
router.post('/roles', verifyToken, checkPermission('user.create'), roleController.createRole); // Example permission requirement

// Get all permissions
router.get('/permissions', verifyToken, roleController.getPermissions);

// Create new permission
router.post('/permissions', verifyToken, checkPermission('user.create'), roleController.createPermission);

// Assign permissions to role
router.post('/assign-permissions', verifyToken, checkPermission('user.create'), roleController.assignPermissions);

module.exports = router;