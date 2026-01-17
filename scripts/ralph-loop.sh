#!/bin/bash
#
# Ralph Wiggum Loop - Claude Code Edition
# Implements Geoffrey Huntley's iterative bash loop methodology
#
# Usage:
#   ./scripts/ralph-loop.sh           # Run in build mode (default)
#   ./scripts/ralph-loop.sh plan      # Run in plan mode
#   ./scripts/ralph-loop.sh 20        # Run with max 20 iterations
#

set -e

# Configuration
MAX_ITERATIONS=${1:-100}
MODE=${2:-build}
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DONE_SIGNAL="<promise>DONE</promise>"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              RALPH WIGGUM LOOP - STARTING                  ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Mode: ${GREEN}$MODE${BLUE}                                               ║${NC}"
echo -e "${BLUE}║  Max Iterations: ${GREEN}$MAX_ITERATIONS${BLUE}                                      ║${NC}"
echo -e "${BLUE}║  Project: ${GREEN}$PROJECT_DIR${BLUE}${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Build the prompt based on mode
if [ "$MODE" = "plan" ]; then
    PROMPT="You are Ralph Wiggum in PLAN mode.

Read constitution.md to understand project principles.
Review specs/ folder for pending specifications.
Create or update IMPLEMENTATION_PLAN.md with a detailed task breakdown.

When planning is complete, output: $DONE_SIGNAL"
else
    PROMPT="You are Ralph Wiggum in BUILD mode.

1. Read constitution.md to understand project principles
2. Check ralph_history.txt for context from previous iterations
3. Look in specs/ for incomplete specifications
4. Pick ONE spec and implement it fully
5. Run tests to verify acceptance criteria
6. Commit changes with a clear message
7. Log any breakthroughs or blockers to ralph_history.txt

IMPORTANT: Only output $DONE_SIGNAL when:
- ALL acceptance criteria are verified passing
- Tests pass
- Changes are committed

If you cannot complete the spec, do NOT output the done signal.
Instead, document the blocker in ralph_history.txt."
fi

# Main loop
for ((i=1; i<=MAX_ITERATIONS; i++)); do
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  ITERATION $i of $MAX_ITERATIONS${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Run Claude Code and capture output
    # Using --dangerously-skip-permissions for full autonomy (use with caution!)
    OUTPUT=$(cd "$PROJECT_DIR" && claude --print "$PROMPT" 2>&1) || true

    echo "$OUTPUT"
    echo ""

    # Check for completion signal
    if echo "$OUTPUT" | grep -q "$DONE_SIGNAL"; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                    SPEC COMPLETED!                         ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

        # Check if there are more specs to process
        REMAINING=$(find "$PROJECT_DIR/specs" -name "*.md" -exec grep -l "\- \[ \]" {} \; 2>/dev/null | wc -l)

        if [ "$REMAINING" -eq 0 ]; then
            echo -e "${GREEN}All specs completed! Ralph is done.${NC}"
            exit 0
        else
            echo -e "${BLUE}$REMAINING spec(s) remaining. Continuing...${NC}"
            echo ""
        fi
    else
        echo -e "${RED}Completion signal not found. Retrying...${NC}"
        echo ""
    fi

    # Small delay between iterations
    sleep 2
done

echo -e "${RED}Max iterations reached. Check ralph_history.txt for status.${NC}"
exit 1
