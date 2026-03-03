require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./config/logger');
const { requestId, requestLogger, errorHandler, notFoundHandler } = require('./middlewares');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3020;
const NODE_ENV = process.env.NODE_ENV || 'development';
const UPLOAD_BASE = process.env.UPLOAD_PATH || 'uploads';

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true
}));

// Rate limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
}));

// Body parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request tracking
app.use(requestId);
app.use(requestLogger);

// Static file server for uploaded files
app.use('/files', express.static(path.resolve(UPLOAD_BASE)));

// API routes
app.use('/api', routes);

// Root
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Energy Meter Unified API',
        version: '1.0.0',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = () => {
    logger.info('Shutting down server...');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Forced shutdown');
        process.exit(1);
    }, 30000);
};

const server = app.listen(PORT, () => {
    logger.info('Server started', { port: PORT, environment: NODE_ENV });
    if (NODE_ENV === 'development') {
        console.log(`\nEnergy Meter API running at http://localhost:${PORT}\nFiles: http://localhost:${PORT}/files/<path>\nHealth: http://localhost:${PORT}/api/health\n`);
    }
});

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection', { error: err.message, stack: err.stack });
    gracefulShutdown();
});
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    gracefulShutdown();
});
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
