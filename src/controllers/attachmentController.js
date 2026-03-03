const { asyncHandler } = require('../middlewares');
const { upload } = require('../middlewares/upload');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { attachmentValidation } = require('../validations/attachmentValidation');
const attachmentService = require('../services/attachmentService');

// POST /api/attachments/upload
// multipart/form-data: files[], entity_type, entity_id, description, uploaded_by
const uploadFiles = [
    upload.array('files', 10),
    validate(attachmentValidation.upload, 'body'),
    asyncHandler(async (req, res) => {
        if (!req.files || req.files.length === 0) {
            return error.badRequest(res, 'No files uploaded');
        }

        const records = await attachmentService.saveFiles(req.files, req.body);
        return success.created(res, `${records.length} file(s) uploaded`, records);
    })
];

// GET /api/attachments
const getAll = [
    validate(attachmentValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await attachmentService.getAll(req.query);
        return success.ok(res, 'Attachments retrieved', result.data, result.meta);
    })
];

// GET /api/attachments/entity/:entityType/:entityId
const getByEntity = asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.params;
    const items = await attachmentService.getByEntity(entityType, entityId);
    return success.ok(res, 'Attachments retrieved', items);
});

// GET /api/attachments/:id
const getById = asyncHandler(async (req, res) => {
    const item = await attachmentService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Attachment not found');
    return success.ok(res, 'Attachment retrieved', item);
});

// DELETE /api/attachments/:id
const remove = asyncHandler(async (req, res) => {
    const item = await attachmentService.getById(req.params.id);
    if (!item) return error.notFound(res, 'Attachment not found');
    await attachmentService.delete(req.params.id);
    return success.deleted(res, 'Attachment deleted');
});

module.exports = { uploadFiles, getAll, getByEntity, getById, remove };
