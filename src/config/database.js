const { PrismaClient } = require('../../generated/prisma');
const logger = require('./logger');

const prisma = new PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' }
    ]
});

prisma.$on('query', (e) => {
    logger.debug('DB Query', { query: e.query, duration: `${e.duration}ms` });
});

prisma.$on('error', (e) => {
    logger.error('DB Error', { message: e.message });
});

prisma.$on('warn', (e) => {
    logger.warn('DB Warning', { message: e.message });
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
});
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
});

module.exports = prisma;
