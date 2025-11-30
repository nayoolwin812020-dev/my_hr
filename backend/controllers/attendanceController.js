const db = require('../config/db');

exports.checkIn = async (req, res) => {
  try {
    const { user_id, photo_url, location } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Check if already checked in
    const [existing] = await db.query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [user_id, today]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    // Determine status (Simple logic: Late after 09:00)
    const hour = new Date().getHours();
    const status = hour >= 9 && new Date().getMinutes() > 0 ? 'LATE' : 'PRESENT';

    await db.query(
      'INSERT INTO attendance (user_id, date, check_in_time, status, photo_url, location) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, today, time, status, photo_url, location]
    );

    res.status(201).json({ message: 'Check-in successful', status, time });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { user_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });

    await db.query(
      'UPDATE attendance SET check_out_time = ? WHERE user_id = ? AND date = ?',
      [time, user_id, today]
    );

    // Logic to credit daily salary to wallet could go here or via a trigger/service

    res.json({ message: 'Check-out successful', time });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHistory = async (req, res) => {
    try {
        const { user_id } = req.params;
        const [history] = await db.query('SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC', [user_id]);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};