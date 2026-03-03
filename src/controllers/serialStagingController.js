const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { serialStagingValidation } = require('../validations/serialStagingValidation');
const serialStagingService = require('../services/serialStagingService');

// GET /receiving-items/:itemId/serials
const getByItem = asyncHandler(async (req, res) => {
    const result = await serialStagingService.getByItem(req.params.itemId);
    if (!result) return error.notFound(res, 'Receiving item not found');
    return success.ok(res, 'Serials retrieved', result);
});

// GET /receiving-items/:itemId/serials/status
const getStatus = asyncHandler(async (req, res) => {
    const status = await serialStagingService.getCountStatus(req.params.itemId);
    if (!status) return error.notFound(res, 'Receiving item not found');
    return success.ok(res, 'Scan status retrieved', status);
});

// POST /receiving-items/:itemId/serials/scan
const scan = [
    validate(serialStagingValidation.scan),
    asyncHandler(async (req, res) => {
        const { serial_number, scanned_by } = req.body;
        const result = await serialStagingService.scanSerial(
            req.params.itemId,
            serial_number,
            scanned_by
        );
        return success.created(res, 'Serial scanned successfully', result);
    })
];

// POST /receiving-items/:itemId/serials/scan-bulk
const scanBulk = [
    validate(serialStagingValidation.scanBulk),
    asyncHandler(async (req, res) => {
        const { serial_numbers, scanned_by } = req.body;
        const result = await serialStagingService.scanBulk(
            req.params.itemId,
            serial_numbers,
            scanned_by
        );
        const message = result.errors.length > 0
            ? `${result.scanned.length} scanned, ${result.errors.length} failed`
            : `${result.scanned.length} serials scanned successfully`;
        return success.created(res, message, result);
    })
];

// DELETE /receiving-items/:itemId/serials/:serialId
const remove = asyncHandler(async (req, res) => {
    await serialStagingService.deleteSerial(req.params.serialId);
    return success.deleted(res, 'Serial removed');
});

module.exports = { getByItem, getStatus, scan, scanBulk, remove };
