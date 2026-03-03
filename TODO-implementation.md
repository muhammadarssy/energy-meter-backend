# TODO Implementation — Flow 1 & Flow 2
## Energy Meter Unified Backend

> File ini dibuat sebagai panduan implementasi agar bisa dilanjutkan antar sesi.
> Tandai `[x]` ketika selesai. Urutan pengerjaan: **Setup → Flow 1 → Flow 2**.

---

## Status Legend
- `[ ]` belum dikerjakan
- `[~]` sebagian selesai / in progress
- `[x]` selesai

---

## PHASE 0 — Project Setup

> Buat struktur project baru di `energy-meter/`. Belum ada `src/` sama sekali.
> Gunakan pola dari `master-data-services` sebagai referensi (controller/service/route/validation).

### 0.1 Init Project
- [x] Buat `package.json` — dependencies: `express`, `@prisma/client`, `multer`, `sharp`, `archiver`, `joi`, `winston`, `dotenv`, `uuid`, `cors`, `helmet`
- [x] Buat `.env.example` — variabel: `DATABASE_URL`, `PORT`, `UPLOAD_PATH`, `MAX_FILE_SIZE`, `NODE_ENV`
- [x] Buat `src/index.js` — Express entry point, mount semua routes
- [x] Buat `src/config/database.js` — Prisma Client singleton (import dari `../../generated/prisma`)
- [x] Buat `src/config/logger.js` — Winston logger
- [x] Buat `src/utils/response.js` — helper `success.*` dan `error.*`
- [x] Buat `src/middlewares/index.js` — requestId, requestLogger, errorHandler, asyncHandler
- [x] Buat `src/middlewares/validate.js` — wrapper untuk Joi schema validation
- [x] Buat `src/routes/index.js` — mount semua sub-router

### 0.2 Upload Middleware (Attachments)
- [x] Buat `src/middlewares/upload.js` — multer config, disk storage ke `uploads/<entity_type>/YYYY-MM/`
- [x] Config inline di upload.js — allowedMimeTypes, allowedExtensions, maxFileSize 10MB, maxFilesPerUpload 10
- [x] Buat static file server di `src/index.js`: `app.use('/files', express.static(UPLOAD_BASE))`

---

## PHASE 1 — QC Master Data
> Harus ada sebelum Flow 1 & 2 karena keduanya butuh `defect_types`, `qc_templates`, `level_inspections`.

### 1.1 Defect Types
- [x] `src/controllers/defectTypeController.js`
- [x] `src/services/defectTypeService.js`
- [x] `src/validations/defectTypeValidation.js`
- [x] `src/routes/defectTypeRoutes.js`

### 1.2 QC Templates
- [x] `src/controllers/qcTemplateController.js` — includes checklist items endpoints
- [x] `src/services/qcTemplateService.js`
- [x] `src/validations/qcTemplateValidation.js`
- [x] `src/routes/qcTemplateRoutes.js`

### 1.3 Level Inspections
- [x] `src/controllers/levelInspectionController.js`
- [x] `src/services/levelInspectionService.js`
- [x] `src/validations/levelInspectionValidation.js`
- [x] `src/routes/levelInspectionRoutes.js`

---

## PHASE 2 — Flow 1: Receiving

### 2.1 Purchase Orders
- [x] `src/controllers/purchaseOrderController.js`
- [x] `src/services/purchaseOrderService.js`
- [x] `src/validations/purchaseOrderValidation.js`
- [x] `src/routes/purchaseOrderRoutes.js`

### 2.2 Batches
- [x] `src/controllers/batchController.js`
- [x] `src/services/batchService.js`
- [x] `src/validations/batchValidation.js`
- [x] `src/routes/batchRoutes.js`

### 2.3 Receiving Headers
- [x] `src/controllers/receivingHeaderController.js`
- [x] `src/services/receivingHeaderService.js`
- [x] `src/validations/receivingHeaderValidation.js`
- [x] `src/routes/receivingHeaderRoutes.js` — nested `/items` route

### 2.4 Receiving Items
- [x] `src/controllers/receivingItemController.js`
- [x] `src/services/receivingItemService.js`
- [x] `src/validations/receivingItemValidation.js`
- [x] `src/routes/receivingItemRoutes.js` — nested under header
- [x] `src/routes/receivingItemStandaloneRoutes.js` — standalone PATCH/DELETE + nested serials

### 2.5 Serial Stagings — Scan & Count
- [x] `src/controllers/serialStagingController.js`
- [x] `src/services/serialStagingService.js`
- [x] `src/validations/serialStagingValidation.js`
- [x] `src/routes/serialStagingRoutes.js`

### 2.6 Attachments — Upload & Akses
- [x] `src/controllers/attachmentController.js`
- [x] `src/services/attachmentService.js`
- [x] `src/validations/attachmentValidation.js`
- [x] `src/routes/attachmentRoutes.js`
- [ ] **TODO:** Tambah image compression dengan `sharp` di `attachmentService.saveFiles()`

### 2.7 Tracking
- [x] `src/controllers/trackingController.js`
- [x] `src/services/trackingService.js`
- [x] `src/validations/trackingValidation.js`
- [x] `src/routes/trackingRoutes.js`

### 2.8–2.9 QC (Sample Inspection + QC Result + Defects + Production Stop)
- [x] `src/controllers/qcResultController.js` — all QC endpoints in one controller
- [x] `src/services/qcResultService.js` — createSnapshot, calculateResult, createQcResult (transaction)
- [x] `src/validations/qcResultValidation.js`
- [x] `src/routes/qcResultRoutes.js` — sample inspections + QC results + defects
- [x] `src/routes/productionStopRoutes.js`

### 2.10 Warehouse Request — Inbound Receiving + Inbound Assembly
- [x] `src/controllers/warehouseRequestController.js`
- [x] `src/services/warehouseRequestService.js` — approveInboundReceiving + approveInboundAssembly (transactions)
- [x] `src/validations/warehouseRequestValidation.js`
- [x] `src/routes/warehouseRequestRoutes.js`

---

## PHASE 3 — Flow 2: Assembly

### 3.1–3.5 PLN Orders + Assembly Orders + Items + Confirmations + Process
- [x] `src/controllers/assemblyController.js` — semua endpoint Assembly dalam 1 controller
- [x] `src/services/assemblyService.js` — PLN orders, assembly orders, items, confirmItem (transaction), processAssembly (transaction)
- [x] `src/validations/assemblyValidation.js`
- [x] `src/routes/assemblyRoutes.js` — semua route Assembly

### 3.4 Generate PLN Code (Native — referensi generate-pln-code-services)
- [x] `src/utils/checksum.js` — Luhn algorithm: `calculateCheckCode(code)`, `validateCheckCode(fullCode)`
- [x] `src/services/plnCodeService.js` — generatePartial, bulkGeneratePartial, addMaterialInfo, generateComplete, bulkGenerateComplete, markAsLasered, bulkMarkAsLasered, markAsPrinted, bulkMarkAsPrinted, box management, validate
- [x] `src/controllers/plnCodeController.js`
- [x] `src/validations/plnCodeValidation.js`
- [x] `src/routes/plnCodeRoutes.js`

### 3.4a PLN Master Data (material_groups, material_sub_groups, variants, factories)
- [x] `src/services/plnMasterService.js` — CRUD untuk semua 4 tabel
- [x] `src/controllers/plnMasterController.js`
- [x] `src/routes/plnMasterRoutes.js` — di-mount di `/api/pln-master`

### 3.6 QC Assembly
- [x] Reuse `qcResultService.js` + `qcResultController.js` — pass `qc_phase = assembly` dan `assembly_id`

### 3.7 Warehouse Request — Inbound Assembly
- [x] `warehouseRequestService.approveInboundAssembly()` — sudah diimplementasikan di Phase 2.10

---

## PHASE 4 — Routes & Final Setup

- [x] Daftarkan semua routes di `src/routes/index.js`:
  ```
  /api/defect-types
  /api/qc-templates
  /api/level-inspections
  /api/purchase-orders
  /api/batches
  /api/receiving-headers
  /api/receiving-items
  /api/serial-stagings (nested di receiving-items)
  /api/attachments
  /api/tracking
  /api/sample-inspections
  /api/qc-results
  /api/production-stops
  /api/warehouse-requests
  /api/pln-orders
  /api/assembly-orders
  /api/assembly-confirmations
  ```
- [ ] Run `npm install` di `energy-meter/`
- [ ] Run Prisma migration: `npx prisma migrate dev --name init`
- [ ] Run Prisma generate: `npx prisma generate`
- [ ] Copy `.env.example` → `.env`, isi `DATABASE_URL`
- [ ] Test endpoint Flow 1 end-to-end
- [ ] Test endpoint Flow 2 end-to-end

## PHASE 5 — Auth / User Management

### 5.1 Auth (JWT)
- [x] `bcryptjs` + `jsonwebtoken` ditambahkan ke `package.json`
- [x] `src/utils/jwt.js` — `sign()`, `verify()`, `signRefresh()`
- [x] `src/middlewares/auth.js` — `authenticate`, `requireRole`, `requirePermission`
- [x] `src/validations/authValidation.js` — login, register, changePassword, user CRUD, role CRUD, permission CRUD
- [x] `src/services/authService.js` — login (bcrypt), register, changePassword, user CRUD, role CRUD, permission CRUD, assignRoles, assignPermissions
- [x] `src/controllers/authController.js` — POST /auth/login, POST /auth/register, GET /auth/me, PATCH /auth/change-password, full CRUD users/roles/permissions
- [x] `src/routes/authRoutes.js` — mounted at `/api/auth`

### Key Auth Endpoints
```
POST   /api/auth/login            ← public, returns JWT token
POST   /api/auth/register         ← public
GET    /api/auth/me               ← protected (JWT)
PATCH  /api/auth/change-password  ← protected (JWT)
GET    /api/auth/users            ← list users with pagination + search
POST   /api/auth/users            ← create user
PATCH  /api/auth/users/:id        ← update user
DELETE /api/auth/users/:id        ← soft delete
PATCH  /api/auth/users/:id/reset-password
PUT    /api/auth/users/:id/roles
PUT    /api/auth/users/:id/permissions
GET/POST/PATCH/DELETE /api/auth/roles
PUT    /api/auth/roles/:id/permissions
GET/POST/PATCH/DELETE /api/auth/permissions
```

---

## SISA YANG BELUM DIBUAT

- [ ] Image compression dengan `sharp` di `attachmentService.saveFiles()` (currently saves as-is)
- [ ] Warehouse / Stock endpoints standalone (GET warehouses, GET stock-units) — saat ini hanya digunakan internal oleh warehouse request service
- [ ] Tambah `authenticate` middleware ke routes yang perlu dilindungi (saat ini semua routes terbuka)

---

## Urutan Prioritas Pengerjaan

```
Phase 0 (Setup)
    → Phase 1 (QC Master Data)  ← wajib ada sebelum QC step bisa jalan
        → Phase 2.1 (PO)
        → Phase 2.2 (Batch)
        → Phase 2.3 (Receiving Header)
        → Phase 2.4 (Receiving Items)
        → Phase 2.5 (Serial Scan)
        → Phase 2.6 (Attachments)
        → Phase 2.7 (Tracking)
        → Phase 2.8 (Sample Inspection)
        → Phase 2.9 (QC Result + Defect + Stop)
        → Phase 2.10 (Warehouse Request Inbound)
            → Phase 3.1 (PLN Orders)
            → Phase 3.2 (Assembly Orders)
            → Phase 3.3 (Konfirmasi Komponen)
            → Phase 3.4 (PLN Code service)
            → Phase 3.5 (Proses Assembly)
            → Phase 3.6 (QC Assembly) ← reuse Phase 2 services
            → Phase 3.7 (Warehouse Request Assembly)
```

---

## Konteks Penting

### Pola Project (dari master-data-services)
```
src/
  controllers/    ← handle req/res, panggil service
  services/       ← business logic, panggil prisma
  routes/         ← express router
  validations/    ← Zod/Joi schema
  middlewares/    ← errorHandler, validate, upload
  config/         ← database, logger
  utils/          ← response helper
```

### Prisma Client
```js
// src/config/database.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
module.exports = prisma;
```

### Response Helper Pattern
```js
// success
res.json({ success: true, data, message })
// error
res.status(code).json({ success: false, message, errors })
```

### Key Business Rules
1. **Serial scan**: `serial_number` harus `@unique` → DB sudah handle duplikat
2. **QC AQL snapshot**: Saat `sample_inspections` dibuat, SALIN semua nilai dari `level_inspections` (jangan FK saja)
3. **Production stop**: Dibuat otomatis oleh sistem saat defect melebihi `reject_*` threshold
4. **Warehouse approve transaction**: Harus dalam 1 Prisma `$transaction` (stock_units + stock_transactions + tracking update)
5. **Assembly stock reserve**: `RESERVED` saat konfirmasi, `OUT` saat assembly benar-benar dipakai
6. **Attachment file_url**: Format `/files/<entity_type>/<YYYY-MM>/<filename>`, dilayani oleh static server

### File Upload Config
- Max size: 10MB per file
- Max files: 10 per request
- Allowed: `.jpg`, `.jpeg`, `.png`, `.pdf`, `.docx`, `.xlsx`
- Storage path: `uploads/<entity_type>/YYYY-MM/<timestamp>-<uuid>.<ext>`
- Kompres image dengan sharp: max 1920px, quality 80%

### Enum Values (dari schema)
- `DefectCategory`: `critical`, `major`, `minor`
- `QcPhase`: `receiving`, `assembly`, `shipping`
- `QcResultStatus`: (cek schema)
- `ReceivingItemType`: `product`, (cek schema)
- `StockMovementType`: `IN`, `OUT`, `RESERVED`, `RELEASED`, `PENDING`, `TRANSFER`, `ADJUSTMENT`
- `AssemblyStatus`: `pending`, `in_progress`, `partial`, `completed`, `failed`

---

*File ini di-generate pada sesi implementasi. Update `[ ]` ke `[x]` setelah tiap task selesai.*
