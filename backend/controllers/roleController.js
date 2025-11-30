const db = require('../config/db');

// Get all roles with their permissions
exports.getRoles = async (req, res) => {
  try {
    const [roles] = await db.query('SELECT * FROM roles');
    
    // Fetch permissions for each role
    const rolesWithPermissions = await Promise.all(roles.map(async (role) => {
      const [perms] = await db.query(`
        SELECT p.id, p.name, p.description 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `, [role.id]);
      return { ...role, permissions: perms };
    }));

    res.json(rolesWithPermissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    await db.query('INSERT INTO roles (name, description) VALUES (?, ?)', [name, description]);
    res.status(201).json({ message: 'Role created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all available permissions
exports.getPermissions = async (req, res) => {
  try {
    const [permissions] = await db.query('SELECT * FROM permissions');
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new permission
exports.createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    await db.query('INSERT INTO permissions (name, description) VALUES (?, ?)', [name, description]);
    res.status(201).json({ message: 'Permission created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign permissions to a role
exports.assignPermissions = async (req, res) => {
  try {
    const { roleId, permissionIds } = req.body; // permissionIds is an array of INT

    // 1. Clear existing permissions for this role
    await db.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

    // 2. Insert new permissions
    if (permissionIds && permissionIds.length > 0) {
      const values = permissionIds.map(permId => [roleId, permId]);
      await db.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [values]);
    }

    res.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
