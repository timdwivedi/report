#!/bin/bash
# ============================================================
# Deploy Demo - Push a built app to Vercel Preview
# ============================================================
# Usage: bash scripts/ops/deploy-demo.sh [client-slug]
#
# Example: bash scripts/ops/deploy-demo.sh acme
# Output:  https://acme.demo.yourdomain.com (or Vercel preview URL)
#
# One-time setup (do this ONCE, never again):
#   1. Create a GitHub repo for demos (e.g., simplapp-demos)
#   2. Connect it to Vercel (import project, link to GitHub)
#   3. (Optional) Add wildcard domain: *.demo.yourdomain.com
#   4. Set DEMO_REPO_URL below to your demo repo's git URL
#   5. Set DEMO_DOMAIN below if you have a wildcard domain
#
# After setup, this script handles EVERYTHING:
#   - Copies the built app (stripped of SOPs)
#   - Pushes to demo repo as a branch
#   - Vercel auto-deploys
#   - Returns the live URL
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ============================================================
# CONFIGURATION - Set these once after creating your demo repo
# ============================================================

# Your demo repo's SSH or HTTPS URL
# Example: git@github.com:yourname/simplapp-demos.git
# Example: https://github.com/yourname/simplapp-demos.git
DEMO_REPO_URL=""

# Your wildcard demo domain (optional)
# If set, the script will tell you the URL as: {slug}.{DEMO_DOMAIN}
# Example: demo.simplapp.com → acme.demo.simplapp.com
# Leave empty to use Vercel's auto-generated preview URL
DEMO_DOMAIN=""

# ============================================================
# END CONFIGURATION
# ============================================================

# ---- Get client slug ----
CLIENT_SLUG="${1}"

if [ -z "$CLIENT_SLUG" ]; then
    read -p "Client slug (lowercase, no spaces -- e.g., acme): " CLIENT_SLUG
fi

if [ -z "$CLIENT_SLUG" ]; then
    echo -e "${RED}ERROR: Client slug is required.${NC}"
    echo "  Usage: bash scripts/ops/deploy-demo.sh [client-slug]"
    exit 1
fi

# Sanitize
CLIENT_SLUG=$(echo "$CLIENT_SLUG" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
BRANCH_NAME="demo/${CLIENT_SLUG}"

# ---- Safety checks ----
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${RED}ERROR: Must be run from the project root (directory with CLAUDE.md).${NC}"
    exit 1
fi

if [ -z "$DEMO_REPO_URL" ]; then
    echo -e "${RED}ERROR: DEMO_REPO_URL is not configured.${NC}"
    echo ""
    echo "  One-time setup required:"
    echo "    1. Create a GitHub repo for demos (e.g., simplapp-demos)"
    echo "    2. Connect it to Vercel (import the repo)"
    echo "    3. Edit this script and set DEMO_REPO_URL"
    echo ""
    echo "  Example:"
    echo "    DEMO_REPO_URL=\"git@github.com:yourname/simplapp-demos.git\""
    echo ""
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}ERROR: git is required.${NC}"
    exit 1
fi

# ---- Banner ----
echo ""
echo -e "${BOLD}=========================================="
echo "  BLOOM: Deploy Demo"
echo "==========================================${NC}"
echo ""
echo -e "  Client: ${CYAN}${CLIENT_SLUG}${NC}"
echo -e "  Branch: ${CYAN}${BRANCH_NAME}${NC}"
echo -e "  Repo:   ${CYAN}${DEMO_REPO_URL}${NC}"

if [ -n "$DEMO_DOMAIN" ]; then
    echo -e "  URL:    ${GREEN}https://${CLIENT_SLUG}.${DEMO_DOMAIN}${NC}"
else
    echo -e "  URL:    ${YELLOW}Vercel preview URL (shown after deploy)${NC}"
fi

echo ""

# ---- Confirm ----
read -p "Deploy demo for '${CLIENT_SLUG}'? (y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${RED}Aborted.${NC}"
    exit 0
fi

echo ""

# ---- Create temp workspace ----
TEMP_DIR=$(mktemp -d)
PROJECT_DIR="$(pwd)"

echo -e "${CYAN}Phase 1: Cloning demo repo...${NC}"
git clone --depth 1 "$DEMO_REPO_URL" "$TEMP_DIR/demo-repo" 2>/dev/null || {
    # Repo might be empty (first demo)
    mkdir -p "$TEMP_DIR/demo-repo"
    cd "$TEMP_DIR/demo-repo"
    git init
    git remote add origin "$DEMO_REPO_URL"
    cd "$PROJECT_DIR"
}

echo "  Done."

# ---- Create branch ----
echo -e "${CYAN}Phase 2: Creating branch ${BRANCH_NAME}...${NC}"
cd "$TEMP_DIR/demo-repo"

# Create orphan branch (clean, no history from other demos)
git checkout --orphan "$BRANCH_NAME" 2>/dev/null || git checkout -b "$BRANCH_NAME"

# Clean the working directory
git rm -rf . 2>/dev/null || true
find . -not -path './.git/*' -not -path './.git' -delete 2>/dev/null || true

echo "  Done."

# ---- Copy project files (stripped) ----
echo -e "${CYAN}Phase 3: Copying project (stripped of SOPs)...${NC}"
cd "$PROJECT_DIR"

# Files/dirs to EXCLUDE from demo (operator SOPs + build artifacts)
EXCLUDE_LIST=(
    ".git"
    "node_modules"
    "web/node_modules"
    ".next"
    "web/.next"
    ".DS_Store"
    "__MACOSX"
    "*.tsbuildinfo"
    ".env.local"
    ".env*.local"
    # Operator-only files
    "docs/QUICK_START_AGENTS.md"
    "docs/LAUNCH_GUIDE.md"
    "docs/SAAS_DESIGN_SYSTEM.md"
    "VERSION"
    ".claude/skills/scaffold-setup"
    "scripts/ops/package-for-client.sh"
    "scripts/ops/deploy-demo.sh"
    "scripts/ops/bloom-build.sh"
    "BUILD_DEBRIEF.md"
)

# Build rsync exclude args
EXCLUDE_ARGS=""
for item in "${EXCLUDE_LIST[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$item"
done

# Copy with rsync (fast, handles excludes cleanly)
eval rsync -a $EXCLUDE_ARGS "$PROJECT_DIR/" "$TEMP_DIR/demo-repo/"

echo "  Done."

# ---- Clean CLAUDE.md of operator sections ----
echo -e "${CYAN}Phase 4: Cleaning CLAUDE.md...${NC}"

DEMO_CLAUDE="$TEMP_DIR/demo-repo/CLAUDE.md"
if [ -f "$DEMO_CLAUDE" ]; then
    python3 -c "
import re

with open('$DEMO_CLAUDE', 'r') as f:
    content = f.read()

# Remove onboarding block
content = re.sub(r'<!-- ONBOARDING_START.*?<!-- ONBOARDING_END -->', '', content, flags=re.DOTALL)

# Remove Parallel Build Agents section
content = re.sub(r'## Parallel Build Agents \(Speed Build\).*?(?=\n## )', '', content, flags=re.DOTALL)

# Remove scaffold-setup from skills table
content = re.sub(r'\| \`/scaffold-setup\`.*?\n', '', content)

# Remove operator docs from reference table
content = re.sub(r'\| \`docs/SAAS_DESIGN_SYSTEM\.md\`.*?\n', '', content)
content = re.sub(r'\| \`docs/LAUNCH_GUIDE\.md\`.*?\n', '', content)

# Remove Scaffold Versioning section
content = re.sub(r'## Scaffold Versioning.*?(?=\n## )', '', content, flags=re.DOTALL)

# Clean up triple+ blank lines
content = re.sub(r'\n{4,}', '\n\n---\n\n', content)

with open('$DEMO_CLAUDE', 'w') as f:
    f.write(content)
" 2>/dev/null
    echo "  Cleaned."
else
    echo "  No CLAUDE.md found (skipped)."
fi

# ---- Clean project spec agent directives ----
DEMO_SPEC="$TEMP_DIR/demo-repo/docs/roadmap/01_project_spec.md"
if [ -f "$DEMO_SPEC" ]; then
    if grep -q "Agent Build Directives" "$DEMO_SPEC" 2>/dev/null; then
        sed -i.bak '/^## Agent Build Directives/,$d' "$DEMO_SPEC"
        rm -f "${DEMO_SPEC}.bak"
        echo "  Cleaned agent directives from project spec."
    fi
fi

# ---- Commit and push ----
echo -e "${CYAN}Phase 5: Pushing to demo repo...${NC}"
cd "$TEMP_DIR/demo-repo"

git add -A
git commit -m "Demo: ${CLIENT_SLUG} ($(date +%Y-%m-%d))" --quiet

# Push the branch
git push origin "$BRANCH_NAME" --force --quiet 2>&1

echo "  Pushed."

# ---- Cleanup ----
echo -e "${CYAN}Phase 6: Cleaning up...${NC}"
rm -rf "$TEMP_DIR"
echo "  Done."

# ---- Success ----
echo ""
echo -e "${GREEN}=========================================="
echo "  Demo Deployed!"
echo "==========================================${NC}"
echo ""

if [ -n "$DEMO_DOMAIN" ]; then
    echo -e "  ${BOLD}URL: https://${CLIENT_SLUG}.${DEMO_DOMAIN}${NC}"
    echo ""
    echo "  If this is a new subdomain, you may need to add it in Vercel:"
    echo "    Vercel Dashboard → Project → Settings → Domains"
    echo "    Add: ${CLIENT_SLUG}.${DEMO_DOMAIN}"
else
    echo -e "  ${BOLD}Check Vercel Dashboard for the preview URL.${NC}"
    echo ""
    echo "  Vercel auto-deploys every branch. Your demo URL will be:"
    echo "    https://[project-name]-git-${BRANCH_NAME//\//-}-[your-vercel-username].vercel.app"
    echo ""
    echo "  Tip: Set DEMO_DOMAIN in this script for clean URLs:"
    echo "    e.g., https://${CLIENT_SLUG}.demo.simplapp.com"
fi

echo ""
echo -e "  ${CYAN}Branch:${NC} ${BRANCH_NAME}"
echo -e "  ${CYAN}Repo:${NC}   ${DEMO_REPO_URL}"
echo ""
echo -e "  ${YELLOW}To remove this demo later:${NC}"
echo "    git push origin --delete ${BRANCH_NAME}"
echo ""
echo -e "  ${GREEN}Send to prospect:${NC}"
echo "    \"Hey [Name], I built your app this morning. Take a look:"

if [ -n "$DEMO_DOMAIN" ]; then
    echo "     https://${CLIENT_SLUG}.${DEMO_DOMAIN}"
else
    echo "     [paste Vercel preview URL]"
fi

echo "     Everything you see is what your customers would experience."
echo "     When you're ready to go live, we flip the switch.\""
echo ""
