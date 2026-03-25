-- Row Level Security Policies
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can view orgs they're members of
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Organizations: Only owners can update
CREATE POLICY "Owners can update organizations"
    ON organizations FOR UPDATE
    USING (
        id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Organization members: Users can view members of their orgs
CREATE POLICY "Users can view org members"
    ON organization_members FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Organization members: Owners and admins can manage members
CREATE POLICY "Admins can manage org members"
    ON organization_members FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- User profiles: Users can manage their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- User settings: Users can manage their own settings
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- User subscriptions: Users can view their own subscription
CREATE POLICY "Users can view own subscription"
    ON user_subscriptions FOR SELECT
    USING (user_id = auth.uid());

-- Note: Subscription updates should be done via service role (webhooks)
-- No direct update policy for users
