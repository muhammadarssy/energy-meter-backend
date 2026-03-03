const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const jwtUtils = require('../utils/jwt');
const { createPaginationMeta } = require('../utils/response');

const SALT_ROUNDS = 10;

class AuthService {
    // ─── Auth ─────────────────────────────────────────────────────────────────

    async login(login, password) {
        // login = username or email
        const user = await prisma.users.findFirst({
            where: {
                deleted_at: null,
                is_active: true,
                OR: [
                    { email: login },
                    { username: login }
                ]
            },
            include: {
                roles: { include: { role: true } },
                permissions: { include: { permission: true } }
            }
        });

        if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

        const roleNames = user.roles.map(ur => ur.role.name);
        const permNames = user.permissions.map(up => up.permission.name);

        const token = jwtUtils.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            roles: roleNames,
            permissions: permNames
        });

        const { password: _pw, ...userWithout } = user;
        return { token, user: userWithout };
    }

    async getMe(userId) {
        const user = await prisma.users.findFirst({
            where: { id: userId, deleted_at: null },
            include: {
                roles: { include: { role: true } },
                permissions: { include: { permission: true } }
            }
        });
        if (!user) return null;
        const { password: _pw, ...rest } = user;
        return rest;
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) throw Object.assign(new Error('Current password is incorrect'), { status: 400 });

        const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
        return prisma.users.update({ where: { id: userId }, data: { password: hashed } });
    }

    // ─── Users ────────────────────────────────────────────────────────────────

    async getAllUsers(options = {}) {
        const { page = 1, limit = 10, search = '', department, is_active } = options;
        const skip = (page - 1) * limit;
        const where = { deleted_at: null };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (department) where.department = { contains: department, mode: 'insensitive' };
        if (is_active !== undefined) where.is_active = is_active;

        const [data, total] = await Promise.all([
            prisma.users.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                select: {
                    id: true, name: true, username: true, email: true,
                    department: true, is_active: true, created_at: true,
                    roles: { include: { role: { select: { id: true, name: true } } } },
                    permissions: { include: { permission: { select: { id: true, name: true } } } }
                }
            }),
            prisma.users.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getUserById(id) {
        const user = await prisma.users.findFirst({
            where: { id, deleted_at: null },
            include: {
                roles: { include: { role: true } },
                permissions: { include: { permission: true } }
            }
        });
        if (!user) return null;
        const { password: _pw, ...rest } = user;
        return rest;
    }

    async createUser(data) {
        const { password, ...rest } = data;
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await prisma.users.create({
            data: { ...rest, password: hashed }
        });
        const { password: _pw, ...result } = user;
        return result;
    }

    async updateUser(id, data) {
        const updated = await prisma.users.update({
            where: { id },
            data
        });
        const { password: _pw, ...result } = updated;
        return result;
    }

    async softDeleteUser(id) {
        return prisma.users.update({
            where: { id },
            data: { deleted_at: new Date(), is_active: false }
        });
    }

    async resetPassword(id, newPassword) {
        const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
        return prisma.users.update({ where: { id }, data: { password: hashed } });
    }

    async assignRoles(userId, roleIds) {
        // Remove existing, then re-assign
        await prisma.user_roles.deleteMany({ where: { user_id: userId } });
        if (roleIds.length > 0) {
            await prisma.user_roles.createMany({
                data: roleIds.map(role_id => ({ user_id: userId, role_id })),
                skipDuplicates: true
            });
        }
        return this.getUserById(userId);
    }

    async assignPermissions(userId, permissionIds) {
        await prisma.user_permissions.deleteMany({ where: { user_id: userId } });
        if (permissionIds.length > 0) {
            await prisma.user_permissions.createMany({
                data: permissionIds.map(permission_id => ({ user_id: userId, permission_id })),
                skipDuplicates: true
            });
        }
        return this.getUserById(userId);
    }

    // ─── Roles ────────────────────────────────────────────────────────────────

    async getAllRoles() {
        return prisma.roles.findMany({
            orderBy: { name: 'asc' },
            include: {
                role_permissions: { include: { permission: true } }
            }
        });
    }

    async getRoleById(id) {
        return prisma.roles.findUnique({
            where: { id },
            include: {
                role_permissions: { include: { permission: true } },
                user_roles: { include: { user: { select: { id: true, name: true, email: true } } } }
            }
        });
    }

    async createRole(data) {
        return prisma.roles.create({ data });
    }

    async updateRole(id, data) {
        return prisma.roles.update({ where: { id }, data });
    }

    async deleteRole(id) {
        return prisma.roles.delete({ where: { id } });
    }

    async assignRolePermissions(roleId, permissionIds) {
        await prisma.role_permissions.deleteMany({ where: { role_id: roleId } });
        if (permissionIds.length > 0) {
            await prisma.role_permissions.createMany({
                data: permissionIds.map(permission_id => ({ role_id: roleId, permission_id })),
                skipDuplicates: true
            });
        }
        return this.getRoleById(roleId);
    }

    // ─── Permissions ──────────────────────────────────────────────────────────

    async getAllPermissions() {
        return prisma.permissions.findMany({ orderBy: { name: 'asc' } });
    }

    async getPermissionById(id) {
        return prisma.permissions.findUnique({ where: { id } });
    }

    async createPermission(data) {
        return prisma.permissions.create({ data });
    }

    async updatePermission(id, data) {
        return prisma.permissions.update({ where: { id }, data });
    }

    async deletePermission(id) {
        return prisma.permissions.delete({ where: { id } });
    }
}

module.exports = new AuthService();
