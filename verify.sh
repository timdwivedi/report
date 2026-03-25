#!/bin/bash

# ============================================================
# Bloom Scaffold — Build Verification Script
# Catches the most common build-breaking issues before preview.
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; WARNINGS=$((WARNINGS+1)); }
fail() { echo -e "  ${RED}✗${NC} $1"; ERRORS=$((ERRORS+1)); }

echo ""
echo -e "${BOLD}Bloom Verify — Pre-flight Checks${NC}"
echo ""

# ─── 1. Structure Checks ────────────────────────────

echo -e "${BOLD}Structure${NC}"

if [ -f "web/tsconfig.json" ]; then
    if grep -q '"@/\*"' web/tsconfig.json; then
        pass "web/tsconfig.json has @/* path alias"
    else
        fail "web/tsconfig.json missing @/* path alias — imports will break"
    fi
else
    fail "web/tsconfig.json not found"
fi

if [ -f "web/middleware.ts" ]; then
    if grep -q "placeholder\|demo mode\|skip auth" web/middleware.ts 2>/dev/null; then
        pass "middleware.ts has demo mode guard"
    else
        warn "middleware.ts may crash without Supabase env vars"
    fi
else
    warn "web/middleware.ts not found"
fi

if [ -f "web/lib/supabase.ts" ]; then
    if grep -q "placeholder" web/lib/supabase.ts 2>/dev/null; then
        pass "lib/supabase.ts has placeholder fallbacks"
    else
        warn "lib/supabase.ts may crash without env vars (no placeholder fallbacks)"
    fi
else
    warn "web/lib/supabase.ts not found"
fi

echo ""

# ─── 2. "use client" Check ──────────────────────────

echo -e "${BOLD}Client Directives${NC}"

MISSING_USE_CLIENT=0
# Find all .tsx files with onClick/onChange/useState/useEffect but missing "use client"
for file in $(grep -rl 'onClick\|onChange\|onSubmit\|useState\|useEffect\|useRef' web/ --include="*.tsx" 2>/dev/null); do
    if ! head -3 "$file" | grep -q '"use client"'; then
        fail "Missing \"use client\" in: ${file}"
        MISSING_USE_CLIENT=$((MISSING_USE_CLIENT+1))
    fi
done

if [ $MISSING_USE_CLIENT -eq 0 ]; then
    pass "All interactive components have \"use client\""
fi

# Check for single-quote 'use client' (must be double quotes for Next.js)
SINGLE_QUOTE_COUNT=$(grep -rl "'use client'" web/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$SINGLE_QUOTE_COUNT" -gt 0 ]; then
    fail "${SINGLE_QUOTE_COUNT} file(s) use single-quote 'use client' — Next.js requires double quotes"
    for file in $(grep -rl "'use client'" web/ --include="*.tsx" --include="*.ts" 2>/dev/null); do
        echo -e "       ${RED}→${NC} $file"
    done
else
    pass "All \"use client\" directives use double quotes"
fi

echo ""

# ─── 2b. Double Layout Nesting Check ─────────────────

echo -e "${BOLD}Layout Nesting${NC}"

if [ -f "web/app/dashboard/layout.tsx" ]; then
    LAYOUT_HAS_WRAPPER=$(grep -c 'DashboardLayout\|DashboardShell' web/app/dashboard/layout.tsx 2>/dev/null || echo "0")
    if [ "$LAYOUT_HAS_WRAPPER" -gt 0 ]; then
        # Layout wraps in DashboardLayout — check pages don't double-wrap
        DOUBLE_WRAP=0
        for page in $(find web/app/dashboard -name "page.tsx" -not -path "web/app/dashboard/page.tsx" 2>/dev/null); do
            if grep -q 'DashboardLayout\|DashboardShell' "$page" 2>/dev/null; then
                fail "Double layout nesting: $page wraps in DashboardLayout (layout.tsx already wraps)"
                DOUBLE_WRAP=$((DOUBLE_WRAP+1))
            fi
        done
        if [ $DOUBLE_WRAP -eq 0 ]; then
            pass "No double DashboardLayout nesting detected"
        fi
    else
        pass "Dashboard layout check skipped (no wrapper component in layout.tsx)"
    fi
else
    warn "No dashboard/layout.tsx found — skipping nesting check"
fi

echo ""

# ─── 2c. Inline Mock Data Check ──────────────────────

echo -e "${BOLD}Demo Data Layer${NC}"

INLINE_MOCK=0
if [ -d "web/app/dashboard" ]; then
    for page in $(find web/app/dashboard -name "page.tsx" 2>/dev/null); do
        if grep -q 'const MOCK_\|const DEMO_\|const ALL_.*=.*\[' "$page" 2>/dev/null; then
            warn "Inline mock data in: $page (should use @/lib/demo)"
            INLINE_MOCK=$((INLINE_MOCK+1))
        fi
    done
    if [ $INLINE_MOCK -eq 0 ]; then
        pass "No inline mock data in dashboard pages"
    fi
else
    warn "No dashboard directory found — skipping mock data check"
fi

echo ""

# ─── 2d. Barrel Export Consistency ──────────────────

echo -e "${BOLD}Barrel Exports${NC}"

BARREL_ERRORS=0
if [ -f "web/components/shared/index.ts" ]; then
    # Check every "export { default as X } from './Y'" line
    while IFS= read -r line; do
        # Extract the module path (e.g., ./StatCard)
        module=$(echo "$line" | grep -oE "\./[A-Za-z]+" | head -1)
        if [ -z "$module" ]; then continue; fi

        # Resolve to actual file
        comp_file=""
        for ext in .tsx .ts .jsx .js; do
            if [ -f "web/components/shared/${module#./}${ext}" ]; then
                comp_file="web/components/shared/${module#./}${ext}"
                break
            fi
        done

        if [ -z "$comp_file" ]; then
            fail "Barrel references ${module} but file not found in web/components/shared/"
            BARREL_ERRORS=$((BARREL_ERRORS+1))
            continue
        fi

        # Check if barrel uses "default as" but component has no default export
        if echo "$line" | grep -q "default as"; then
            if ! grep -q 'export default\b' "$comp_file" 2>/dev/null; then
                fail "Barrel uses 'default as' for ${module} but component uses named export (not default)"
                echo -e "       ${RED}→${NC} Change to: export { $(echo "$line" | grep -oE 'as [A-Za-z]+' | sed 's/as //') } from '${module}'"
                BARREL_ERRORS=$((BARREL_ERRORS+1))
            fi
        fi
    done < <(grep "^export" web/components/shared/index.ts 2>/dev/null)

    if [ $BARREL_ERRORS -eq 0 ]; then
        pass "All barrel exports match component export styles"
    fi
else
    warn "No shared/index.ts barrel file found"
fi

echo ""

# ─── 2e. Package Import Check ─────────────────────

echo -e "${BOLD}Package Imports${NC}"

IMPORT_ERRORS=0
# Check that packages imported in web/ code exist in package.json
PKG_FILE="package.json"
if [ -f "$PKG_FILE" ]; then
    # Check critical packages that are commonly missing
    for pkg in "lucide-react" "motion" "framer-motion" "@radix-ui/react-toast"; do
        # Find if any .tsx/.ts file imports this package
        IMPORT_COUNT=$(grep -rl "from ['\"]${pkg}" web/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$IMPORT_COUNT" -gt 0 ]; then
            # Check if it's in package.json
            if grep -q "\"${pkg}\"" "$PKG_FILE" 2>/dev/null; then
                pass "${pkg} imported and found in package.json"
            else
                fail "${pkg} imported in ${IMPORT_COUNT} file(s) but NOT in package.json"
                IMPORT_ERRORS=$((IMPORT_ERRORS+1))
            fi
        fi
    done

    # Special check: framer-motion vs motion (renamed package)
    FM_IMPORTS=$(grep -rl "from ['\"]motion/react" web/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$FM_IMPORTS" -gt 0 ]; then
        if grep -q '"framer-motion"' "$PKG_FILE" 2>/dev/null && ! grep -q '"motion"' "$PKG_FILE" 2>/dev/null; then
            fail "Code imports from 'motion/react' but package.json has 'framer-motion' — change to 'motion'"
            IMPORT_ERRORS=$((IMPORT_ERRORS+1))
        fi
    fi
else
    warn "No package.json found"
fi

if [ $IMPORT_ERRORS -eq 0 ] && [ -f "$PKG_FILE" ]; then
    pass "All critical package imports resolved"
fi

echo ""

# ─── 3. Type Check ──────────────────────────────────

echo -e "${BOLD}TypeScript${NC}"

if npx tsc --noEmit 2>/dev/null; then
    pass "TypeScript compilation passed"
else
    fail "TypeScript compilation failed — run 'npx tsc --noEmit' for details"
fi

echo ""

# ─── 4. Build Check ─────────────────────────────────

echo -e "${BOLD}Next.js Build${NC}"

if npm run build > /dev/null 2>&1; then
    pass "Production build passed"
else
    fail "Production build failed — run 'npm run build' for details"
fi

echo ""

# ─── 5. Navigation Consistency ───────────────────────

echo -e "${BOLD}Navigation${NC}"

if [ -f "web/lib/constants/navigation.ts" ]; then
    # Extract paths from navigation config
    NAV_PATHS=$(grep -oE "'/dashboard/[a-z-]+'" web/lib/constants/navigation.ts 2>/dev/null | tr -d "'" | sort)
    MISSING_PAGES=0
    for path in $NAV_PATHS; do
        # Convert /dashboard/feature-name to web/app/dashboard/feature-name
        page_dir="web/app${path}"
        if [ -d "$page_dir" ] || [ -f "${page_dir}/page.tsx" ] || [ -f "${page_dir}.tsx" ]; then
            true  # page exists
        else
            fail "Nav links to ${path} but page not found at ${page_dir}"
            MISSING_PAGES=$((MISSING_PAGES+1))
        fi
    done
    if [ $MISSING_PAGES -eq 0 ]; then
        pass "All sidebar nav links have matching pages"
    fi
else
    warn "No navigation.ts found — skipping nav check"
fi

echo ""

# ─── 6. Landing Page Checks ─────────────────────────

echo -e "${BOLD}Landing Page${NC}"

if [ -f "web/app/page.tsx" ]; then
    pass "Landing page exists (web/app/page.tsx)"
else
    fail "Landing page missing (web/app/page.tsx)"
fi

if [ -f "web/app/layout.tsx" ]; then
    if grep -q '<title\|metadata' web/app/layout.tsx 2>/dev/null; then
        pass "Root layout has metadata/title"
    else
        warn "Root layout may be missing <title> or metadata export"
    fi
else
    fail "Root layout missing (web/app/layout.tsx)"
fi

echo ""

# ─── Summary ─────────────────────────────────────────

echo -e "${BOLD}────────────────────────────────${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "  ${GREEN}${BOLD}ALL CHECKS PASSED${NC}  (${WARNINGS} warnings)"
    echo ""
    exit 0
else
    echo -e "  ${RED}${BOLD}${ERRORS} ERROR(S)${NC}, ${WARNINGS} warning(s)"
    echo ""
    exit 1
fi
