const winston = require('winston');
const path = require('path');

const formatMeta = (meta) => {
    // Hapus internal Winston fields
    const { splat, service, ...rest } = meta;
    if (Object.keys(rest).length === 0) return '';
    return ' | ' + JSON.stringify(rest);
};

const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        const metaStr = formatMeta(meta);
        if (stack) return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}\n${stack}`;
        return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
    })
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), customFormat)
        }),
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            format: customFormat,
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
            format: customFormat,
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});

module.exports = logger;
