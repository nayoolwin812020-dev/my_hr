const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/history/:user_id', attendanceController.getHistory);

module.exports = router;