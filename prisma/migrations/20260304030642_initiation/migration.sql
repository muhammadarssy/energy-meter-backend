-- CreateEnum
CREATE TYPE "AssemblyStatus" AS ENUM ('pending', 'in_progress', 'partial', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT', 'RESERVED', 'RELEASED', 'PENDING', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TrackingStatus" AS ENUM ('created', 'on_qc', 'qc_passed', 'qc_failed', 'in_transit', 'stored', 'shipped', 'delivered');

-- CreateEnum
CREATE TYPE "TrackingType" AS ENUM ('receiving', 'assembly', 'shipping');

-- CreateEnum
CREATE TYPE "ShippingStatus" AS ENUM ('pending', 'shipped', 'delivered', 'canceled');

-- CreateEnum
CREATE TYPE "ShippingMovementType" AS ENUM ('dispatch', 'in_transit', 'delivered');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('vendor', 'client');

-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "PlnCodeStatus" AS ENUM ('PARTIAL', 'PRINTED', 'MATERIAL_SELECTED', 'COMPLETED', 'LASERED', 'BOXED');

-- CreateEnum
CREATE TYPE "BoxStatus" AS ENUM ('OPEN', 'SEALED', 'SHIPPED');

-- CreateEnum
CREATE TYPE "ReceivingStatus" AS ENUM ('pending', 'accept', 'reject');

-- CreateEnum
CREATE TYPE "QcResultStatus" AS ENUM ('pass', 'fail', 'conditional');

-- CreateEnum
CREATE TYPE "ReceivingItemType" AS ENUM ('product', 'service', 'material');

-- CreateEnum
CREATE TYPE "QcPhase" AS ENUM ('receiving', 'assembly', 'shipping');

-- CreateEnum
CREATE TYPE "WarehouseRequestType" AS ENUM ('inbound_receiving', 'inbound_assembly');

-- CreateEnum
CREATE TYPE "WarehouseRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "DefectCategory" AS ENUM ('critical', 'major', 'minor');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sap_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "product_type_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "is_serialize" BOOLEAN NOT NULL DEFAULT true,
    "qc_product" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_qc" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category_mappings" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_category_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_components" (
    "id" TEXT NOT NULL,
    "parent_product_id" TEXT NOT NULL,
    "component_product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_inspections" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "aql_critical" DOUBLE PRECISION NOT NULL,
    "aql_major" DOUBLE PRECISION NOT NULL,
    "aql_minor" DOUBLE PRECISION NOT NULL,
    "sample_size" INTEGER,
    "accept_critical" INTEGER,
    "accept_major" INTEGER,
    "accept_minor" INTEGER,
    "reject_critical" INTEGER,
    "reject_major" INTEGER,
    "reject_minor" INTEGER,
    "qc_template_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defect_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DefectCategory" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "defect_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_inspection_defects" (
    "id" TEXT NOT NULL,
    "level_inspection_id" TEXT NOT NULL,
    "defect_type_id" TEXT NOT NULL,

    CONSTRAINT "level_inspection_defects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "qc_phase" "QcPhase" NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qc_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_checklist_items" (
    "id" TEXT NOT NULL,
    "qc_template_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qc_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_groups" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_sub_groups" (
    "id" TEXT NOT NULL,
    "material_group_id" TEXT NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_sub_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variants" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(7) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factories" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(4) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pln_codes" (
    "id" TEXT NOT NULL,
    "full_code" VARCHAR(50),
    "material_group_id" TEXT,
    "material_sub_group_id" TEXT,
    "variant_id" TEXT,
    "factory_id" TEXT NOT NULL,
    "tag" VARCHAR(4) NOT NULL,
    "meter_unique_code" VARCHAR(8) NOT NULL,
    "check_code" VARCHAR(1) NOT NULL,
    "status" "PlnCodeStatus" NOT NULL DEFAULT 'PARTIAL',
    "assembly_order_id" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "is_lasered" BOOLEAN NOT NULL DEFAULT false,
    "lasered_at" TIMESTAMP(3),
    "laser_notes" TEXT,
    "is_printed" BOOLEAN NOT NULL DEFAULT false,
    "printed_at" TIMESTAMP(3),
    "print_notes" TEXT,
    "box_id" TEXT,
    "created_by_id" TEXT,
    "lasered_by_id" TEXT,
    "printed_by_id" TEXT,

    CONSTRAINT "pln_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meter_code_counters" (
    "id" TEXT NOT NULL,
    "factory_id" TEXT NOT NULL,
    "last_counter" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meter_code_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boxes" (
    "id" TEXT NOT NULL,
    "box_number" TEXT NOT NULL,
    "assembly_order_id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 12,
    "qr_code" TEXT,
    "status" "BoxStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sealed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_by_id" TEXT,
    "sealed_by_id" TEXT,

    CONSTRAINT "boxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "box_counters" (
    "id" TEXT NOT NULL,
    "assembly_order_id" TEXT NOT NULL,
    "last_counter" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "box_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_units" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
    "quantity_pending" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transactions" (
    "id" TEXT NOT NULL,
    "stock_unit_id" TEXT NOT NULL,
    "performed_by" TEXT,
    "movement_type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reference_id" TEXT,
    "reference_type" TEXT,
    "movement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "tracking_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_requests" (
    "id" TEXT NOT NULL,
    "request_type" "WarehouseRequestType" NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "status" "WarehouseRequestStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "receiving_header_id" TEXT,
    "assembly_order_id" TEXT,

    CONSTRAINT "warehouse_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "supplier_id" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receiving_headers" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "assembly_order_id" TEXT,
    "gr_number" TEXT NOT NULL,
    "notes" TEXT,
    "image_url" TEXT,
    "received_by" TEXT NOT NULL,
    "received_date" TIMESTAMP(3) NOT NULL,
    "status" "ReceivingStatus" NOT NULL DEFAULT 'pending',
    "batch_id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "receiving_headers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receiving_items" (
    "id" TEXT NOT NULL,
    "receiving_header_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "is_serialized" BOOLEAN NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "item_type" "ReceivingItemType" NOT NULL DEFAULT 'product',
    "documentation_uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receiving_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serial_stagings" (
    "id" TEXT NOT NULL,
    "receiving_item_id" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "scanned_by" TEXT,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serial_stagings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pln_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pln_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assembly_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "pln_order_id" TEXT,
    "request_by" TEXT,
    "quantity" INTEGER NOT NULL,
    "status" "AssemblyStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assembly_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assembly_order_items" (
    "id" TEXT NOT NULL,
    "assembly_order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "qty_request" INTEGER NOT NULL,
    "qty_confirmed" INTEGER NOT NULL DEFAULT 0,
    "qty_fulfilled" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "is_serialized" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assembly_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assembly_order_confirmations" (
    "id" TEXT NOT NULL,
    "assembly_order_id" TEXT NOT NULL,
    "confirmed_by" TEXT NOT NULL,
    "status" "AssemblyStatus" NOT NULL,
    "confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "assembly_order_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assembly_order_item_confirmations" (
    "id" TEXT NOT NULL,
    "assembly_order_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "qty_confirmed" INTEGER NOT NULL,
    "note" TEXT,
    "stock_unit_id" TEXT,
    "stock_transaction_id" TEXT,

    CONSTRAINT "assembly_order_item_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking" (
    "id" TEXT NOT NULL,
    "code_item" TEXT NOT NULL,
    "is_serialize" BOOLEAN NOT NULL,
    "serial_number" TEXT,
    "product_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "tracking_type" "TrackingType" NOT NULL DEFAULT 'receiving',
    "status" "TrackingStatus" NOT NULL DEFAULT 'created',
    "original_quantity" INTEGER NOT NULL DEFAULT 1,
    "current_quantity" INTEGER NOT NULL DEFAULT 1,
    "consumed_quantity" INTEGER NOT NULL DEFAULT 0,
    "pln_code_id" TEXT,
    "receiving_item_id" TEXT,
    "assembly_id" TEXT,
    "shipping_id" TEXT,
    "pln_order_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_results" (
    "id" TEXT NOT NULL,
    "tracking_id" TEXT NOT NULL,
    "inspector_by" TEXT NOT NULL,
    "inspection_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "QcResultStatus" NOT NULL,
    "qc_template_id" TEXT,
    "qc_place" TEXT NOT NULL DEFAULT 'Unknown',
    "notes" TEXT,
    "sample_inspection_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qc_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assembly_components" (
    "id" TEXT NOT NULL,
    "parent_tracking_id" TEXT NOT NULL,
    "component_tracking_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assembly_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_inspections" (
    "id" TEXT NOT NULL,
    "qc_phase" "QcPhase" NOT NULL DEFAULT 'receiving',
    "receiving_item_id" TEXT,
    "assembly_id" TEXT,
    "shipping_id" TEXT,
    "level_inspection_id" TEXT,
    "qc_template_id" TEXT,
    "inspection_level" TEXT NOT NULL,
    "aql_critical" DOUBLE PRECISION NOT NULL,
    "aql_major" DOUBLE PRECISION NOT NULL,
    "aql_minor" DOUBLE PRECISION NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "accept_critical" INTEGER NOT NULL,
    "accept_major" INTEGER NOT NULL,
    "accept_minor" INTEGER NOT NULL,
    "reject_critical" INTEGER NOT NULL,
    "reject_major" INTEGER NOT NULL,
    "reject_minor" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sample_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_result_defects" (
    "id" TEXT NOT NULL,
    "qc_result_id" TEXT NOT NULL,
    "defect_type_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qc_result_defects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_stops" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "qc_result_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "critical_found" INTEGER NOT NULL DEFAULT 0,
    "major_found" INTEGER NOT NULL DEFAULT 0,
    "minor_found" INTEGER NOT NULL DEFAULT 0,
    "reject_critical" INTEGER NOT NULL,
    "reject_major" INTEGER NOT NULL,
    "reject_minor" INTEGER NOT NULL,
    "triggered_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "contact_info" TEXT,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "shipping_type" "ShippingType" NOT NULL DEFAULT 'outbound',
    "shipping_from_id" TEXT,
    "shipping_to_id" TEXT,
    "carrier_id" TEXT,
    "shipped_by" TEXT,
    "shipped_date" TIMESTAMP(3),
    "status" "ShippingStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "shipping_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_items" (
    "id" TEXT NOT NULL,
    "shipping_order_id" TEXT NOT NULL,
    "warehouse_id" TEXT,
    "product_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "is_serialize" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_movements" (
    "id" TEXT NOT NULL,
    "shipping_item_id" TEXT NOT NULL,
    "movement_type" "ShippingMovementType",
    "handled_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_details" (
    "id" TEXT NOT NULL,
    "shipping_item_id" TEXT NOT NULL,
    "tracking_id" TEXT,
    "batch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER,
    "description" TEXT,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luhn_validation_logs" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL,
    "action" TEXT NOT NULL,
    "check_digit" INTEGER,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "luhn_validation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_key" ON "user_permissions"("user_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "suppliers_deleted_at_idx" ON "suppliers"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_types_code_key" ON "product_types"("code");

-- CreateIndex
CREATE INDEX "product_types_deleted_at_idx" ON "product_types"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_code_key" ON "product_categories"("code");

-- CreateIndex
CREATE INDEX "product_categories_deleted_at_idx" ON "product_categories"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "products_sap_code_key" ON "products"("sap_code");

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE INDEX "products_product_type_id_idx" ON "products"("product_type_id");

-- CreateIndex
CREATE INDEX "products_supplier_id_idx" ON "products"("supplier_id");

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "products"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_mappings_product_id_category_id_key" ON "product_category_mappings"("product_id", "category_id");

-- CreateIndex
CREATE INDEX "level_inspections_product_id_is_active_idx" ON "level_inspections"("product_id", "is_active");

-- CreateIndex
CREATE INDEX "level_inspections_qc_template_id_idx" ON "level_inspections"("qc_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "defect_types_code_key" ON "defect_types"("code");

-- CreateIndex
CREATE INDEX "defect_types_category_idx" ON "defect_types"("category");

-- CreateIndex
CREATE INDEX "defect_types_is_active_idx" ON "defect_types"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "level_inspection_defects_level_inspection_id_defect_type_id_key" ON "level_inspection_defects"("level_inspection_id", "defect_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "qc_templates_code_key" ON "qc_templates"("code");

-- CreateIndex
CREATE INDEX "qc_templates_qc_phase_display_order_idx" ON "qc_templates"("qc_phase", "display_order");

-- CreateIndex
CREATE INDEX "qc_templates_is_active_idx" ON "qc_templates"("is_active");

-- CreateIndex
CREATE INDEX "qc_checklist_items_qc_template_id_display_order_idx" ON "qc_checklist_items"("qc_template_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "material_groups_code_key" ON "material_groups"("code");

-- CreateIndex
CREATE UNIQUE INDEX "material_sub_groups_material_group_id_code_key" ON "material_sub_groups"("material_group_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "variants_code_key" ON "variants"("code");

-- CreateIndex
CREATE UNIQUE INDEX "factories_code_key" ON "factories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pln_codes_full_code_key" ON "pln_codes"("full_code");

-- CreateIndex
CREATE INDEX "pln_codes_material_group_id_idx" ON "pln_codes"("material_group_id");

-- CreateIndex
CREATE INDEX "pln_codes_material_sub_group_id_idx" ON "pln_codes"("material_sub_group_id");

-- CreateIndex
CREATE INDEX "pln_codes_variant_id_idx" ON "pln_codes"("variant_id");

-- CreateIndex
CREATE INDEX "pln_codes_factory_id_idx" ON "pln_codes"("factory_id");

-- CreateIndex
CREATE INDEX "pln_codes_meter_unique_code_idx" ON "pln_codes"("meter_unique_code");

-- CreateIndex
CREATE INDEX "pln_codes_generated_at_idx" ON "pln_codes"("generated_at");

-- CreateIndex
CREATE INDEX "pln_codes_is_lasered_idx" ON "pln_codes"("is_lasered");

-- CreateIndex
CREATE INDEX "pln_codes_is_printed_idx" ON "pln_codes"("is_printed");

-- CreateIndex
CREATE INDEX "pln_codes_status_idx" ON "pln_codes"("status");

-- CreateIndex
CREATE INDEX "pln_codes_box_id_idx" ON "pln_codes"("box_id");

-- CreateIndex
CREATE INDEX "pln_codes_assembly_order_id_idx" ON "pln_codes"("assembly_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "meter_code_counters_factory_id_key" ON "meter_code_counters"("factory_id");

-- CreateIndex
CREATE UNIQUE INDEX "boxes_box_number_key" ON "boxes"("box_number");

-- CreateIndex
CREATE INDEX "boxes_status_idx" ON "boxes"("status");

-- CreateIndex
CREATE INDEX "boxes_created_at_idx" ON "boxes"("created_at");

-- CreateIndex
CREATE INDEX "boxes_assembly_order_id_idx" ON "boxes"("assembly_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "box_counters_assembly_order_id_key" ON "box_counters"("assembly_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_deleted_at_idx" ON "warehouses"("deleted_at");

-- CreateIndex
CREATE INDEX "stock_units_warehouse_id_product_id_idx" ON "stock_units"("warehouse_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_units_warehouse_id_product_id_key" ON "stock_units"("warehouse_id", "product_id");

-- CreateIndex
CREATE INDEX "stock_transactions_movement_date_idx" ON "stock_transactions"("movement_date");

-- CreateIndex
CREATE INDEX "stock_transactions_movement_type_idx" ON "stock_transactions"("movement_type");

-- CreateIndex
CREATE INDEX "stock_transactions_stock_unit_id_idx" ON "stock_transactions"("stock_unit_id");

-- CreateIndex
CREATE INDEX "stock_transactions_reference_id_idx" ON "stock_transactions"("reference_id");

-- CreateIndex
CREATE INDEX "warehouse_requests_status_idx" ON "warehouse_requests"("status");

-- CreateIndex
CREATE INDEX "warehouse_requests_request_type_idx" ON "warehouse_requests"("request_type");

-- CreateIndex
CREATE INDEX "warehouse_requests_receiving_header_id_idx" ON "warehouse_requests"("receiving_header_id");

-- CreateIndex
CREATE INDEX "warehouse_requests_assembly_order_id_idx" ON "warehouse_requests"("assembly_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "batches_code_key" ON "batches"("code");

-- CreateIndex
CREATE INDEX "batches_deleted_at_idx" ON "batches"("deleted_at");

-- CreateIndex
CREATE INDEX "batches_supplier_id_idx" ON "batches"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_number_key" ON "purchase_orders"("po_number");

-- CreateIndex
CREATE INDEX "purchase_orders_order_date_idx" ON "purchase_orders"("order_date");

-- CreateIndex
CREATE INDEX "purchase_orders_deleted_at_idx" ON "purchase_orders"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "receiving_headers_gr_number_key" ON "receiving_headers"("gr_number");

-- CreateIndex
CREATE INDEX "receiving_headers_status_idx" ON "receiving_headers"("status");

-- CreateIndex
CREATE INDEX "receiving_headers_batch_id_idx" ON "receiving_headers"("batch_id");

-- CreateIndex
CREATE INDEX "receiving_headers_received_date_idx" ON "receiving_headers"("received_date");

-- CreateIndex
CREATE INDEX "receiving_headers_deleted_at_idx" ON "receiving_headers"("deleted_at");

-- CreateIndex
CREATE INDEX "receiving_items_product_id_idx" ON "receiving_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "serial_stagings_serial_number_key" ON "serial_stagings"("serial_number");

-- CreateIndex
CREATE INDEX "serial_stagings_receiving_item_id_idx" ON "serial_stagings"("receiving_item_id");

-- CreateIndex
CREATE INDEX "serial_stagings_scanned_by_idx" ON "serial_stagings"("scanned_by");

-- CreateIndex
CREATE UNIQUE INDEX "pln_orders_order_number_key" ON "pln_orders"("order_number");

-- CreateIndex
CREATE INDEX "pln_orders_order_date_idx" ON "pln_orders"("order_date");

-- CreateIndex
CREATE INDEX "pln_orders_deadline_idx" ON "pln_orders"("deadline");

-- CreateIndex
CREATE INDEX "pln_orders_deleted_at_idx" ON "pln_orders"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "assembly_orders_order_number_key" ON "assembly_orders"("order_number");

-- CreateIndex
CREATE INDEX "assembly_orders_status_idx" ON "assembly_orders"("status");

-- CreateIndex
CREATE INDEX "assembly_orders_product_id_idx" ON "assembly_orders"("product_id");

-- CreateIndex
CREATE INDEX "assembly_orders_created_at_idx" ON "assembly_orders"("created_at");

-- CreateIndex
CREATE INDEX "assembly_orders_deleted_at_idx" ON "assembly_orders"("deleted_at");

-- CreateIndex
CREATE INDEX "assembly_order_confirmations_assembly_order_id_idx" ON "assembly_order_confirmations"("assembly_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_code_item_key" ON "tracking"("code_item");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_serial_number_key" ON "tracking"("serial_number");

-- CreateIndex
CREATE INDEX "tracking_status_idx" ON "tracking"("status");

-- CreateIndex
CREATE INDEX "tracking_product_id_idx" ON "tracking"("product_id");

-- CreateIndex
CREATE INDEX "tracking_batch_id_idx" ON "tracking"("batch_id");

-- CreateIndex
CREATE INDEX "tracking_tracking_type_idx" ON "tracking"("tracking_type");

-- CreateIndex
CREATE INDEX "tracking_created_at_idx" ON "tracking"("created_at");

-- CreateIndex
CREATE INDEX "tracking_deleted_at_idx" ON "tracking"("deleted_at");

-- CreateIndex
CREATE INDEX "qc_results_tracking_id_idx" ON "qc_results"("tracking_id");

-- CreateIndex
CREATE INDEX "qc_results_result_idx" ON "qc_results"("result");

-- CreateIndex
CREATE INDEX "qc_results_inspection_date_idx" ON "qc_results"("inspection_date");

-- CreateIndex
CREATE INDEX "qc_results_qc_template_id_idx" ON "qc_results"("qc_template_id");

-- CreateIndex
CREATE INDEX "sample_inspections_qc_phase_idx" ON "sample_inspections"("qc_phase");

-- CreateIndex
CREATE INDEX "sample_inspections_level_inspection_id_idx" ON "sample_inspections"("level_inspection_id");

-- CreateIndex
CREATE INDEX "sample_inspections_qc_template_id_idx" ON "sample_inspections"("qc_template_id");

-- CreateIndex
CREATE INDEX "qc_result_defects_qc_result_id_idx" ON "qc_result_defects"("qc_result_id");

-- CreateIndex
CREATE INDEX "production_stops_entity_type_entity_id_idx" ON "production_stops"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "production_stops_resolved_at_idx" ON "production_stops"("resolved_at");

-- CreateIndex
CREATE INDEX "partners_deleted_at_idx" ON "partners"("deleted_at");

-- CreateIndex
CREATE INDEX "carriers_deleted_at_idx" ON "carriers"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_orders_order_number_key" ON "shipping_orders"("order_number");

-- CreateIndex
CREATE INDEX "shipping_orders_status_idx" ON "shipping_orders"("status");

-- CreateIndex
CREATE INDEX "shipping_orders_shipped_date_idx" ON "shipping_orders"("shipped_date");

-- CreateIndex
CREATE INDEX "shipping_orders_shipping_type_idx" ON "shipping_orders"("shipping_type");

-- CreateIndex
CREATE INDEX "shipping_orders_deleted_at_idx" ON "shipping_orders"("deleted_at");

-- CreateIndex
CREATE INDEX "attachments_entity_type_entity_id_idx" ON "attachments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "attachments_uploaded_by_idx" ON "attachments"("uploaded_by");

-- CreateIndex
CREATE INDEX "luhn_validation_logs_created_at_idx" ON "luhn_validation_logs"("created_at");

-- CreateIndex
CREATE INDEX "luhn_validation_logs_number_idx" ON "luhn_validation_logs"("number");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category_mappings" ADD CONSTRAINT "product_category_mappings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category_mappings" ADD CONSTRAINT "product_category_mappings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_components" ADD CONSTRAINT "product_components_parent_product_id_fkey" FOREIGN KEY ("parent_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_components" ADD CONSTRAINT "product_components_component_product_id_fkey" FOREIGN KEY ("component_product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_inspections" ADD CONSTRAINT "level_inspections_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_inspections" ADD CONSTRAINT "level_inspections_qc_template_id_fkey" FOREIGN KEY ("qc_template_id") REFERENCES "qc_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_inspection_defects" ADD CONSTRAINT "level_inspection_defects_level_inspection_id_fkey" FOREIGN KEY ("level_inspection_id") REFERENCES "level_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_inspection_defects" ADD CONSTRAINT "level_inspection_defects_defect_type_id_fkey" FOREIGN KEY ("defect_type_id") REFERENCES "defect_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_checklist_items" ADD CONSTRAINT "qc_checklist_items_qc_template_id_fkey" FOREIGN KEY ("qc_template_id") REFERENCES "qc_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_sub_groups" ADD CONSTRAINT "material_sub_groups_material_group_id_fkey" FOREIGN KEY ("material_group_id") REFERENCES "material_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pln_codes" ADD CONSTRAINT "pln_codes_material_group_id_fkey" FOREIGN KEY ("material_group_id") REFERENCES "material_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pln_codes" ADD CONSTRAINT "pln_codes_material_sub_group_id_fkey" FOREIGN KEY ("material_sub_group_id") REFERENCES "material_sub_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pln_codes" ADD CONSTRAINT "pln_codes_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pln_codes" ADD CONSTRAINT "pln_codes_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pln_codes" ADD CONSTRAINT "pln_codes_box_id_fkey" FOREIGN KEY ("box_id") REFERENCES "boxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pln_codes" ADD CONSTRAINT "pln_codes_assembly_order_id_fkey" FOREIGN KEY ("assembly_order_id") REFERENCES "assembly_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pln_codes" ADD CONSTRAINT "pln_codes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pln_codes" ADD CONSTRAINT "pln_codes_lasered_by_id_fkey" FOREIGN KEY ("lasered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pln_codes" ADD CONSTRAINT "pln_codes_printed_by_id_fkey" FOREIGN KEY ("printed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_code_counters" ADD CONSTRAINT "meter_code_counters_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_assembly_order_id_fkey" FOREIGN KEY ("assembly_order_id") REFERENCES "assembly_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_sealed_by_id_fkey" FOREIGN KEY ("sealed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "box_counters" ADD CONSTRAINT "box_counters_assembly_order_id_fkey" FOREIGN KEY ("assembly_order_id") REFERENCES "assembly_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_units" ADD CONSTRAINT "stock_units_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_units" ADD CONSTRAINT "stock_units_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_stock_unit_id_fkey" FOREIGN KEY ("stock_unit_id") REFERENCES "stock_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_tracking_id_fkey" FOREIGN KEY ("tracking_id") REFERENCES "tracking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_requests" ADD CONSTRAINT "warehouse_requests_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_requests" ADD CONSTRAINT "warehouse_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_requests" ADD CONSTRAINT "warehouse_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_requests" ADD CONSTRAINT "warehouse_requests_receiving_header_id_fkey" FOREIGN KEY ("receiving_header_id") REFERENCES "receiving_headers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_requests" ADD CONSTRAINT "warehouse_requests_assembly_order_id_fkey" FOREIGN KEY ("assembly_order_id") REFERENCES "assembly_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_headers" ADD CONSTRAINT "receiving_headers_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_headers" ADD CONSTRAINT "receiving_headers_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_headers" ADD CONSTRAINT "receiving_headers_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_headers" ADD CONSTRAINT "receiving_headers_assembly_order_id_fkey" FOREIGN KEY ("assembly_order_id") REFERENCES "assembly_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_items" ADD CONSTRAINT "receiving_items_receiving_header_id_fkey" FOREIGN KEY ("receiving_header_id") REFERENCES "receiving_headers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_items" ADD CONSTRAINT "receiving_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_stagings" ADD CONSTRAINT "serial_stagings_receiving_item_id_fkey" FOREIGN KEY ("receiving_item_id") REFERENCES "receiving_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_stagings" ADD CONSTRAINT "serial_stagings_scanned_by_fkey" FOREIGN KEY ("scanned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_orders" ADD CONSTRAINT "assembly_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_orders" ADD CONSTRAINT "assembly_orders_pln_order_id_fkey" FOREIGN KEY ("pln_order_id") REFERENCES "pln_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_orders" ADD CONSTRAINT "assembly_orders_request_by_fkey" FOREIGN KEY ("request_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_order_items" ADD CONSTRAINT "assembly_order_items_assembly_order_id_fkey" FOREIGN KEY ("assembly_order_id") REFERENCES "assembly_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_order_items" ADD CONSTRAINT "assembly_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_order_confirmations" ADD CONSTRAINT "assembly_order_confirmations_assembly_order_id_fkey" FOREIGN KEY ("assembly_order_id") REFERENCES "assembly_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_order_confirmations" ADD CONSTRAINT "assembly_order_confirmations_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_order_item_confirmations" ADD CONSTRAINT "assembly_order_item_confirmations_assembly_order_id_fkey" FOREIGN KEY ("assembly_order_id") REFERENCES "assembly_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_order_item_confirmations" ADD CONSTRAINT "assembly_order_item_confirmations_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "assembly_order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_order_item_confirmations" ADD CONSTRAINT "assembly_order_item_confirmations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_order_item_confirmations" ADD CONSTRAINT "assembly_order_item_confirmations_stock_unit_id_fkey" FOREIGN KEY ("stock_unit_id") REFERENCES "stock_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_order_item_confirmations" ADD CONSTRAINT "assembly_order_item_confirmations_stock_transaction_id_fkey" FOREIGN KEY ("stock_transaction_id") REFERENCES "stock_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking" ADD CONSTRAINT "tracking_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking" ADD CONSTRAINT "tracking_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking" ADD CONSTRAINT "tracking_pln_code_id_fkey" FOREIGN KEY ("pln_code_id") REFERENCES "pln_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking" ADD CONSTRAINT "tracking_receiving_item_id_fkey" FOREIGN KEY ("receiving_item_id") REFERENCES "receiving_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking" ADD CONSTRAINT "tracking_assembly_id_fkey" FOREIGN KEY ("assembly_id") REFERENCES "assembly_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking" ADD CONSTRAINT "tracking_shipping_id_fkey" FOREIGN KEY ("shipping_id") REFERENCES "shipping_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking" ADD CONSTRAINT "tracking_pln_order_id_fkey" FOREIGN KEY ("pln_order_id") REFERENCES "pln_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_results" ADD CONSTRAINT "qc_results_tracking_id_fkey" FOREIGN KEY ("tracking_id") REFERENCES "tracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_results" ADD CONSTRAINT "qc_results_inspector_by_fkey" FOREIGN KEY ("inspector_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_results" ADD CONSTRAINT "qc_results_sample_inspection_id_fkey" FOREIGN KEY ("sample_inspection_id") REFERENCES "sample_inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_results" ADD CONSTRAINT "qc_results_qc_template_id_fkey" FOREIGN KEY ("qc_template_id") REFERENCES "qc_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_components" ADD CONSTRAINT "assembly_components_parent_tracking_id_fkey" FOREIGN KEY ("parent_tracking_id") REFERENCES "tracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assembly_components" ADD CONSTRAINT "assembly_components_component_tracking_id_fkey" FOREIGN KEY ("component_tracking_id") REFERENCES "tracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_inspections" ADD CONSTRAINT "sample_inspections_receiving_item_id_fkey" FOREIGN KEY ("receiving_item_id") REFERENCES "receiving_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_inspections" ADD CONSTRAINT "sample_inspections_assembly_id_fkey" FOREIGN KEY ("assembly_id") REFERENCES "assembly_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_inspections" ADD CONSTRAINT "sample_inspections_shipping_id_fkey" FOREIGN KEY ("shipping_id") REFERENCES "shipping_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_inspections" ADD CONSTRAINT "sample_inspections_level_inspection_id_fkey" FOREIGN KEY ("level_inspection_id") REFERENCES "level_inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_inspections" ADD CONSTRAINT "sample_inspections_qc_template_id_fkey" FOREIGN KEY ("qc_template_id") REFERENCES "qc_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_result_defects" ADD CONSTRAINT "qc_result_defects_qc_result_id_fkey" FOREIGN KEY ("qc_result_id") REFERENCES "qc_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_result_defects" ADD CONSTRAINT "qc_result_defects_defect_type_id_fkey" FOREIGN KEY ("defect_type_id") REFERENCES "defect_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_stops" ADD CONSTRAINT "production_stops_qc_result_id_fkey" FOREIGN KEY ("qc_result_id") REFERENCES "qc_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_stops" ADD CONSTRAINT "production_stops_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_orders" ADD CONSTRAINT "shipping_orders_shipping_from_id_fkey" FOREIGN KEY ("shipping_from_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_orders" ADD CONSTRAINT "shipping_orders_shipping_to_id_fkey" FOREIGN KEY ("shipping_to_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_orders" ADD CONSTRAINT "shipping_orders_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_orders" ADD CONSTRAINT "shipping_orders_shipped_by_fkey" FOREIGN KEY ("shipped_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_items" ADD CONSTRAINT "shipping_items_shipping_order_id_fkey" FOREIGN KEY ("shipping_order_id") REFERENCES "shipping_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_items" ADD CONSTRAINT "shipping_items_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_items" ADD CONSTRAINT "shipping_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_movements" ADD CONSTRAINT "shipping_movements_shipping_item_id_fkey" FOREIGN KEY ("shipping_item_id") REFERENCES "shipping_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_movements" ADD CONSTRAINT "shipping_movements_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_details" ADD CONSTRAINT "shipping_details_shipping_item_id_fkey" FOREIGN KEY ("shipping_item_id") REFERENCES "shipping_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_details" ADD CONSTRAINT "shipping_details_tracking_id_fkey" FOREIGN KEY ("tracking_id") REFERENCES "tracking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_details" ADD CONSTRAINT "shipping_details_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
