#!/bin/bash
# ============================================================
# Bloom Build Launcher - Spawns All 5 Agents in Parallel
# ============================================================
# Usage: bash scripts/ops/bloom-build.sh
#
# Opens 5 Terminal windows, each running a Claude Code agent.
# Agents 1-4 launch immediately. Agent 5 launches after a delay.
#
# Requirements:
#   - macOS (uses Terminal.app or iTerm2)
#   - Claude Code CLI installed (run: npm install -g @anthropic-ai/claude-code)
#   - Must be run from the project root (directory with CLAUDE.md)
#
# If Claude CLI isn't installed, the script opens terminals with
# copy-paste commands ready to go.
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ---- Config ----
AGENT_5_DELAY=180  # seconds (3 minutes)
PROJECT_DIR="$(pwd)"

# ---- Safety check ----
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${RED}ERROR: Must be run from the project root directory.${NC}"
    echo "  (The directory that contains CLAUDE.md)"
    exit 1
fi

if [ ! -f "docs/QUICK_START_AGENTS.md" ]; then
    echo -e "${RED}ERROR: docs/QUICK_START_AGENTS.md not found.${NC}"
    echo "  This file contains the agent instructions. Cannot proceed without it."
    exit 1
fi

# ---- Detect Claude CLI ----
CLAUDE_CMD=""

if command -v claude &> /dev/null; then
    CLAUDE_CMD="claude"
elif command -v npx &> /dev/null; then
    # Check if @anthropic-ai/claude-code is available via npx
    CLAUDE_CMD="npx -y @anthropic-ai/claude-code"
fi

# ---- Detect Terminal App ----
TERM_APP="Terminal"
if [ -d "/Applications/iTerm.app" ]; then
    TERM_APP="iTerm"
fi

# ---- Banner ----
echo ""
echo -e "${BOLD}=========================================="
echo "  BLOOM: Parallel Build Launcher"
echo "==========================================${NC}"
echo ""
echo -e "  Project: ${CYAN}${PROJECT_DIR}${NC}"
echo -e "  Terminal: ${CYAN}${TERM_APP}${NC}"

if [ -n "$CLAUDE_CMD" ]; then
    echo -e "  Claude: ${GREEN}${CLAUDE_CMD}${NC}"
    echo -e "  Mode: ${GREEN}Fully Automatic${NC}"
else
    echo -e "  Claude: ${YELLOW}Not found in PATH${NC}"
    echo -e "  Mode: ${YELLOW}Manual (terminals open, you paste the command)${NC}"
fi

echo ""
echo -e "${CYAN}Build Plan:${NC}"
echo "  Agent 1: Blueprint (types, mock data, DB schema)"
echo "  Agent 2: Brand (landing page, design system)"
echo "  Agent 3: Shell (dashboard layout, sidebar, auth)"
echo "  Agent 4: Pages (feature pages, settings)"
echo "  Agent 5: Closer (fix imports, verify) -- launches after ${AGENT_5_DELAY}s delay"
echo ""

# ---- Confirmation ----
read -p "Launch all 5 agents? (y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${RED}Aborted.${NC}"
    exit 0
fi

echo ""

# ---- Launch Functions ----

launch_terminal_app() {
    local agent_num=$1
    local prompt="Agent ${agent_num}"

    if [ -n "$CLAUDE_CMD" ]; then
        # Full auto: open terminal, cd to project, run claude with agent prompt
        osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '${PROJECT_DIR}' && ${CLAUDE_CMD} '${prompt}'"
end tell
EOF
    else
        # Manual: open terminal, cd to project, show instructions
        osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '${PROJECT_DIR}' && echo '──────────────────────────────────' && echo '  BLOOM Agent ${agent_num}' && echo '  Run: claude \"${prompt}\"' && echo '──────────────────────────────────' && echo ''"
end tell
EOF
    fi
}

launch_iterm() {
    local agent_num=$1
    local prompt="Agent ${agent_num}"

    if [ -n "$CLAUDE_CMD" ]; then
        osascript <<EOF
tell application "iTerm"
    activate
    create window with default profile
    tell current session of current window
        write text "cd '${PROJECT_DIR}' && ${CLAUDE_CMD} '${prompt}'"
    end tell
end tell
EOF
    else
        osascript <<EOF
tell application "iTerm"
    activate
    create window with default profile
    tell current session of current window
        write text "cd '${PROJECT_DIR}' && echo '──────────────────────────────────' && echo '  BLOOM Agent ${agent_num}' && echo '  Run: claude \"${prompt}\"' && echo '──────────────────────────────────'"
    end tell
end tell
EOF
    fi
}

launch_agent() {
    local agent_num=$1

    if [ "$TERM_APP" = "iTerm" ]; then
        launch_iterm "$agent_num"
    else
        launch_terminal_app "$agent_num"
    fi

    echo -e "  ${GREEN}✓${NC} Agent ${agent_num} launched"
}

# ---- Launch Agents 1-4 ----
echo -e "${CYAN}Launching Agents 1-4...${NC}"

for i in 1 2 3 4; do
    launch_agent "$i"
    sleep 1  # small delay so windows don't stack on top of each other
done

echo ""
echo -e "${GREEN}Agents 1-4 are running.${NC}"
echo ""

# ---- Schedule Agent 5 ----
echo -e "${YELLOW}Agent 5 launches in ${AGENT_5_DELAY} seconds ($(( AGENT_5_DELAY / 60 )) minutes)...${NC}"
echo "  (Waiting for Agents 1-4 to create their files first)"
echo ""
echo -e "  ${CYAN}Tip:${NC} You can watch progress in the terminal windows."
echo -e "  ${CYAN}Tip:${NC} Press Ctrl+C here to cancel Agent 5 (Agents 1-4 keep running)."
echo ""

# Countdown
remaining=$AGENT_5_DELAY
while [ $remaining -gt 0 ]; do
    mins=$(( remaining / 60 ))
    secs=$(( remaining % 60 ))
    printf "\r  Agent 5 in: %d:%02d " $mins $secs
    sleep 1
    remaining=$(( remaining - 1 ))
done
printf "\r                          \r"

echo -e "${CYAN}Launching Agent 5 (The Closer)...${NC}"
launch_agent 5

echo ""
echo -e "${GREEN}=========================================="
echo "  All 5 Agents Launched!"
echo "==========================================${NC}"
echo ""
echo "  Each agent is building in its own terminal window."
echo "  Estimated total build time: ~5-10 minutes."
echo ""
echo "  When all agents finish:"
echo -e "    1. Run: ${BOLD}cd web && npm run dev${NC}"
echo -e "    2. Open: ${BOLD}http://localhost:3000${NC}"
echo -e "    3. Say: ${BOLD}\"Launch\"${NC} to deploy to production"
echo ""
