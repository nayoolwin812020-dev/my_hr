const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Verify Token Validity
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // Remove 'Bearer ' prefix if present
  const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

  jwt.verify(tokenString, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded; // Contains { id, role }
    next();
  });
};

// Check Dynamic Permission
exports.checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      // 1. Get Role ID from Role Name
      const [roles] = await db.query('SELECT id FROM roles WHERE name = ?', [userRole]);
      
      if (roles.length === 0) {
        // Fallback: If role not in DB yet but exists in User table (e.g. legacy data), deny or handle gracefully
        // For security, strict deny if role config missing
        return res.status(403).json({ message: 'Role configuration not found' });
      }

      const roleId = roles[0].id;

      // 2. Check if this Role has the Required Permission
      const [permissions] = await db.query(`
        SELECT p.name 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ? AND p.name = ?
      `, [roleId, requiredPermission]);

      if (permissions.length > 0) {
        next(); // Permission granted
      } else {
        return res.status(403).json({ message: `Access denied. Requires permission: ${requiredPermission}` });
      }
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Server error during authorization' });
    }
  };
};