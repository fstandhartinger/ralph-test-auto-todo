#!/bin/bash
#
# Ralph Wiggum Loop - Issue-Driven Edition
# Endless autonomous development loop that implements GitHub issues
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

# Wait times for when no issues exist (in seconds)
WAIT_CYCLE=(60 300 600)  # 1 min, 5 min, 10 min
WAIT_INDEX=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         RALPH WIGGUM - ISSUE-DRIVEN AUTONOMOUS DEV        ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Project: ${GREEN}ralph-test-auto-todo${BLUE}                           ║${NC}"
echo -e "${BLUE}║  Mode: ${GREEN}GitHub Issues → Implement → Deploy → Verify${BLUE}       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# The prompt that drives the agent
PROMPT='You are Ralph Wiggum, an autonomous AI developer.

Read constitution.md first - it contains your complete instructions.

Your workflow:
1. Check for open GitHub issues: `gh issue list --state open`
2. If issues exist:
   - Pick the oldest/highest priority issue
   - Implement it following the Definition of Done in constitution.md
   - This includes: tests, build, commit, push, monitor Render deploy, visual verification
   - Close the issue when done
   - Output: <promise>DONE</promise>
3. If NO issues exist:
   - Output: <promise>NO_ISSUES</promise>
   - (The loop will handle waiting)

Remember:
- ONE issue at a time
- ALL tests must pass BEFORE committing
- Monitor Render deployment via Render MCP
- Visually verify the deployed feature
- Log breakthroughs/blockers in ralph_history.txt

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

    # Run Claude Code and capture output
    OUTPUT=$(cd "$PROJECT_DIR" && claude --print "$PROMPT" 2>&1) || true

    echo "$OUTPUT"
    echo ""

    # Check for completion signals
    if echo "$OUTPUT" | grep -q "$DONE_SIGNAL"; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                  ISSUE COMPLETED & DEPLOYED!               ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        WAIT_INDEX=0  # Reset wait cycle after successful completion
        sleep 5  # Brief pause before checking for next issue

    elif echo "$OUTPUT" | grep -q "<promise>NO_ISSUES</promise>"; then
        WAIT_TIME=${WAIT_CYCLE[$WAIT_INDEX]}
        WAIT_MIN=$((WAIT_TIME / 60))

        echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║                    NO OPEN ISSUES FOUND                    ║${NC}"
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
