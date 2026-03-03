const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'change_this_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const jwtUtils = {
    sign(payload) {
        return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
    },

    signRefresh(payload) {
        return jwt.sign(payload, SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    },

    verify(token) {
        return jwt.verify(token, SECRET);
    },

    decode(token) {
        return jwt.decode(token);
    }
};

module.exports = jwtUtils;
