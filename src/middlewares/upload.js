const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_BASE = process.env.UPLOAD_PATH || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_UPLOAD) || 10;

const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.xlsx'];

/**
 * Resolve upload directory for a given entity type.
 * Returns: uploads/<entity_type>/YYYY-MM
 */
const getUploadDir = (entityType) => {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dir = path.join(UPLOAD_BASE, entityType || 'misc', yearMonth);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const entityType = req.body.entity_type || 'misc';
        cb(null, getUploadDir(entityType));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${uuidv4()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES }
});

// Memory storage untuk import file (xlsx) — tidak disimpan ke disk
const uploadMemory = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.xlsx' || ext === '.xls') cb(null, true);
        else cb(new Error('Hanya file .xlsx yang diizinkan'), false);
    },
    limits: { fileSize: MAX_FILE_SIZE, files: 1 }
});

module.exports = { upload, uploadMemory, getUploadDir, UPLOAD_BASE };
