#!/bin/bash
#
# Ralph Wiggum Loop - Multi-Source Issue-Driven Edition
# Endless autonomous development loop that implements issues from:
#   1. GitHub Issues
#   2. Change Requests API (https://ralph-test-auto-todo.onrender.com/api/change-requests)
#
# Usage:
#   ./scripts/ralph-loop.sh           # Run forever (default)
#   ./scripts/ralph-loop.sh 20        # Run max 20 iterations
#

set -e

# Configuration
MAX_ITERATIONS=${1:-0}  # 0 = infinite
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DONE_SIGNAL="<promise>DONE</promise>"
CHANGE_REQUESTS_API="https://ralph-test-auto-todo.onrender.com/api/change-requests"

# Wait times for when no issues exist (in seconds)
WAIT_CYCLE=(60 300 600)  # 1 min, 5 min, 10 min
WAIT_INDEX=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to fetch open change requests from API
fetch_change_requests() {
    curl -s "$CHANGE_REQUESTS_API" 2>/dev/null | jq -r '[.[] | select(.status == "open" or .status == "in_progress")] | length' 2>/dev/null || echo "0"
}

# Function to get change requests details
get_change_requests_list() {
    curl -s "$CHANGE_REQUESTS_API" 2>/dev/null | jq -r '.[] | select(.status == "open" or .status == "in_progress") | "[\(.priority | ascii_upcase)] \(.title): \(.description | split("\n")[0])"' 2>/dev/null || echo ""
}

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     RALPH WIGGUM - MULTI-SOURCE AUTONOMOUS DEV LOOP      ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Project: ${GREEN}ralph-test-auto-todo${BLUE}                           ║${NC}"
echo -e "${BLUE}║  Sources: ${MAGENTA}GitHub Issues${BLUE} + ${MAGENTA}Change Requests API${BLUE}           ║${NC}"
echo -e "${BLUE}║  Mode: ${GREEN}Fetch → Implement → Deploy → Verify${BLUE}              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# The prompt that drives the agent
PROMPT='You are Ralph Wiggum, an autonomous AI developer.

Read constitution.md first - it contains your complete instructions.

Your workflow:
1. Check for work from TWO sources:
   a) GitHub Issues: `gh issue list --state open`
   b) Change Requests API: `curl -s https://ralph-test-auto-todo.onrender.com/api/change-requests | jq ".[] | select(.status == \"open\" or .status == \"in_progress\")"`

2. If work exists from EITHER source:
   - Pick the highest priority item (high > medium > low for Change Requests, or oldest for GitHub)
   - For Change Requests: Update status to "in_progress" first:
     `curl -X PUT https://ralph-test-auto-todo.onrender.com/api/change-requests/CHANGE_REQUEST_ID -H "Content-Type: application/json" -d "{\"status\": \"in_progress\"}"`
   - Implement it following the Definition of Done in constitution.md
   - This includes: tests, build, commit, push, monitor Render deploy, visual verification
   - When done:
     * For GitHub Issues: Close the issue
     * For Change Requests: Update status to "completed":
       `curl -X PUT https://ralph-test-auto-todo.onrender.com/api/change-requests/CHANGE_REQUEST_ID -H "Content-Type: application/json" -d "{\"status\": \"completed\"}"`
   - Output: <promise>DONE</promise>

3. If NO work exists from either source:
   - Output: <promise>NO_ISSUES</promise>
   - (The loop will handle waiting)

Priority order when both sources have items:
1. High priority Change Requests
2. GitHub Issues (oldest first)
3. Medium priority Change Requests
4. Low priority Change Requests

Remember:
- ONE issue/request at a time
- ALL tests must pass BEFORE committing
- Monitor Render deployment via Render MCP
- Visually verify the deployed feature
- Log breakthroughs/blockers in ralph_history.txt
- Update Change Request status via API when starting AND completing

DO NOT output <promise>DONE</promise> unless the issue is fully complete and deployed.'

# Main loop
ITERATION=0
while true; do
    ITERATION=$((ITERATION + 1))

    # Check max iterations
    if [ "$MAX_ITERATIONS" -gt 0 ] && [ "$ITERATION" -gt "$MAX_ITERATIONS" ]; then
        echo -e "${YELLOW}Max iterations ($MAX_ITERATIONS) reached. Exiting.${NC}"
        exit 0
    fi

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  ITERATION $ITERATION $([ "$MAX_ITERATIONS" -gt 0 ] && echo "of $MAX_ITERATIONS")${NC}"
    echo -e "${CYAN}  $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Pre-check: Show what's available from both sources
    echo -e "${BLUE}Checking for work...${NC}"

    # Check GitHub Issues
    GH_ISSUES=$(cd "$PROJECT_DIR" && gh issue list --state open --json number,title --jq 'length' 2>/dev/null || echo "0")
    echo -e "  ${MAGENTA}GitHub Issues:${NC} $GH_ISSUES open"

    # Check Change Requests API
    CR_COUNT=$(fetch_change_requests)
    echo -e "  ${MAGENTA}Change Requests:${NC} $CR_COUNT open/in_progress"

    if [ "$CR_COUNT" != "0" ] && [ "$CR_COUNT" != "" ]; then
        echo -e "${BLUE}  Change Requests:${NC}"
        get_change_requests_list | while read -r line; do
            echo -e "    - $line"
        done
    fi
    echo ""

    # Run Claude Code and capture output
    OUTPUT=$(cd "$PROJECT_DIR" && claude --print "$PROMPT" 2>&1) || true

    echo "$OUTPUT"
    echo ""

    # Check for completion signals
    if echo "$OUTPUT" | grep -q "$DONE_SIGNAL"; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              ISSUE/REQUEST COMPLETED & DEPLOYED!           ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        WAIT_INDEX=0  # Reset wait cycle after successful completion
        sleep 5  # Brief pause before checking for next issue

    elif echo "$OUTPUT" | grep -q "<promise>NO_ISSUES</promise>"; then
        WAIT_TIME=${WAIT_CYCLE[$WAIT_INDEX]}
        WAIT_MIN=$((WAIT_TIME / 60))

        echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║           NO OPEN ISSUES OR CHANGE REQUESTS FOUND          ║${NC}"
        echo -e "${YELLOW}║            Waiting ${WAIT_MIN} minute(s) before retry...              ║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"

        sleep "$WAIT_TIME"

        # Advance wait cycle (1 -> 5 -> 10 -> 1 -> ...)
        WAIT_INDEX=$(( (WAIT_INDEX + 1) % ${#WAIT_CYCLE[@]} ))

    else
        echo -e "${RED}No completion signal found. Issue may be in progress or blocked.${NC}"
        echo -e "${RED}Retrying in 30 seconds...${NC}"
        sleep 30
    fi
done
