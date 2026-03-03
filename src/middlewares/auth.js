const jwtUtils = require('../utils/jwt');
const { error } = require('../utils/response');

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return error.unauthorized(res, 'Authentication required');
    }

    const token = header.slice(7);
    try {
        req.user = jwtUtils.verify(token);
        next();
    } catch (err) {
        return error.unauthorized(res, 'Invalid or expired token');
    }
};

/**
 * Require at least one of the given roles.
 * Must be used after authenticate.
 * @param {...string} roles
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) return error.unauthorized(res, 'Authentication required');
    const userRoles = req.user.roles || [];
    const hasRole = roles.some(r => userRoles.includes(r));
    if (!hasRole) return error.forbidden(res, 'Insufficient permissions');
    next();
};

/**
 * Require at least one of the given permissions.
 * Must be used after authenticate.
 * @param {...string} perms
 */
const requirePermission = (...perms) => (req, res, next) => {
    if (!req.user) return error.unauthorized(res, 'Authentication required');
    const userPerms = req.user.permissions || [];
    const hasPermission = perms.some(p => userPerms.includes(p));
    if (!hasPermission) return error.forbidden(res, 'Insufficient permissions');
    next();
};

module.exports = { authenticate, requireRole, requirePermission };
