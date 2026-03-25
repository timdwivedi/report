#!/bin/bash
# ============================================================
# Package for Client - Strip SOPs + Generate Clean Zip
# ============================================================
# Usage: bash scripts/ops/package-for-client.sh [client-name]
#
# Example: bash scripts/ops/package-for-client.sh acme
# Output:  ../acme-app-delivery.zip
#
# This script:
#   1. Strips all operator SOPs and build instructions
#   2. Cleans CLAUDE.md of operator-only sections
#   3. Produces a clean .zip file ready to hand to the client
#   4. Self-deletes (the script itself doesn't ship)
#
# The client gets a working codebase with AI-assisted dev tools
# but NONE of the Bloom build system, conversion formulas, or
# deployment SOPs.
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ---- Get client name ----

CLIENT_NAME="${1}"

if [ -z "$CLIENT_NAME" ]; then
    read -p "Client name (lowercase, no spaces -- e.g., acme): " CLIENT_NAME
fi

if [ -z "$CLIENT_NAME" ]; then
    echo -e "${RED}ERROR: Client name is required.${NC}"
    echo "  Usage: bash scripts/ops/package-for-client.sh [client-name]"
    exit 1
fi

# Sanitize: lowercase, replace spaces with hyphens
CLIENT_NAME=$(echo "$CLIENT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
ZIP_NAME="${CLIENT_NAME}-app-delivery.zip"

echo ""
echo "=========================================="
echo "  BLOOM: Package for Client"
echo "  Client: ${CLIENT_NAME}"
echo "  Output: ../${ZIP_NAME}"
echo "=========================================="
echo ""

# Safety check - must be run from bloom/project root
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${RED}ERROR: Must be run from the project root directory.${NC}"
    echo "  (The directory that contains CLAUDE.md)"
    exit 1
fi

# Show what will happen
echo -e "${YELLOW}This will:${NC}"
echo "  1. Remove operator-only SOPs (build system, launch guide, design formula)"
echo "  2. Remove scaffold-setup and all agent-* skill folders (build SOPs)"
echo "  3. Clean CLAUDE.md of operator sections"
echo "  4. Create a clean zip: ../${ZIP_NAME}"
echo "  5. Self-delete the packaging script"
echo ""
echo -e "${GREEN}KEPT for client:${NC}"
echo "  - All app code, pages, components, API routes"
echo "  - docs/founder/ (client's brand & data)"
echo "  - Feature builder, self-correction, action-plan skills"
echo "  - Sub-agents (code review, migration validation)"
echo "  - All migrations and database schema"
echo ""
read -p "Type 'PACKAGE' to confirm: " confirm

if [ "$confirm" != "PACKAGE" ]; then
    echo ""
    echo -e "${RED}Aborted. Nothing was changed.${NC}"
    exit 0
fi

echo ""

# Track what we do
removed=()
cleaned=()

# ============================================================
# PHASE 1: Remove operator-only documents
# ============================================================
echo -e "${CYAN}Phase 1: Removing operator documents...${NC}"

for file in \
    "docs/QUICK_START_AGENTS.md" \
    "docs/LAUNCH_GUIDE.md" \
    "docs/SAAS_DESIGN_SYSTEM.md" \
    "VERSION"; do
    if [ -f "$file" ]; then
        rm "$file"
        removed+=("$file")
        echo "  Removed: $file"
    fi
done

# ============================================================
# PHASE 2: Remove operator-only skills (scaffold-setup + all agent-* folders)
# ============================================================
echo -e "${CYAN}Phase 2: Removing operator-only skills...${NC}"

# Remove scaffold-setup
if [ -d ".claude/skills/scaffold-setup" ]; then
    rm -rf ".claude/skills/scaffold-setup"
    removed+=(".claude/skills/scaffold-setup/")
    echo "  Removed: .claude/skills/scaffold-setup/"
fi

# Remove all agent skill folders (agent-1-spec, agent-2-brand, agent-2.5-creative, etc.)
if [ -d ".claude/skills" ]; then
    for agent_dir in .claude/skills/agent-*; do
        if [ -d "$agent_dir" ]; then
            rm -rf "$agent_dir"
            removed+=("$(basename "$agent_dir")/")
            echo "  Removed: $agent_dir/"
        fi
    done
fi

# ============================================================
# PHASE 3: Clean agent directives from project spec
# ============================================================
echo -e "${CYAN}Phase 3: Cleaning agent directives from project spec...${NC}"

if [ -f "docs/roadmap/01_project_spec.md" ]; then
    if grep -q "Agent Build Directives" "docs/roadmap/01_project_spec.md" 2>/dev/null; then
        sed -i.bak '/^## Agent Build Directives/,$d' "docs/roadmap/01_project_spec.md"
        rm -f "docs/roadmap/01_project_spec.md.bak"
        cleaned+=("Stripped agent directives from 01_project_spec.md")
        echo "  Cleaned: Agent directives from 01_project_spec.md"
    fi
fi

# ============================================================
# PHASE 4: Clean CLAUDE.md of operator sections
# ============================================================
echo -e "${CYAN}Phase 4: Cleaning CLAUDE.md...${NC}"

if [ -f "CLAUDE.md" ]; then
    # Remove the FIRST RUN / ONBOARDING block if still present
    sed -i.bak '/<!-- ONBOARDING_START/,/<!-- ONBOARDING_END -->/d' "CLAUDE.md"

    # Remove Parallel Build Agents section (from header to next ---)
    # This removes "## Parallel Build Agents" through the Launch trigger
    python3 -c "
import re
with open('CLAUDE.md', 'r') as f:
    content = f.read()

# Remove 'Parallel Build Agents' section (including Launch trigger)
content = re.sub(
    r'## Parallel Build Agents \(Speed Build\).*?(?=\n## )',
    '',
    content,
    flags=re.DOTALL
)

# Remove scaffold-setup from skills table
content = re.sub(
    r'\| \`/scaffold-setup\`.*?\n',
    '',
    content
)

# Remove SAAS_DESIGN_SYSTEM.md from reference table
content = re.sub(
    r'\| \`docs/SAAS_DESIGN_SYSTEM\.md\`.*?\n',
    '',
    content
)

# Remove LAUNCH_GUIDE.md from reference table
content = re.sub(
    r'\| \`docs/LAUNCH_GUIDE\.md\`.*?\n',
    '',
    content
)

# Remove Scaffold Versioning section
content = re.sub(
    r'## Scaffold Versioning.*?(?=\n## )',
    '',
    content,
    flags=re.DOTALL
)

# Clean up any triple+ blank lines
content = re.sub(r'\n{4,}', '\n\n---\n\n', content)

with open('CLAUDE.md', 'w') as f:
    f.write(content)
" 2>/dev/null

    rm -f "CLAUDE.md.bak"
    cleaned+=("CLAUDE.md (removed operator sections)")
    echo "  Cleaned: CLAUDE.md"
fi

# ============================================================
# PHASE 5: Generate clean zip
# ============================================================
echo -e "${CYAN}Phase 5: Creating zip...${NC}"

# Build exclusion list
EXCLUDE_PATTERNS=(
    "node_modules/*"
    "web/node_modules/*"
    ".next/*"
    "web/.next/*"
    ".DS_Store"
    "*/.DS_Store"
    "__MACOSX/*"
    "*/__MACOSX/*"
    "*.tsbuildinfo"
    ".env.local"
    ".env*.local"
    "package-lock.json"
    # Cross-build intelligence (operator-only)
    "knowledge/*"
    # Build orchestration scripts only
    "scripts/ops/*"
    # Operator docs
    "docs/QUICK_START_AGENTS.md"
    "docs/LAUNCH_GUIDE.md"
    "docs/SAAS_DESIGN_SYSTEM.md"
    "VERSION"
)

# Build the exclude args
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS -x \"$pattern\""
done

# Create zip one level up from project root
ZIP_PATH="../${ZIP_NAME}"
rm -f "$ZIP_PATH" 2>/dev/null

# Use eval to handle the quoted exclusion patterns
eval "zip -r '$ZIP_PATH' . $EXCLUDE_ARGS" > /dev/null 2>&1

ZIP_SIZE=$(du -h "$ZIP_PATH" | cut -f1)

echo "  Created: ${ZIP_PATH} (${ZIP_SIZE})"

# ============================================================
# PHASE 6: Self-delete
# ============================================================

SCRIPT_PATH="scripts/ops/package-for-client.sh"
removed+=("$SCRIPT_PATH (self-removed)")

# ============================================================
# SUMMARY
# ============================================================

echo ""
echo -e "${GREEN}=========================================="
echo "  Package Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${RED}Removed (${#removed[@]} items):${NC}"
for item in "${removed[@]}"; do
    echo "  ✗ $item"
done
echo ""
echo -e "${CYAN}Cleaned (${#cleaned[@]} items):${NC}"
for item in "${cleaned[@]}"; do
    echo "  ~ $item"
done
echo ""
echo -e "${GREEN}Output:${NC}"
echo "  📦 ../${ZIP_NAME} (${ZIP_SIZE})"
echo ""
echo "  This zip is ready to send to the client."
echo "  It contains the full working app with NO operator SOPs."
echo ""
echo -e "${YELLOW}Verify the build still works:${NC}"
echo "  cd web && npm run build"
echo ""

# Self-delete (last action)
rm -f "$SCRIPT_PATH" 2>/dev/null
