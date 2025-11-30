const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

router.get('/', leaveController.getLeaves);
router.post('/', leaveController.requestLeave);
router.put('/:id/status', leaveController.updateLeaveStatus);

module.exports = router;