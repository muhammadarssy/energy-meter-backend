const { asyncHandler } = require('../middlewares');
const { success, error } = require('../utils/response');
const { validate } = require('../middlewares/validate');
const { qcResultValidation } = require('../validations/qcResultValidation');
const qcResultService = require('../services/qcResultService');

// ─── Sample Inspections ────────────────────────────────────────────────────────

const getAllSampleInspections = [
    validate(qcResultValidation.sampleInspection.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await qcResultService.getAllSampleInspections(req.query);
        return success.ok(res, 'Sample inspections retrieved', result.data, result.meta);
    })
];

const getSampleInspectionById = asyncHandler(async (req, res) => {
    const item = await qcResultService.getSampleInspectionById(req.params.id);
    if (!item) return error.notFound(res, 'Sample inspection not found');
    return success.ok(res, 'Sample inspection retrieved', item);
});

const createSampleInspection = [
    validate(qcResultValidation.sampleInspection.create),
    asyncHandler(async (req, res) => {
        const item = await qcResultService.createSnapshot(req.body);
        return success.created(res, 'Sample inspection (AQL snapshot) created', item);
    })
];

// ─── QC Results ───────────────────────────────────────────────────────────────

const getAllQcResults = [
    validate(qcResultValidation.query, 'query'),
    asyncHandler(async (req, res) => {
        const result = await qcResultService.getAllQcResults(req.query);
        return success.ok(res, 'QC results retrieved', result.data, result.meta);
    })
];

const getQcResultById = asyncHandler(async (req, res) => {
    const item = await qcResultService.getQcResultById(req.params.id);
    if (!item) return error.notFound(res, 'QC result not found');
    return success.ok(res, 'QC result retrieved', item);
});

const createQcResult = [
    validate(qcResultValidation.create),
    asyncHandler(async (req, res) => {
        const result = await qcResultService.createQcResult(req.body);
        const message = result.production_stops_created > 0
            ? `QC completed — result: ${result.result.toUpperCase()} — ${result.production_stops_created} production stop(s) created`
            : `QC completed — result: ${result.result.toUpperCase()}`;
        return success.created(res, message, result);
    })
];

// ─── QC Result Defects ────────────────────────────────────────────────────────

const addDefect = [
    validate(qcResultValidation.addDefect),
    asyncHandler(async (req, res) => {
        const defect = await qcResultService.addDefect(req.params.resultId, req.body);
        return success.created(res, 'Defect added to QC result', defect);
    })
];

const updateDefect = [
    validate(qcResultValidation.updateDefect),
    asyncHandler(async (req, res) => {
        const defect = await qcResultService.updateDefect(req.params.defectId, req.body);
        return success.updated(res, 'Defect updated', defect);
    })
];

const deleteDefect = asyncHandler(async (req, res) => {
    await qcResultService.deleteDefect(req.params.defectId);
    return success.deleted(res, 'Defect removed');
});

// ─── Production Stops ─────────────────────────────────────────────────────────

const getAllProductionStops = [
    validate(qcResultValidation.productionStopQuery, 'query'),
    asyncHandler(async (req, res) => {
        const result = await qcResultService.getAllProductionStops(req.query);
        return success.ok(res, 'Production stops retrieved', result.data, result.meta);
    })
];

const resolveProductionStop = [
    validate(qcResultValidation.resolveStop),
    asyncHandler(async (req, res) => {
        const stop = await qcResultService.resolveProductionStop(req.params.id, req.body);
        return success.updated(res, 'Production stop resolved', stop);
    })
];

module.exports = {
    getAllSampleInspections, getSampleInspectionById, createSampleInspection,
    getAllQcResults, getQcResultById, createQcResult,
    addDefect, updateDefect, deleteDefect,
    getAllProductionStops, resolveProductionStop
};
