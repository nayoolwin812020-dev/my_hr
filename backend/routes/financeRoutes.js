const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Wallet
router.get('/wallet/:user_id', financeController.getWallet);
router.post('/transaction', financeController.addTransaction);

// Payslips
router.get('/payslips/:user_id', financeController.getPayslips);
router.post('/payslips/generate', financeController.generatePayslip);

module.exports = router;