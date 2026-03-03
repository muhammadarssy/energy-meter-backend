const winston = require('winston');
const path = require('path');

const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        if (stack) return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
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
