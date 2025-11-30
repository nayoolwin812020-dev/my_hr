const db = require('../config/db');

exports.getAllEmployees = async (req, res) => {
  try {
    const [employees] = await db.query('SELECT id, employee_id, name, email, role, department, avatar_url, join_date FROM users');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const [employee] = await db.query('SELECT id, employee_id, name, email, role, department, avatar_url, join_date, wallet_balance FROM users WHERE id = ?', [req.params.id]);
    if (employee.length === 0) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, department, avatar_url } = req.body;
        await db.query('UPDATE users SET name = ?, department = ?, avatar_url = ? WHERE id = ?', [name, department, avatar_url, req.params.id]);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};