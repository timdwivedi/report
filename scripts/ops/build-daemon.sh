#!/bin/bash
# ============================================================
# Bloom Build Daemon — Watches for queued builds and runs them
# ============================================================
#
# Run this in a Terminal tab. It polls Supabase every 30 seconds
# for submissions with agentic_build_status = "queued", then
# runs agentic-build.sh for each one sequentially.
#
# Usage:
#   bash bloom/scripts/ops/build-daemon.sh
#
# Options:
#   --interval N    Poll interval in seconds (default: 30)
#   --once          Process one build and exit (no polling loop)
#
# Stop: Ctrl+C
# ============================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ─── Config ──────────────────────────────────────────

POLL_INTERVAL=30
RUN_ONCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --interval) POLL_INTERVAL="$2"; shift 2 ;;
        --once)     RUN_ONCE=true; shift ;;
        *)          echo -e "${RED}Unknown option: $1${NC}"; exit 1 ;;
    esac
done

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BUILD_SCRIPT="${REPO_ROOT}/bloom/scripts/ops/agentic-build.sh"
ENV_FILE="${REPO_ROOT}/web/.env.local"

# ─── Load Supabase Credentials ──────────────────────

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}web/.env.local not found.${NC}"
    exit 1
fi

SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
SERVICE_KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
    echo -e "${RED}Missing SUPABASE_URL or SERVICE_ROLE_KEY in web/.env.local${NC}"
    exit 1
fi

# ─── Helpers ─────────────────────────────────────────

ts() { date '+%H:%M:%S'; }

log() {
    local level=$1; shift
    case $level in
        INFO)   echo -e "${CYAN}[$(ts)]${NC} $*" ;;
        OK)     echo -e "${GREEN}[$(ts)] ✓${NC} $*" ;;
        WARN)   echo -e "${YELLOW}[$(ts)] ⚠${NC} $*" ;;
        ERROR)  echo -e "${RED}[$(ts)] ✗${NC} $*" ;;
        BUILD)  echo -e "${MAGENTA}[$(ts)] 🔨${NC} $*" ;;
    esac
}

update_status() {
    local id=$1
    local status=$2
    curl -s -X PATCH \
        "${SUPABASE_URL}/rest/v1/bloom_submissions?id=eq.${id}" \
        -H "apikey: ${SERVICE_KEY}" \
        -H "Authorization: Bearer ${SERVICE_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=minimal" \
        -d "{\"agentic_build_status\": \"${status}\", \"updated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
        > /dev/null 2>&1
}

# ─── Banner ──────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════╗"
echo -e "║   BLOOM: Build Daemon                        ║"
echo -e "║   Watching for queued builds...              ║"
echo -e "╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Poll interval: ${GREEN}${POLL_INTERVAL}s${NC}"
echo -e "  Build script:  ${DIM}${BUILD_SCRIPT}${NC}"
echo -e "  Stop:          ${YELLOW}Ctrl+C${NC}"
echo ""

# ─── Trap Ctrl+C ────────────────────────────────────

trap 'echo ""; log INFO "Daemon stopped."; exit 0' INT TERM

# ─── Main Loop ──────────────────────────────────────

BUILDS_COMPLETED=0

while true; do
    # Query for queued builds (oldest first)
    QUEUED=$(curl -s \
        "${SUPABASE_URL}/rest/v1/bloom_submissions?agentic_build_status=eq.queued&select=id,company_name,full_name&order=updated_at.asc&limit=1" \
        -H "apikey: ${SERVICE_KEY}" \
        -H "Authorization: Bearer ${SERVICE_KEY}" \
        2>/dev/null || echo "[]")

    # Check if there's a queued build
    SUBMISSION_ID=$(echo "$QUEUED" | jq -r '.[0].id // empty' 2>/dev/null || echo "")

    if [ -n "$SUBMISSION_ID" ]; then
        COMPANY_NAME=$(echo "$QUEUED" | jq -r '.[0].company_name // .[0].full_name // "Unknown"' 2>/dev/null)
        echo ""
        log BUILD "${BOLD}Build starting: ${COMPANY_NAME}${NC} (${SUBMISSION_ID})"
        echo ""

        # Mark as building
        update_status "$SUBMISSION_ID" "building"

        # Run the build
        BUILD_START=$(date +%s)
        if bash "$BUILD_SCRIPT" "$SUBMISSION_ID" 2>&1; then
            BUILD_END=$(date +%s)
            DURATION=$(( BUILD_END - BUILD_START ))
            MINS=$(( DURATION / 60 ))
            SECS=$(( DURATION % 60 ))
            log OK "Build complete: ${COMPANY_NAME} (${MINS}m ${SECS}s)"
            BUILDS_COMPLETED=$((BUILDS_COMPLETED + 1))
            # Note: agentic-build.sh already sets status to "live" if deploy succeeds
            # Only set build_complete if it didn't deploy (no Vercel config)
            CURRENT_STATUS=$(curl -s \
                "${SUPABASE_URL}/rest/v1/bloom_submissions?id=eq.${SUBMISSION_ID}&select=agentic_build_status" \
                -H "apikey: ${SERVICE_KEY}" \
                -H "Authorization: Bearer ${SERVICE_KEY}" \
                2>/dev/null | jq -r '.[0].agentic_build_status // "building"')
            if [ "$CURRENT_STATUS" = "building" ]; then
                update_status "$SUBMISSION_ID" "build_complete"
            fi
        else
            log ERROR "Build failed: ${COMPANY_NAME}"
            update_status "$SUBMISSION_ID" "build_failed"
        fi

        echo ""
        log INFO "Total builds completed this session: ${BUILDS_COMPLETED}"
        echo ""

        if [ "$RUN_ONCE" = true ]; then
            log INFO "Single run mode (--once). Exiting."
            exit 0
        fi
    fi

    # Wait before polling again
    if [ "$RUN_ONCE" = true ]; then
        log INFO "No queued builds found. Exiting (--once mode)."
        exit 0
    fi

    # Show a subtle heartbeat every poll
    printf "\r  ${DIM}[$(ts)] Watching... (${BUILDS_COMPLETED} builds completed)${NC}  "
    sleep "$POLL_INTERVAL"
done
