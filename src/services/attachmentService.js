const path = require('path');
const fs = require('fs');
const prisma = require('../config/database');
const { createPaginationMeta } = require('../utils/response');
const logger = require('../config/logger');

const UPLOAD_BASE = process.env.UPLOAD_PATH || 'uploads';

// Allowed entity types (whitelist for security)
const ALLOWED_ENTITY_TYPES = [
    'receiving_header', 'receiving_item',
    'qc_result',
    'assembly_order',
    'shipping_order'
];

class AttachmentService {
    getFileUrl(storagePath) {
        // Convert storage_path to public URL
        return '/files/' + storagePath.replace(/\\/g, '/').replace(/^uploads\//, '');
    }

    async saveFiles(files, meta) {
        const { entity_type, entity_id, description, uploaded_by } = meta;

        const records = await Promise.all(files.map(async (file) => {
            const storagePath = file.path.replace(/\\/g, '/');
            const fileUrl = this.getFileUrl(storagePath);

            return prisma.attachments.create({
                data: {
                    entity_type,
                    entity_id,
                    storage_path: storagePath,
                    file_url: fileUrl,
                    file_name: file.originalname,
                    file_type: file.mimetype,
                    file_size: file.size,
                    description: description || null,
                    uploaded_by: uploaded_by || null
                }
            });
        }));

        return records;
    }

    async getByEntity(entityType, entityId) {
        return prisma.attachments.findMany({
            where: { entity_type: entityType, entity_id: entityId },
            orderBy: { created_at: 'asc' }
        });
    }

    async getAll(options = {}) {
        const { page = 1, limit = 10, entity_type, entity_id } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (entity_type) where.entity_type = entity_type;
        if (entity_id) where.entity_id = entity_id;

        const [data, total] = await Promise.all([
            prisma.attachments.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: 'desc' } }),
            prisma.attachments.count({ where })
        ]);

        return { data, meta: createPaginationMeta(page, limit, total) };
    }

    async getById(id) {
        return prisma.attachments.findUnique({ where: { id } });
    }

    async delete(id) {
        const record = await prisma.attachments.findUnique({ where: { id } });
        if (!record) return null;

        // Delete physical file
        const absolutePath = path.resolve(record.storage_path);
        try {
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        } catch (err) {
            logger.warn('Could not delete file from disk', { path: absolutePath, error: err.message });
        }

        return prisma.attachments.delete({ where: { id } });
    }

    getAllowedEntityTypes() {
        return ALLOWED_ENTITY_TYPES;
    }
}

module.exports = new AttachmentService();
