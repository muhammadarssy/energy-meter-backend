const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { authValidation } = require('../validations/authValidation');
const authService = require('../services/authService');

// ─── Auth ─────────────────────────────────────────────────────────────────────

const login = [
    validate(authValidation.login),
    asyncHandler(async (req, res) => {
        try {
            const result = await authService.login(req.body.login, req.body.password);
            return success.ok(res, 'Login successful', result);
        } catch (err) {
            if (err.status === 401) return error.unauthorized(res, err.message);
            throw err;
        }
    })
];

const register = [
    validate(authValidation.register),
    asyncHandler(async (req, res) => {
        const item = await authService.createUser(req.body);
        return success.created(res, 'User registered', item);
    })
];

const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    if (!user) return error.notFound(res, 'User not found');
    return success.ok(res, 'Profile retrieved', user);
});

const changePassword = [
    validate(authValidation.changePassword),
    asyncHandler(async (req, res) => {
        try {
            await authService.changePassword(req.user.id, req.body.current_password, req.body.new_password);
            return success.ok(res, 'Password changed');
        } catch (err) {
            if (err.status === 400) return error.badRequest(res, err.message);
            throw err;
        }
    })
];

// ─── Users CRUD ───────────────────────────────────────────────────────────────

const getAllUsers = [
    validate(authValidation.user.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await authService.getAllUsers(req.query);
        return success.ok(res, 'Users retrieved', result.data, result.meta);
    })
];

const getUserById = asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.params.id);
    if (!user) return error.notFound(res, 'User not found');
    return success.ok(res, 'User retrieved', user);
});

const createUser = [
    validate(authValidation.user.create),
    asyncHandler(async (req, res) => {
        const user = await authService.createUser(req.body);
        return success.created(res, 'User created', user);
    })
];

const updateUser = [
    validate(authValidation.user.update),
    asyncHandler(async (req, res) => {
        const existing = await authService.getUserById(req.params.id);
        if (!existing) return error.notFound(res, 'User not found');
        const updated = await authService.updateUser(req.params.id, req.body);
        return success.updated(res, 'User updated', updated);
    })
];

const deleteUser = asyncHandler(async (req, res) => {
    const existing = await authService.getUserById(req.params.id);
    if (!existing) return error.notFound(res, 'User not found');
    await authService.softDeleteUser(req.params.id);
    return success.deleted(res, 'User deleted');
});

const resetUserPassword = asyncHandler(async (req, res) => {
    const existing = await authService.getUserById(req.params.id);
    if (!existing) return error.notFound(res, 'User not found');
    const newPassword = req.body.new_password;
    if (!newPassword || newPassword.length < 6) {
        return error.badRequest(res, 'new_password must be at least 6 characters');
    }
    await authService.resetPassword(req.params.id, newPassword);
    return success.ok(res, 'Password reset');
});

const assignUserRoles = [
    validate(authValidation.user.assignRoles),
    asyncHandler(async (req, res) => {
        const existing = await authService.getUserById(req.params.id);
        if (!existing) return error.notFound(res, 'User not found');
        const updated = await authService.assignRoles(req.params.id, req.body.role_ids);
        return success.updated(res, 'Roles assigned', updated);
    })
];

const assignUserPermissions = [
    validate(authValidation.user.assignPermissions),
    asyncHandler(async (req, res) => {
        const existing = await authService.getUserById(req.params.id);
        if (!existing) return error.notFound(res, 'User not found');
        const updated = await authService.assignPermissions(req.params.id, req.body.permission_ids);
        return success.updated(res, 'Permissions assigned', updated);
    })
];

// ─── Roles CRUD ───────────────────────────────────────────────────────────────

const getAllRoles = asyncHandler(async (req, res) => {
    const roles = await authService.getAllRoles();
    return success.ok(res, 'Roles retrieved', roles);
});

const getRoleById = asyncHandler(async (req, res) => {
    const role = await authService.getRoleById(req.params.id);
    if (!role) return error.notFound(res, 'Role not found');
    return success.ok(res, 'Role retrieved', role);
});

const createRole = [
    validate(authValidation.role.create),
    asyncHandler(async (req, res) => {
        const role = await authService.createRole(req.body);
        return success.created(res, 'Role created', role);
    })
];

const updateRole = [
    validate(authValidation.role.update),
    asyncHandler(async (req, res) => {
        const existing = await authService.getRoleById(req.params.id);
        if (!existing) return error.notFound(res, 'Role not found');
        const updated = await authService.updateRole(req.params.id, req.body);
        return success.updated(res, 'Role updated', updated);
    })
];

const deleteRole = asyncHandler(async (req, res) => {
    const existing = await authService.getRoleById(req.params.id);
    if (!existing) return error.notFound(res, 'Role not found');
    await authService.deleteRole(req.params.id);
    return success.deleted(res, 'Role deleted');
});

const assignRolePermissions = [
    validate(authValidation.role.assignPermissions),
    asyncHandler(async (req, res) => {
        const existing = await authService.getRoleById(req.params.id);
        if (!existing) return error.notFound(res, 'Role not found');
        const updated = await authService.assignRolePermissions(req.params.id, req.body.permission_ids);
        return success.updated(res, 'Permissions assigned to role', updated);
    })
];

// ─── Permissions CRUD ─────────────────────────────────────────────────────────

const getAllPermissions = asyncHandler(async (req, res) => {
    const perms = await authService.getAllPermissions();
    return success.ok(res, 'Permissions retrieved', perms);
});

const getPermissionById = asyncHandler(async (req, res) => {
    const perm = await authService.getPermissionById(req.params.id);
    if (!perm) return error.notFound(res, 'Permission not found');
    return success.ok(res, 'Permission retrieved', perm);
});

const createPermission = [
    validate(authValidation.permission.create),
    asyncHandler(async (req, res) => {
        const perm = await authService.createPermission(req.body);
        return success.created(res, 'Permission created', perm);
    })
];

const updatePermission = [
    validate(authValidation.permission.update),
    asyncHandler(async (req, res) => {
        const existing = await authService.getPermissionById(req.params.id);
        if (!existing) return error.notFound(res, 'Permission not found');
        const updated = await authService.updatePermission(req.params.id, req.body);
        return success.updated(res, 'Permission updated', updated);
    })
];

const deletePermission = asyncHandler(async (req, res) => {
    const existing = await authService.getPermissionById(req.params.id);
    if (!existing) return error.notFound(res, 'Permission not found');
    await authService.deletePermission(req.params.id);
    return success.deleted(res, 'Permission deleted');
});

module.exports = {
    login, register, getMe, changePassword,
    getAllUsers, getUserById, createUser, updateUser, deleteUser, resetUserPassword,
    assignUserRoles, assignUserPermissions,
    getAllRoles, getRoleById, createRole, updateRole, deleteRole, assignRolePermissions,
    getAllPermissions, getPermissionById, createPermission, updatePermission, deletePermission
};
