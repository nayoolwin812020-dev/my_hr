const db = require('../config/db');

exports.getWallet = async (req, res) => {
    try {
        const { user_id } = req.params;
        // Get transactions
        const [transactions] = await db.query('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [user_id]);
        
        // Get current balance
        const [user] = await db.query('SELECT wallet_balance FROM users WHERE id = ?', [user_id]);
        
        const txWithTags = transactions.map(t => ({
            ...t,
            tags: t.tags ? JSON.parse(t.tags) : []
        }));

        res.json({ 
            balance: user[0] ? user[0].wallet_balance : 0, 
            transactions: txWithTags 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const { userId, type, amount, title, date, tags } = req.body;
        
        // 1. Insert Transaction
        await db.query(
            'INSERT INTO transactions (user_id, type, amount, title, date, tags) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, type, amount, title, date, JSON.stringify(tags || [])]
        );

        // 2. Update User Wallet Balance
        const operator = type === 'credit' ? '+' : '-';
        await db.query(
            `UPDATE users SET wallet_balance = wallet_balance ${operator} ? WHERE id = ?`,
            [amount, userId]
        );

        res.status(201).json({ message: 'Transaction recorded' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPayslips = async (req, res) => {
    try {
        const { user_id } = req.params;
        const [payslips] = await db.query('SELECT * FROM payslips WHERE user_id = ? ORDER BY generated_date DESC', [user_id]);
        
        const parsedPayslips = payslips.map(p => ({
            ...p,
            items: p.items_json ? JSON.parse(p.items_json) : []
        }));

        res.json(parsedPayslips);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllPayslips = async (req, res) => {
    try {
        const [payslips] = await db.query('SELECT * FROM payslips ORDER BY generated_date DESC');
        
        const parsedPayslips = payslips.map(p => ({
            ...p,
            items: p.items_json ? JSON.parse(p.items_json) : []
        }));

        res.json(parsedPayslips);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.generatePayslip = async (req, res) => {
    try {
        const { userId, month, year, periodStart, periodEnd, basicSalary, totalEarnings, totalDeductions, netSalary, items } = req.body;
        
        const today = new Date().toISOString().split('T')[0];
        const payslipId = `PS-${userId}-${Date.now()}`; // Generate a unique ID logic if needed, usually DB auto-increments ID but here we might want a string ID

        await db.query(
            'INSERT INTO payslips (user_id, month, year, period_start, period_end, generated_date, basic_salary, total_earnings, total_deductions, net_salary, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, month, year, periodStart, periodEnd, today, basicSalary, totalEarnings, totalDeductions, netSalary, JSON.stringify(items)]
        );

        res.status(201).json({ message: 'Payslip generated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};