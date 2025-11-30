const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/rbac', require('./routes/roleRoutes')); // New Role Based Access Control Routes

// Base Route
app.get('/', (req, res) => {
  res.send('OrgAttendance API is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});