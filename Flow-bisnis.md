# Flow Bisnis - Energy Meter Manufacturing System

> Template ini dibuat berdasarkan unified schema. Tambahkan detail operasional sesuai kebutuhan.

---

## Daftar Flow

1. [Alur Penerimaan Barang (Receiving)](#1-alur-penerimaan-barang-receiving)
2. [Alur Assembly Product](#2-alur-assembly-product)
3. [Alur Pengiriman (Shipping)](#3-alur-pengiriman-shipping)

---

## 1. Alur Penerimaan Barang (Receiving)

### Gambaran Umum
Barang datang dari supplier → dicatat → upload dokumentasi → QC → masuk gudang.

### Langkah-langkah

#### 1.1 Pembuatan Purchase Order
- **Siapa:** <!-- contoh: Tim Procurement -->
- **Tabel:** `purchase_orders`
- **Aksi:** Buat PO dengan `po_number`, `order_date`, dan referensi user (`user_id`)
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 1.2 Penerimaan Barang (Receiving)
- **Siapa:** <!-- contoh: Staff Gudang / Receiving -->
- **Tabel:** `receiving_headers`, `receiving_items`, `batches`, `serial_stagings`
- **Aksi:**
  1. Buat `batches` dengan kode batch dari supplier
  2. Buat `receiving_headers` → isi `gr_number`, `received_date`, `location`, link ke PO dan batch
  3. Buat `receiving_items` per produk yang diterima (isi `quantity` = jumlah yang dinyatakan di dokumen)

  **Jika produk serialized (`receiving_items.is_serialized = true`):**

  4. Staff scan barcode/QR code tiap unit satu per satu
  5. Tiap scan → buat 1 entry `serial_stagings` dengan:
     - `receiving_item_id` → ID item yang sedang diproses
     - `serial_number` → hasil scan
     - `scanned_by` → ID user yang melakukan scan
     - `scanned_at` → waktu scan (otomatis)
  6. System menampilkan **counting real-time**: `Sudah scan: X / Jumlah dinyatakan: Y`
  7. Jika serial number duplikat → sistem tolak dengan error (dijaga oleh constraint `@unique` pada `serial_number`)
  8. Jika jumlah scan < atau > `quantity` → sistem tampilkan **warning** sebelum lanjut ke step berikutnya
  9. Validasi selesai bila `COUNT(serial_stagings WHERE receiving_item_id = X) == receiving_items.quantity`

- **Status awal:** `receiving_headers.status = pending`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 1.3 Upload Dokumentasi
- **Siapa:** <!-- contoh: Staff Receiving -->
- **Endpoint:** `POST /api/attachments/upload` (di backend energy-meter)
- **Tabel:** `attachments`
- **Aksi:**
  1. **Foto Surat Jalan / Delivery Order (Header)**
     - Upload file ke `POST /api/attachments/upload`
     - Body: `entity_type = "receiving_header"`, `entity_id = <id receiving_headers>`
     - File disimpan di disk → path tersimpan di `attachments.storage_path`
     - URL akses tersimpan di `attachments.file_url`
  2. **Dokumen Per Item (Item Level)**
     - Upload file ke `POST /api/attachments/upload`
     - Body: `entity_type = "receiving_item"`, `entity_id = <id receiving_items>`
  3. **Foto Hasil QC** *(diisi saat step QC, bukan sekarang)*
     - Body: `entity_type = "qc_result"`, `entity_id = <id qc_results>`
- **Format file yang diterima:** JPG, PNG, PDF, DOCX, XLSX — maks 10MB per file
- **Cara akses file:** `GET /files/<path>` (dilayani oleh backend energy-meter)
- **Catatan:** `opsional`
  <!-- Tambahkan catatan operasional di sini, contoh: apakah upload wajib atau opsional -->

#### 1.4 Pembuatan Tracking Item
- **Siapa:** <!-- Sistem otomatis / Staff Receiving -->
- **Tabel:** `tracking`
- **Aksi:** Buat entri `tracking` per `receiving_item` dengan:
  - `tracking_type = receiving`
  - `status = created`
  - Link ke `receiving_item_id`, `product_id`, `batch_id`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 1.5 Quality Control Receiving
- **Siapa:** <!-- contoh: Tim QC -->
- **Microservice:** `tracking-services` (QC dilakukan di microservice terpisah)
- **Tabel:** `level_inspections`, `qc_templates`, `sample_inspections`, `qc_results`, `qc_result_defects`, `production_stops`
- **Aksi:**
  1. **Ambil AQL dari produk** — sistem baca `level_inspections` berdasarkan `product_id`:
     - Ambil: `aql_critical`, `aql_major`, `aql_minor`, `sample_size`, `accept_*`, `reject_*`, `qc_template_id`
  2. **Buat `sample_inspections`** (snapshot AQL saat ini):
     - `qc_phase = receiving`, link `receiving_item_id` + `level_inspection_id` + `qc_template_id`
     - Salin semua nilai AQL dan sampling dari `level_inspections`
  3. **Lakukan inspeksi** sesuai `sample_size` unit yang ditentukan, menggunakan checklist dari `qc_templates.qc_checklist_items`
  4. **Catat setiap defect** → buat `qc_result_defects` per jenis:
     - `defect_type_id` → link ke `defect_types` (pilih dari daftar defect yang relevan)
     - `quantity` → jumlah unit defect tersebut ditemukan
  5. **Upload foto/bukti** QC → `POST /api/attachments/upload` dengan `entity_type = "qc_result"`
  6. **Simpan `qc_results`** → link ke `tracking_id`, `sample_inspection_id`, `qc_template_id`
  7. **Sistem hitung otomatis** total defect per kategori dan bandingkan vs threshold:
     ```
     total_critical = SUM(qty) WHERE defect_type.category = critical
     total_major    = SUM(qty) WHERE defect_type.category = major
     total_minor    = SUM(qty) WHERE defect_type.category = minor

     if total_critical >= reject_critical → STOP (buat production_stops)
     if total_major    >= reject_major    → STOP (buat production_stops)
     if total_minor    >= reject_minor    → STOP (buat production_stops)
     if semua <= accept_* → result = pass
     if antara accept dan reject → result = conditional
     ```
  8. **Update `tracking.status`**:
     - `pass` / `conditional` → `qc_passed`
     - `fail` → `qc_failed`
- **Status QC:** `qc_results.result = pass | fail | conditional`
- **Jika STOP:** `production_stops` dibuat → QA/Supervisor harus review sebelum lanjut
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 1.6 Request Masuk Gudang
- **Siapa:** <!-- contoh: Staff QC / Supervisor Receiving -->
- **Tabel:** `warehouse_requests`
- **Syarat:** QC sudah selesai dan hasil `pass` (atau `conditional`)
- **Aksi:**
  1. Buat `warehouse_requests` dengan:
     - `request_type = inbound_receiving`
     - `receiving_header_id` → link ke receiving yang sudah QC
     - `warehouse_id` → gudang tujuan
  2. Status awal: `pending`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 1.7 Persetujuan & Masuk Stok
- **Siapa:** <!-- contoh: Kepala Gudang -->
- **Tabel:** `warehouse_requests`, `stock_units`, `stock_transactions`
- **Aksi:**
  1. Approve `warehouse_requests` → update `status = approved`, isi `approved_by`, `approved_at`
  2. Update / buat `stock_units` untuk produk di gudang tersebut → tambah `quantity`
  3. Buat `stock_transactions` dengan `movement_type = IN`
  4. Update `tracking.status = stored`
  5. Update `receiving_headers.status = accept`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

### Diagram Flow

```
Supplier datang
    │
    ▼
[purchase_orders] ──► [receiving_headers] ──► [receiving_items]
                                                      │
                                              (is_serialized?)
                                             yes │          │ no
                                                 ▼          ▼
                                     SCANNING SERIAL     (langsung ke
                                     per unit:            Upload Dok)
                                     scan barcode/QR
                                          │
                                     [serial_stagings]
                                     serial_number (unique)
                                     scanned_by (user)
                                     scanned_at (timestamp)
                                          │
                                     counting real-time:
                                     "Scan: X / Dinyatakan: Y"
                                          │
                                   ┌──────┴──────┐
                                duplikat      count != qty
                                   ▼               ▼
                                 ERROR           WARNING
                                 (tolak)      (konfirmasi)
                                          │
                                  (semua scan ok)
                                          │
                    UPLOAD DOKUMENTASI (step 1.3)
                    POST /api/attachments/upload
                             │
                   ┌─────────┴──────────┐
                   ▼                    ▼
         entity_type:            entity_type:
       receiving_header         receiving_item
      (foto surat jalan)      (dokumen per item)
                   └─────────┬──────────┘
                             │ simpan ke [attachments]
                             │ file → disk (uploads/)
                             │ URL → /files/...
                             ▼
                          [tracking]
                       status: created
                             │
                             ▼
               [level_inspections] (baca AQL dari produk)
                             │ snapshot
                             ▼
                    [sample_inspections]
                      qc_phase: receiving
                      level_inspection_id + qc_template_id
                             │
               Inspeksi (sample_size unit)
               gunakan [qc_checklist_items]
                             │
               Catat defect → [qc_result_defects]
               defect_type_id + quantity
               Upload foto → [attachments]
                             │
                             ▼
                         [qc_results]
                      qc_template_id disimpan
                             │
               Sistem hitung total per kategori
               bandingkan vs reject_critical/major/minor
                             │
                    ┌────────┴──────────┐
               melebihi               dalam batas
               threshold              threshold
                    ▼                      ▼
           [production_stops]      pass / conditional
           entity: receiving_header
                    │
          supervisor review
          resolve / override
                             │
                 pass/conditional │ fail
                             ▼      ▼
               [warehouse_requests] (reject/retur)
                 inbound_receiving
                             │
                    approved │
                             ▼
             [stock_units] + [stock_transactions]
                   movement_type: IN
                             │
                             ▼
                      tracking: stored
```

---

## 2. Alur Assembly Product

### Gambaran Umum
Request assembly → gudang konfirmasi komponen → generate PLN serial → assembly + QC → masuk gudang.

### Langkah-langkah

#### 2.1 Pembuatan Assembly Order
- **Siapa:** <!-- contoh: PPIC / Supervisor Produksi -->
- **Tabel:** `assembly_orders`, `assembly_order_items`, `pln_orders`
- **Aksi:**
  1. (Opsional) Buat atau link ke `pln_orders` jika ada pesanan dari PLN
  2. Buat `assembly_orders` dengan:
     - `product_id` → produk yang akan dirakit
     - `quantity` → jumlah yang harus diproduksi
     - `pln_order_id` → (opsional) jika terkait PLN order
  3. Buat `assembly_order_items` → daftar komponen yang dibutuhkan per item
- **Status awal:** `assembly_orders.status = pending`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 2.2 Konfirmasi Komponen oleh Gudang
- **Siapa:** <!-- contoh: Staff Gudang -->
- **Tabel:** `assembly_order_confirmations`, `assembly_order_item_confirmations`, `stock_transactions`
- **Aksi:**
  1. Gudang cek ketersediaan komponen di `stock_units`
  2. Buat `assembly_order_item_confirmations` per komponen:
     - Isi `qty_confirmed`
     - Isi `stock_unit_id` → stok mana yang akan dipakai
     - Buat `stock_transactions` dengan `movement_type = RESERVED` → isi `stock_transaction_id`
  3. Update `stock_units.quantity_reserved` += qty yang direservasi
  4. Buat `assembly_order_confirmations` dengan status hasil konfirmasi
  5. Update `assembly_orders.status = in_progress`, isi `started_at`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 2.3 Generate Serial Number (PLN Code)
- **Siapa:** <!-- Sistem / Staff PLN Code -->
- **Microservice:** `generate-pln-code-services`
- **Tabel:** `pln_codes`, `meter_code_counters`, `boxes`, `box_counters`
- **Aksi:**
  1. Generate `pln_codes` sesuai format PLN:
     - Pilih `material_group`, `material_sub_group`, `variant`, `factory`
     - Generate `meter_unique_code` dari counter (`meter_code_counters`)
     - Hitung `check_code` menggunakan algoritma Luhn
     - Gabung semua menjadi `full_code`
  2. Link ke `assembly_order_id`
  3. Update status seiring proses:
     - `PARTIAL` → `MATERIAL_SELECTED` → `LASERED` → `PRINTED` → `BOXED` → `COMPLETED`
  4. Kelompokkan ke `boxes` → update `box_counters`
- **Validasi Luhn:** dicatat di `luhn_validation_logs`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 2.4 Proses Assembly
- **Siapa:** <!-- contoh: Operator Produksi -->
- **Tabel:** `tracking`, `assembly_components`
- **Aksi:**
  1. Buat `tracking` untuk finished good dengan:
     - `tracking_type = assembly`
     - `pln_code_id` → link ke serial number yang digenerate
     - `assembly_id` → link ke assembly order
  2. Catat pemakaian komponen di `assembly_components`:
     - `parent_tracking_id` → tracking finished good
     - `component_tracking_id` → tracking komponen yang dipakai
  3. Update `stock_transactions` komponen dari `RESERVED` → `OUT`
  4. Update `stock_units.quantity` dan `quantity_reserved` setelah komponen dipakai
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 2.5 Quality Control Assembly
- **Siapa:** <!-- contoh: Tim QC -->
- **Microservice:** `tracking-services`
- **Tabel:** `level_inspections`, `qc_templates`, `sample_inspections`, `qc_results`, `qc_result_defects`, `production_stops`
- **Aksi:**
  1. **Ambil AQL dari produk** — sistem baca `level_inspections` berdasarkan `product_id` finished good
  2. **Buat `sample_inspections`** (snapshot):
     - `qc_phase = assembly`, link `assembly_id` + `level_inspection_id` + `qc_template_id`
     - Salin semua nilai AQL dan sampling dari `level_inspections`
  3. **Lakukan inspeksi** sesuai `sample_size` unit, gunakan checklist dari `qc_templates`
  4. **Catat setiap defect** → buat `qc_result_defects` per jenis defect yang ditemukan
  5. **Upload foto/bukti** QC → `POST /api/attachments/upload` dengan `entity_type = "qc_result"`
  6. **Simpan `qc_results`** → link ke `tracking_id` finished good, `sample_inspection_id`, `qc_template_id`
  7. **Sistem hitung + bandingkan** total defect per kategori vs threshold:
     - Melebihi threshold → STOP assembly order, buat `production_stops` (entity: `assembly_order`)
     - Lulus → `result = pass` atau `conditional`
  8. **Update status:**
     - `pass` / `conditional` → `tracking.status = qc_passed`
     - `fail` → `tracking.status = qc_failed`
     - Jika tidak ada `production_stops` aktif → `assembly_orders.status = completed`, isi `completed_at`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 2.6 Request Masuk Gudang (Finished Goods)
- **Siapa:** <!-- contoh: Supervisor Produksi / QC -->
- **Tabel:** `warehouse_requests`
- **Syarat:** QC assembly sudah selesai dan hasil `pass`
- **Aksi:**
  1. Buat `warehouse_requests` dengan:
     - `request_type = inbound_assembly`
     - `assembly_order_id` → link ke assembly order yang selesai
     - `warehouse_id` → gudang finished goods
  2. Status awal: `pending`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 2.7 Persetujuan & Masuk Stok Finished Goods
- **Siapa:** <!-- contoh: Kepala Gudang Finished Goods -->
- **Tabel:** `warehouse_requests`, `stock_units`, `stock_transactions`
- **Aksi:**
  1. Approve `warehouse_requests` → update `status = approved`
  2. Update / buat `stock_units` untuk finished goods
  3. Buat `stock_transactions` dengan `movement_type = IN`
  4. Update `tracking.status = stored`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

### Diagram Flow

```
[pln_orders] (opsional)
    │
    ▼
[assembly_orders] ──► [assembly_order_items]
    │                  (daftar komponen)
    ▼
Gudang cek stok
    │
    ▼
[assembly_order_item_confirmations]
stock_unit_id + stock_transaction_id (RESERVED)
    │
    ▼
[generate-pln-code-services]
[pln_codes] ──► [boxes] ──► [box_counters]
    │
    ▼
Proses Produksi
[tracking] (tracking_type: assembly)
[assembly_components] (catat komponen yang dipakai)
    │
    ▼
[level_inspections] (baca AQL dari produk)
    │ snapshot
    ▼
[sample_inspections]
qc_phase: assembly
level_inspection_id + qc_template_id
    │
Inspeksi → [qc_result_defects]
defect per kategori (critical/major/minor)
Upload foto → [attachments]
    │
    ▼
[qc_results] + hitung total defect
    │
    ├── melebihi threshold
    │       ▼
    │   [production_stops]
    │   entity: assembly_order
    │   → supervisor resolve dulu
    │
    └── dalam batas threshold
            ▼
         pass / conditional
assembly_orders: completed + completed_at
    │
pass │          │ fail
     ▼          ▼
[warehouse_requests]  (rework / reject)
inbound_assembly
     │
approved │
     ▼
[stock_units] + [stock_transactions]
movement_type: IN (finished goods)
     │
     ▼
tracking: stored
```

---

## 3. Alur Pengiriman (Shipping)

### Gambaran Umum
Request pengiriman dari gudang → QC sebelum kirim → catat pengiriman → selesai.

### Langkah-langkah

#### 3.1 Pembuatan Shipping Order
- **Siapa:** <!-- contoh: Tim Shipping / Sales -->
- **Tabel:** `shipping_orders`, `shipping_items`, `partners`, `carriers`
- **Aksi:**
  1. Pastikan `partners` (vendor/client tujuan) sudah terdaftar
  2. Pastikan `carriers` (ekspedisi) sudah terdaftar
  3. Buat `shipping_orders` dengan:
     - `shipping_type = outbound`
     - `shipping_from_id` → gudang/partner asal
     - `shipping_to_id` → partner/client tujuan
     - `carrier_id` → ekspedisi yang digunakan
  4. Buat `shipping_items` → daftar produk yang akan dikirim beserta `warehouse_id` asalnya
- **Status awal:** `shipping_orders.status = pending`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 3.2 Quality Control Sebelum Kirim
- **Siapa:** <!-- contoh: Tim QC -->
- **Microservice:** `tracking-services`
- **Tabel:** `level_inspections`, `qc_templates`, `sample_inspections`, `qc_results`, `qc_result_defects`
- **Aksi:**
  1. **Ambil AQL dari produk** — sistem baca `level_inspections` berdasarkan `product_id`
  2. **Buat `sample_inspections`** (snapshot):
     - `qc_phase = shipping`, link `shipping_id` + `level_inspection_id` + `qc_template_id`
     - Salin semua nilai AQL dan sampling dari `level_inspections`
  3. **Lakukan inspeksi** sesuai `sample_size` unit, gunakan checklist dari `qc_templates`
  4. **Catat setiap defect** → buat `qc_result_defects` per jenis defect yang ditemukan
  5. **Upload foto/bukti** QC → `POST /api/attachments/upload` dengan `entity_type = "qc_result"`
  6. **Simpan `qc_results`** → link ke `tracking_id`, `sample_inspection_id`, `qc_template_id`
  7. **Sistem hitung + bandingkan** total defect per kategori vs threshold:
     - Melebihi threshold → `result = fail` → **tahan pengiriman** (tidak buat production_stops, shipping ditunda)
     - Lulus → `result = pass` atau `conditional` → lanjut kirim
  8. **Update `tracking.status`**:
     - `pass` / `conditional` → `qc_passed`
     - `fail` → `qc_failed` → `shipping_orders.status` tetap `pending`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 3.3 Pencatatan Pengiriman
- **Siapa:** <!-- contoh: Staff Shipping -->
- **Tabel:** `shipping_details`, `shipping_movements`, `stock_transactions`, `tracking`
- **Aksi:**
  1. Buat `shipping_details` per `shipping_item`:
     - Link `tracking_id` → item yang dikirim
     - Link `batch_id` → (opsional) referensi batch
  2. Buat `stock_transactions` dengan `movement_type = OUT` untuk setiap item dikirim
     - Update `stock_units.quantity` berkurang
  3. Update `tracking.status = shipped`
  4. Update `shipping_orders.status = shipped`, isi `shipped_date`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

#### 3.4 Pemantauan Pergerakan
- **Siapa:** <!-- contoh: Tim Logistik -->
- **Tabel:** `shipping_movements`
- **Aksi:**
  1. Catat setiap pergerakan di `shipping_movements`:
     - `movement_type = dispatch` → saat barang keluar gudang
     - `movement_type = in_transit` → dalam perjalanan
     - `movement_type = delivered` → sudah diterima
  2. Update `shipping_orders.status = delivered` saat konfirmasi terima
  3. Update `tracking.status = delivered`
- **Catatan:**
  <!-- Tambahkan catatan operasional di sini -->

### Diagram Flow

```
[stock_units] (finished goods)
    │
    ▼
[shipping_orders]
shipping_type: outbound
    │
    ▼
[shipping_items]
    │
    ▼
[level_inspections] (baca AQL dari produk)
    │ snapshot
    ▼
[sample_inspections]
qc_phase: shipping
level_inspection_id + qc_template_id
    │
Inspeksi → [qc_result_defects]
defect per kategori (critical/major/minor)
Upload foto → [attachments]
    │
    ▼
[qc_results] + hitung total defect
    │
pass/conditional │ fail
     ▼                ▼
Proses Kirim   (tahan pengiriman)
               shipping_orders: pending
               QC ulang / investigasi
     │
     ▼
[shipping_details] ──► tracking_id (link ke tracking item)
[stock_transactions] movement_type: OUT
tracking: shipped
     │
     ▼
[shipping_movements]
dispatch ──► in_transit ──► delivered
     │
     ▼
shipping_orders: delivered
tracking: delivered
```

---

## Ringkasan Status Per Flow

### Status `tracking`
| Status | Keterangan |
|--------|------------|
| `created` | Item baru dibuat (setelah receiving / assembly selesai) |
| `on_qc` | Sedang dalam proses QC |
| `qc_passed` | Lulus QC |
| `qc_failed` | Gagal QC |
| `in_transit` | Dalam perjalanan (shipping) |
| `stored` | Tersimpan di gudang |
| `shipped` | Sudah dikirim |
| `delivered` | Sudah diterima customer |

### Status `assembly_orders`
| Status | Keterangan |
|--------|------------|
| `pending` | Order dibuat, menunggu konfirmasi komponen |
| `in_progress` | Komponen dikonfirmasi, sedang dikerjakan |
| `partial` | Sebagian selesai |
| `completed` | Assembly selesai |
| `failed` | Assembly gagal |

### Status `stock_transactions.movement_type`
| Tipe | Keterangan |
|------|------------|
| `IN` | Barang masuk gudang (setelah receiving/assembly QC approved) |
| `OUT` | Barang keluar gudang (shipping) |
| `RESERVED` | Komponen di-reserve untuk assembly order |
| `RELEASED` | Reservasi dibatalkan |
| `PENDING` | Menunggu approval warehouse_request |
| `TRANSFER` | Transfer antar gudang |
| `ADJUSTMENT` | Penyesuaian stok manual |

---

## Catatan Tambahan

<!-- Tambahkan catatan operasional, aturan bisnis, atau constraint khusus di sini -->

### Aturan Bisnis
- [ ] <!-- contoh: Minimum QC sample adalah X unit -->
- [ ] <!-- contoh: Assembly order hanya bisa dibuat jika stok komponen >= kebutuhan -->
- [ ] <!-- contoh: Shipping order harus disetujui supervisor sebelum QC -->

### Integrasi Antar Microservice
| Dari Service | Ke Service | Data yang Dikirim |
|---|---|---|
| `receiving-services` | `tracking-services` | `receiving_item_id` setelah receiving selesai |
| `tracking-services` | `warehouse-new-services` | Notifikasi QC pass → trigger warehouse_request |
| `assembly-services` | `generate-pln-code-services` | `assembly_order_id` untuk generate serial |
| `generate-pln-code-services` | `tracking-services` | `pln_code_id` untuk link ke tracking |
| `tracking-services` | `warehouse-new-services` | QC assembly pass → trigger warehouse_request |
| `warehouse-new-services` | `shipping-services` | Konfirmasi stok tersedia untuk shipping |
