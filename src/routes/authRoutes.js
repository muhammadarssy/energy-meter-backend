const express = require('express');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// ─── Public Auth ──────────────────────────────────────────────────────────────
router.post('/login', ctrl.login);
router.post('/register', ctrl.register);

// ─── Protected Auth ───────────────────────────────────────────────────────────
router.get('/me', authenticate, ctrl.getMe);
router.patch('/change-password', authenticate, ctrl.changePassword);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', authenticate, ctrl.getAllUsers);
router.get('/users/:id', authenticate, ctrl.getUserById);
router.post('/users', authenticate, ctrl.createUser);
router.patch('/users/:id', authenticate, ctrl.updateUser);
router.delete('/users/:id', authenticate, ctrl.deleteUser);
router.patch('/users/:id/reset-password', authenticate, ctrl.resetUserPassword);
router.put('/users/:id/roles', authenticate, ctrl.assignUserRoles);
router.put('/users/:id/permissions', authenticate, ctrl.assignUserPermissions);

// ─── Roles ────────────────────────────────────────────────────────────────────
router.get('/roles', authenticate, ctrl.getAllRoles);
router.get('/roles/:id', authenticate, ctrl.getRoleById);
router.post('/roles', authenticate, ctrl.createRole);
router.patch('/roles/:id', authenticate, ctrl.updateRole);
router.delete('/roles/:id', authenticate, ctrl.deleteRole);
router.put('/roles/:id/permissions', authenticate, ctrl.assignRolePermissions);

// ─── Permissions ──────────────────────────────────────────────────────────────
router.get('/permissions', authenticate, ctrl.getAllPermissions);
router.get('/permissions/:id', authenticate, ctrl.getPermissionById);
router.post('/permissions', authenticate, ctrl.createPermission);
router.patch('/permissions/:id', authenticate, ctrl.updatePermission);
router.delete('/permissions/:id', authenticate, ctrl.deletePermission);

module.exports = router;
