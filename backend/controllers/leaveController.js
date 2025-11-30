const db = require('../config/db');

exports.getLeaves = async (req, res) => {
    try {
        const { user_id, role } = req.query; // If admin, fetch all
        let query = 'SELECT l.*, u.name as user_name, u.avatar_url FROM leaves l JOIN users u ON l.user_id = u.id';
        let params = [];

        if (role !== 'ADMIN' && user_id) {
            query += ' WHERE l.user_id = ?';
            params.push(user_id);
        }
        
        query += ' ORDER BY l.created_at DESC';

        const [leaves] = await db.query(query, params);
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.requestLeave = async (req, res) => {
    try {
        const { userId, type, startDate, endDate, days, reason } = req.body;
        const [result] = await db.query(
            'INSERT INTO leaves (user_id, type, start_date, end_date, days, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, type, startDate, endDate, days, reason]
        );
        res.status(201).json({ message: 'Leave requested', leaveId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body; // APPROVED, REJECTED
        await db.query('UPDATE leaves SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: `Leave ${status.toLowerCase()}` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};