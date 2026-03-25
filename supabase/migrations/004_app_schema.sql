-- BrandOps Application Schema
-- Migration 004: Core application tables for promotional merchandise management
-- Generated: 2026-02-21

-- =====================================================
-- 1. ORGANIZATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3B82F6',
  default_margin_percent DECIMAL(5,2) NOT NULL DEFAULT 35.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  salesforce_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  payment_terms_default TEXT NOT NULL DEFAULT 'net30' CHECK (payment_terms_default IN ('prepay', 'net15', 'net30', 'net45', 'net60')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- =====================================================
-- 2. CLIENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  billing_address_street TEXT NOT NULL,
  billing_address_city TEXT NOT NULL,
  billing_address_state TEXT NOT NULL,
  billing_address_zip TEXT NOT NULL,
  billing_address_country TEXT NOT NULL DEFAULT 'USA',
  shipping_address_street TEXT,
  shipping_address_city TEXT,
  shipping_address_state TEXT,
  shipping_address_zip TEXT,
  shipping_address_country TEXT,
  payment_terms TEXT NOT NULL DEFAULT 'net30' CHECK (payment_terms IN ('prepay', 'net15', 'net30', 'net45', 'net60')),
  credit_limit DECIMAL(12,2),
  tax_exempt BOOLEAN NOT NULL DEFAULT FALSE,
  annual_volume DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients(org_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_name);

-- =====================================================
-- 3. CLIENT CONTACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'other' CHECK (role IN ('primary', 'order', 'finance', 'marketing', 'other')),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_is_primary ON client_contacts(is_primary);

-- =====================================================
-- 4. PRODUCTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  internal_sku TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'short-sleeve-tees', 'long-sleeve-tees', 'sweatshirts-hoodies', 'polos',
    'jackets-outerwear', 'hats-caps', 'bags-totes', 'drinkware',
    'office-supplies', 'tech-accessories', 'stickers-patches', 'koozies',
    'lanyards-badges', 'other'
  )),
  description TEXT,
  primary_image_url TEXT,
  additional_images JSONB DEFAULT '[]'::JSONB,
  available_colors JSONB DEFAULT '[]'::JSONB, -- [{ name, hex, swatch_url }]
  available_sizes JSONB DEFAULT '[]'::JSONB, -- ["S", "M", "L", "XL", "2XL", "3XL"]
  blank_costs JSONB DEFAULT '[]'::JSONB, -- [{ min_quantity, max_quantity, cost_per_unit }]
  applicable_decorations JSONB DEFAULT '[]'::JSONB, -- ["screen-print", "embroidery", etc.]
  supplier_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  show_on_website BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_org_id ON products(org_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_show_on_website ON products(show_on_website);

-- =====================================================
-- 5. DECORATOR MATRICES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS decorator_matrices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  decoration_method TEXT NOT NULL CHECK (decoration_method IN (
    'screen-print', 'embroidery', 'dtg', 'heat-transfer', 'sublimation',
    'laser-engrave', 'pad-print', 'deboss', 'other'
  )),
  pricing_tiers JSONB NOT NULL DEFAULT '[]'::JSONB, -- [{ min_quantity, max_quantity, prices_by_colors: { 1: 2.50, 2: 3.65 } }]
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_decorator_matrices_org_id ON decorator_matrices(org_id);
CREATE INDEX IF NOT EXISTS idx_decorator_matrices_decoration_method ON decorator_matrices(decoration_method);
CREATE INDEX IF NOT EXISTS idx_decorator_matrices_is_default ON decorator_matrices(is_default);

-- =====================================================
-- 6. PROJECTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'opportunity' CHECK (status IN (
    'opportunity', 'qualifying', 'curating', 'in-design', 'presenting',
    'client-review', 'confirmed', 'order-entry', 'in-production', 'shipped', 'cancelled'
  )),
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('website', 'direct', 'referral', 'program')),
  in_hands_date DATE,
  budget DECIMAL(12,2),
  is_critical BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  internal_notes TEXT,
  client_notes TEXT,
  shareable_link TEXT UNIQUE,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_source ON projects(source);
CREATE INDEX IF NOT EXISTS idx_projects_is_critical ON projects(is_critical);
CREATE INDEX IF NOT EXISTS idx_projects_shareable_link ON projects(shareable_link);

-- =====================================================
-- 7. PROJECT LINE ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS project_line_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  selected_color TEXT,
  selected_sizes JSONB DEFAULT '[]'::JSONB, -- [{ size, quantity }]
  total_quantity INTEGER NOT NULL DEFAULT 0,
  decorations JSONB DEFAULT '[]'::JSONB, -- [{ id, location, location_label, method, color_count, decoration_cost, notes }]
  add_ons JSONB DEFAULT '[]'::JSONB, -- [{ name, cost_per_unit }]
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  margin_percent DECIMAL(5,2) NOT NULL DEFAULT 35.00,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  art_received BOOLEAN NOT NULL DEFAULT FALSE,
  artwork_files JSONB DEFAULT '[]'::JSONB, -- ["url1", "url2"]
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_line_items_project_id ON project_line_items(project_id);
CREATE INDEX IF NOT EXISTS idx_project_line_items_product_id ON project_line_items(product_id);

-- =====================================================
-- 8. ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  line_item_id UUID NOT NULL REFERENCES project_line_items(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL UNIQUE,
  salesforce_id TEXT,
  status TEXT NOT NULL DEFAULT 'order-entry-needed' CHECK (status IN (
    'order-entry-needed', 'entered', 'in-production', 'shipped',
    'ready-for-invoicing', 'invoiced', 'cancelled'
  )),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  in_hands_date DATE,
  ship_to_street TEXT NOT NULL,
  ship_to_city TEXT NOT NULL,
  ship_to_state TEXT NOT NULL,
  ship_to_zip TEXT NOT NULL,
  ship_to_country TEXT NOT NULL DEFAULT 'USA',
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,
  shipped_date DATE,
  invoice_amount DECIMAL(12,2),
  payment_received BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_org_id ON orders(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_project_id ON orders(project_id);
CREATE INDEX IF NOT EXISTS idx_orders_line_item_id ON orders(line_item_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_salesforce_id ON orders(salesforce_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_received ON orders(payment_received);

-- =====================================================
-- 9. PROGRAMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('employee-store', 'uniform-program', 'event-merch', 'drop-ship', 'budget-managed')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  budget_total DECIMAL(12,2),
  budget_spent DECIMAL(12,2) NOT NULL DEFAULT 0,
  budget_remaining DECIMAL(12,2) NOT NULL DEFAULT 0,
  locations_count INTEGER NOT NULL DEFAULT 0,
  approval_required BOOLEAN NOT NULL DEFAULT FALSE,
  auto_reorder BOOLEAN NOT NULL DEFAULT FALSE,
  reorder_frequency TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_programs_org_id ON programs(org_id);
CREATE INDEX IF NOT EXISTS idx_programs_client_id ON programs(client_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_type ON programs(type);

-- =====================================================
-- 10. PROGRAM LOCATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS program_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address_street TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_zip TEXT NOT NULL,
  address_country TEXT NOT NULL DEFAULT 'USA',
  budget_allocation DECIMAL(12,2),
  contact_name TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_program_locations_program_id ON program_locations(program_id);

-- =====================================================
-- 11. COMMISSION RECORDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS commission_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  period TEXT NOT NULL, -- "2026-02"
  gross_revenue DECIMAL(12,2) NOT NULL,
  gross_profit DECIMAL(12,2) NOT NULL,
  profit_margin_percent DECIMAL(5,2) NOT NULL,
  owner_share DECIMAL(12,2) NOT NULL, -- 50% of profit
  partner_commission DECIMAL(12,2) NOT NULL, -- 7% of gross
  source TEXT NOT NULL CHECK (source IN ('website', 'direct', 'referral', 'program')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commission_records_org_id ON commission_records(org_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_project_id ON commission_records(project_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_period ON commission_records(period);
CREATE INDEX IF NOT EXISTS idx_commission_records_status ON commission_records(status);

-- =====================================================
-- 12. TEAM MEMBERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'sales', 'production', 'viewer')),
  avatar_initials TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  projects_assigned INTEGER NOT NULL DEFAULT 0,
  deals_closed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_org_id ON team_members(org_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON team_members(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE decorator_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only access their own organization
CREATE POLICY organizations_select_policy ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY organizations_insert_policy ON organizations
  FOR INSERT WITH CHECK (
    id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY organizations_update_policy ON organizations
  FOR UPDATE USING (
    id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY organizations_delete_policy ON organizations
  FOR DELETE USING (
    id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Clients: Org-level access
CREATE POLICY clients_select_policy ON clients
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY clients_insert_policy ON clients
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'sales'))
  );

CREATE POLICY clients_update_policy ON clients
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'sales'))
  );

CREATE POLICY clients_delete_policy ON clients
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Client Contacts: Org-level access via clients
CREATE POLICY client_contacts_select_policy ON client_contacts
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE org_id IN (
        SELECT org_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY client_contacts_insert_policy ON client_contacts
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE org_id IN (
        SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'sales')
      )
    )
  );

CREATE POLICY client_contacts_update_policy ON client_contacts
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM clients WHERE org_id IN (
        SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'sales')
      )
    )
  );

CREATE POLICY client_contacts_delete_policy ON client_contacts
  FOR DELETE USING (
    client_id IN (
      SELECT id FROM clients WHERE org_id IN (
        SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'sales')
      )
    )
  );

-- Products: Org-level access
CREATE POLICY products_select_policy ON products
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid())
    OR show_on_website = TRUE -- Public catalog access
  );

CREATE POLICY products_insert_policy ON products
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY products_update_policy ON products
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY products_delete_policy ON products
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Similar RLS policies for remaining tables (decorator_matrices, projects, orders, programs, etc.)
-- All follow the same pattern: org_id-based access via team_members table

-- Decorator Matrices
CREATE POLICY decorator_matrices_select_policy ON decorator_matrices
  FOR SELECT USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY decorator_matrices_insert_policy ON decorator_matrices
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY decorator_matrices_update_policy ON decorator_matrices
  FOR UPDATE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY decorator_matrices_delete_policy ON decorator_matrices
  FOR DELETE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Projects
CREATE POLICY projects_select_policy ON projects
  FOR SELECT USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY projects_insert_policy ON projects
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY projects_update_policy ON projects
  FOR UPDATE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY projects_delete_policy ON projects
  FOR DELETE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Orders
CREATE POLICY orders_select_policy ON orders
  FOR SELECT USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY orders_insert_policy ON orders
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY orders_update_policy ON orders
  FOR UPDATE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY orders_delete_policy ON orders
  FOR DELETE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Programs
CREATE POLICY programs_select_policy ON programs
  FOR SELECT USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY programs_insert_policy ON programs
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'sales')));

CREATE POLICY programs_update_policy ON programs
  FOR UPDATE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY programs_delete_policy ON programs
  FOR DELETE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Commission Records
CREATE POLICY commission_records_select_policy ON commission_records
  FOR SELECT USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY commission_records_insert_policy ON commission_records
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY commission_records_update_policy ON commission_records
  FOR UPDATE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY commission_records_delete_policy ON commission_records
  FOR DELETE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'));

-- Team Members
CREATE POLICY team_members_select_policy ON team_members
  FOR SELECT USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY team_members_insert_policy ON team_members
  FOR INSERT WITH CHECK (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY team_members_update_policy ON team_members
  FOR UPDATE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY team_members_delete_policy ON team_members
  FOR DELETE USING (org_id IN (SELECT org_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'));

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_contacts_updated_at BEFORE UPDATE ON client_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decorator_matrices_updated_at BEFORE UPDATE ON decorator_matrices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_line_items_updated_at BEFORE UPDATE ON project_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_locations_updated_at BEFORE UPDATE ON program_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_records_updated_at BEFORE UPDATE ON commission_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
