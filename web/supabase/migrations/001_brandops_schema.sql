-- ============================================================================
-- BrandOps MVP Schema
-- Migration: 001_brandops_schema.sql
--
-- Creates all 13 tables for the BrandOps merch operations platform.
-- RLS policies: org_id-based isolation.
-- Run this in Supabase Dashboard → SQL Editor.
-- ============================================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ORGANIZATIONS (extend existing if needed) ──────────────────────────────

-- If organizations table already exists from the main SAAS platform, skip this.
-- Otherwise, create a minimal version:
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  primary_color TEXT DEFAULT '#6366F1',
  default_margin_percent NUMERIC(5,2) DEFAULT 35.00,
  currency TEXT DEFAULT 'USD',
  salesforce_enabled BOOLEAN DEFAULT FALSE,
  payment_terms_default TEXT DEFAULT 'net30',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If organization_members already exists, skip:
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'sales', 'production', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ─── CLIENTS ─────────────────────────────────────────────────────────────────

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  billing_address JSONB DEFAULT '{}',
  shipping_address JSONB,
  payment_terms TEXT DEFAULT 'net30' CHECK (payment_terms IN ('prepay', 'net15', 'net30', 'net45', 'net60')),
  credit_limit NUMERIC(12,2),
  tax_exempt BOOLEAN DEFAULT FALSE,
  tax_id TEXT,
  annual_volume NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_org ON clients(org_id);

-- ─── CLIENT CONTACTS ─────────────────────────────────────────────────────────

CREATE TABLE client_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'primary' CHECK (role IN ('primary', 'order', 'finance', 'marketing', 'other')),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_contacts_client ON client_contacts(client_id);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  internal_sku TEXT,
  category TEXT DEFAULT 'other' CHECK (category IN (
    'short-sleeve-tees', 'long-sleeve-tees', 'sweatshirts-hoodies',
    'polos', 'jackets-outerwear', 'hats-caps', 'bags-totes',
    'drinkware', 'office-supplies', 'tech-accessories',
    'stickers-patches', 'koozies', 'lanyards-badges', 'other'
  )),
  description TEXT,
  primary_image_url TEXT,
  additional_images JSONB DEFAULT '[]',
  available_colors JSONB DEFAULT '[]',       -- [{name, hex, swatch_url}]
  available_sizes JSONB DEFAULT '[]',        -- ["S","M","L","XL"]
  blank_costs JSONB DEFAULT '[]',            -- [{min_quantity, max_quantity, cost_per_unit}]
  applicable_decorations JSONB DEFAULT '[]', -- ["screen-print","embroidery"]
  supplier_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  show_on_website BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_org ON products(org_id);
CREATE INDEX idx_products_category ON products(org_id, category);

-- ─── DECORATOR MATRICES ──────────────────────────────────────────────────────

CREATE TABLE decorator_matrices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  decoration_method TEXT NOT NULL CHECK (decoration_method IN (
    'screen-print', 'embroidery', 'dtg', 'heat-transfer',
    'sublimation', 'laser-engrave', 'pad-print', 'deboss', 'other'
  )),
  pricing_tiers JSONB DEFAULT '[]',  -- [{min_quantity, max_quantity, prices_by_colors: {1: 2.50, 2: 3.65}}]
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matrices_org ON decorator_matrices(org_id);

-- ─── PROJECTS ────────────────────────────────────────────────────────────────

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_number TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'opportunity' CHECK (status IN (
    'opportunity', 'qualifying', 'curating', 'in-design',
    'client-review', 'confirmed',
    'order-entry', 'in-production', 'shipped', 'cancelled'
  )),
  source TEXT DEFAULT 'direct' CHECK (source IN ('website', 'direct', 'referral', 'program')),
  in_hands_date DATE,
  budget NUMERIC(12,2),
  is_critical BOOLEAN DEFAULT FALSE,
  estimated_total NUMERIC(12,2) DEFAULT 0,
  internal_notes TEXT,
  client_notes TEXT,
  shareable_link UUID DEFAULT uuid_generate_v4(),
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_projects_number ON projects(org_id, project_number);
CREATE INDEX idx_projects_org_status ON projects(org_id, status);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE UNIQUE INDEX idx_projects_shareable ON projects(shareable_link);

-- ─── PROJECT LINE ITEMS ──────────────────────────────────────────────────────

CREATE TABLE project_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image_url TEXT,
  selected_color TEXT,
  selected_sizes JSONB DEFAULT '[]',       -- [{size, quantity}]
  total_quantity INTEGER DEFAULT 0,
  decorations JSONB DEFAULT '[]',          -- [{id, location, method, color_count, decoration_cost, notes}]
  add_ons JSONB DEFAULT '[]',              -- [{name, cost_per_unit}]
  unit_cost NUMERIC(10,4) DEFAULT 0,
  margin_percent NUMERIC(5,2) DEFAULT 35,
  unit_price NUMERIC(10,4) DEFAULT 0,
  subtotal NUMERIC(12,2) DEFAULT 0,
  art_received BOOLEAN DEFAULT FALSE,
  artwork_files JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_line_items_project ON project_line_items(project_id);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  line_item_id UUID REFERENCES project_line_items(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  salesforce_id TEXT,
  status TEXT DEFAULT 'order-entry-needed' CHECK (status IN (
    'order-entry-needed', 'entered', 'in-production',
    'shipped', 'ready-for-invoicing', 'invoiced', 'cancelled'
  )),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,4) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  in_hands_date DATE,
  ship_to JSONB DEFAULT '{}',              -- {street, city, state, zip, country}
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,
  shipped_date DATE,
  invoice_amount NUMERIC(12,2),
  payment_received BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_orders_number ON orders(org_id, order_number);
CREATE INDEX idx_orders_org_status ON orders(org_id, status);
CREATE INDEX idx_orders_project ON orders(project_id);

-- ─── SPLIT SHIPMENTS ─────────────────────────────────────────────────────────

CREATE TABLE split_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  address JSONB NOT NULL,                  -- {street, city, state, zip, country}
  tracking_number TEXT,
  carrier TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_split_shipments_order ON split_shipments(order_id);

-- ─── PROGRAMS ────────────────────────────────────────────────────────────────

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'employee-store' CHECK (type IN (
    'employee-store', 'uniform-program', 'event-merch', 'drop-ship', 'budget-managed'
  )),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  budget_total NUMERIC(12,2),
  budget_spent NUMERIC(12,2) DEFAULT 0,
  budget_remaining NUMERIC(12,2) DEFAULT 0,
  locations_count INTEGER DEFAULT 0,
  approval_required BOOLEAN DEFAULT FALSE,
  auto_reorder BOOLEAN DEFAULT FALSE,
  reorder_frequency TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_programs_org ON programs(org_id);
CREATE INDEX idx_programs_client ON programs(client_id);

-- ─── PROGRAM LOCATIONS ───────────────────────────────────────────────────────

CREATE TABLE program_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address JSONB NOT NULL,
  budget_allocation NUMERIC(12,2),
  contact_name TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_program_locations_program ON program_locations(program_id);

-- ─── COMMISSION RECORDS ──────────────────────────────────────────────────────

CREATE TABLE commission_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  period TEXT NOT NULL,                    -- "2026-02"
  gross_revenue NUMERIC(12,2) NOT NULL,
  gross_profit NUMERIC(12,2) NOT NULL,
  profit_margin_percent NUMERIC(5,2) NOT NULL,
  owner_share NUMERIC(12,2) NOT NULL,
  partner_commission NUMERIC(12,2) NOT NULL,
  source TEXT CHECK (source IN ('website', 'direct', 'referral', 'program')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_org_period ON commission_records(org_id, period);
CREATE INDEX idx_commissions_project ON commission_records(project_id);

-- ─── AUTO-INCREMENT PROJECT NUMBER FUNCTION ──────────────────────────────────

CREATE OR REPLACE FUNCTION generate_project_number(p_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_num INTEGER;
  year_str TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(project_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM projects
  WHERE org_id = p_org_id
    AND project_number LIKE 'PRJ-' || year_str || '-%';

  RETURN 'PRJ-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

-- ─── AUTO-INCREMENT ORDER NUMBER FUNCTION ────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_order_number(p_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_num INTEGER;
  year_str TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(order_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM orders
  WHERE org_id = p_org_id
    AND order_number LIKE 'ORD-' || year_str || '-%';

  RETURN 'ORD-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all mutable tables
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_matrices_updated_at BEFORE UPDATE ON decorator_matrices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_line_items_updated_at BEFORE UPDATE ON project_line_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────────────

-- Helper: check if user is member of org
CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
  );
END;
$$;

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE decorator_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;

-- Clients: org members can CRUD
CREATE POLICY clients_select ON clients FOR SELECT USING (is_org_member(org_id));
CREATE POLICY clients_insert ON clients FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY clients_update ON clients FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY clients_delete ON clients FOR DELETE USING (is_org_member(org_id));

-- Client contacts: access via client's org
CREATE POLICY contacts_select ON client_contacts FOR SELECT
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_contacts.client_id AND is_org_member(clients.org_id)));
CREATE POLICY contacts_insert ON client_contacts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_contacts.client_id AND is_org_member(clients.org_id)));
CREATE POLICY contacts_update ON client_contacts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_contacts.client_id AND is_org_member(clients.org_id)));
CREATE POLICY contacts_delete ON client_contacts FOR DELETE
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = client_contacts.client_id AND is_org_member(clients.org_id)));

-- Products: org members can CRUD
CREATE POLICY products_select ON products FOR SELECT USING (is_org_member(org_id));
CREATE POLICY products_insert ON products FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY products_update ON products FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY products_delete ON products FOR DELETE USING (is_org_member(org_id));

-- Decorator matrices: org members can CRUD
CREATE POLICY matrices_select ON decorator_matrices FOR SELECT USING (is_org_member(org_id));
CREATE POLICY matrices_insert ON decorator_matrices FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY matrices_update ON decorator_matrices FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY matrices_delete ON decorator_matrices FOR DELETE USING (is_org_member(org_id));

-- Projects: org members can CRUD
CREATE POLICY projects_select ON projects FOR SELECT USING (is_org_member(org_id));
CREATE POLICY projects_insert ON projects FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY projects_update ON projects FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY projects_delete ON projects FOR DELETE USING (is_org_member(org_id));

-- Project line items: access via project's org
CREATE POLICY line_items_select ON project_line_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_line_items.project_id AND is_org_member(projects.org_id)));
CREATE POLICY line_items_insert ON project_line_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_line_items.project_id AND is_org_member(projects.org_id)));
CREATE POLICY line_items_update ON project_line_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_line_items.project_id AND is_org_member(projects.org_id)));
CREATE POLICY line_items_delete ON project_line_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_line_items.project_id AND is_org_member(projects.org_id)));

-- Orders: org members can CRUD
CREATE POLICY orders_select ON orders FOR SELECT USING (is_org_member(org_id));
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY orders_update ON orders FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY orders_delete ON orders FOR DELETE USING (is_org_member(org_id));

-- Split shipments: access via order's org
CREATE POLICY shipments_select ON split_shipments FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = split_shipments.order_id AND is_org_member(orders.org_id)));
CREATE POLICY shipments_insert ON split_shipments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = split_shipments.order_id AND is_org_member(orders.org_id)));
CREATE POLICY shipments_update ON split_shipments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = split_shipments.order_id AND is_org_member(orders.org_id)));
CREATE POLICY shipments_delete ON split_shipments FOR DELETE
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = split_shipments.order_id AND is_org_member(orders.org_id)));

-- Programs: org members can CRUD
CREATE POLICY programs_select ON programs FOR SELECT USING (is_org_member(org_id));
CREATE POLICY programs_insert ON programs FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY programs_update ON programs FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY programs_delete ON programs FOR DELETE USING (is_org_member(org_id));

-- Program locations: access via program's org
CREATE POLICY locations_select ON program_locations FOR SELECT
  USING (EXISTS (SELECT 1 FROM programs WHERE programs.id = program_locations.program_id AND is_org_member(programs.org_id)));
CREATE POLICY locations_insert ON program_locations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM programs WHERE programs.id = program_locations.program_id AND is_org_member(programs.org_id)));
CREATE POLICY locations_update ON program_locations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM programs WHERE programs.id = program_locations.program_id AND is_org_member(programs.org_id)));
CREATE POLICY locations_delete ON program_locations FOR DELETE
  USING (EXISTS (SELECT 1 FROM programs WHERE programs.id = program_locations.program_id AND is_org_member(programs.org_id)));

-- Commission records: org members can read, admin+ can write
CREATE POLICY commissions_select ON commission_records FOR SELECT USING (is_org_member(org_id));
CREATE POLICY commissions_insert ON commission_records FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY commissions_update ON commission_records FOR UPDATE USING (is_org_member(org_id));

-- ─── PUBLIC PORTAL ACCESS (no auth) ─────────────────────────────────────────

-- Projects can be accessed via shareable_link without auth
CREATE POLICY projects_portal_select ON projects FOR SELECT
  USING (shareable_link IS NOT NULL);

-- ============================================================================
-- DONE. Run `npm run build` to confirm no TypeScript breakage.
-- ============================================================================
