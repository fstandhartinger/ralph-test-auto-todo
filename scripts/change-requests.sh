#!/bin/bash
#
# Change Requests CLI for Ralph Loops
# Interact with the change-requests API
#
# Usage:
#   ./scripts/change-requests.sh list              # List all open change requests
#   ./scripts/change-requests.sh list --all        # List all change requests (any status)
#   ./scripts/change-requests.sh get <id>          # Get a specific change request
#   ./scripts/change-requests.sh create <title> <description> [priority]  # Create a new request
#   ./scripts/change-requests.sh update <id> <status>  # Update status (open/in_progress/completed/rejected)
#

set -e

# Configuration
API_BASE="${CHANGE_REQUESTS_API_URL:-https://ralph-test-auto-todo.onrender.com/api/change-requests}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
    echo -e "${BLUE}Change Requests CLI${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 list [--all]                           List change requests (default: open only)"
    echo "  $0 get <id>                               Get a specific change request"
    echo "  $0 create <title> <description> [priority] Create a new request (priority: low/medium/high)"
    echo "  $0 update <id> <status>                   Update status (open/in_progress/completed/rejected)"
    echo ""
    echo "Environment:"
    echo "  CHANGE_REQUESTS_API_URL  Override the API endpoint (default: production)"
    exit 1
}

list_requests() {
    local show_all=${1:-false}
    local response=$(curl -s "$API_BASE")

    if [ "$show_all" = "true" ]; then
        echo "$response" | jq '.'
    else
        echo "$response" | jq '[.[] | select(.status == "open" or .status == "in_progress")]'
    fi
}

get_request() {
    local id=$1
    if [ -z "$id" ]; then
        echo -e "${RED}Error: ID is required${NC}"
        usage
    fi
    curl -s "$API_BASE/$id" | jq '.'
}

create_request() {
    local title=$1
    local description=$2
    local priority=${3:-medium}

    if [ -z "$title" ] || [ -z "$description" ]; then
        echo -e "${RED}Error: Title and description are required${NC}"
        usage
    fi

    curl -s -X POST "$API_BASE" \
        -H "Content-Type: application/json" \
        -d "{\"title\": \"$title\", \"description\": \"$description\", \"priority\": \"$priority\"}" | jq '.'
}

update_request() {
    local id=$1
    local status=$2

    if [ -z "$id" ] || [ -z "$status" ]; then
        echo -e "${RED}Error: ID and status are required${NC}"
        usage
    fi

    curl -s -X PUT "$API_BASE/$id" \
        -H "Content-Type: application/json" \
        -d "{\"status\": \"$status\"}" | jq '.'
}

# Main
case "${1:-}" in
    list)
        if [ "${2:-}" = "--all" ]; then
            list_requests true
        else
            list_requests false
        fi
        ;;
    get)
        get_request "$2"
        ;;
    create)
        create_request "$2" "$3" "$4"
        ;;
    update)
        update_request "$2" "$3"
        ;;
    *)
        usage
        ;;
esac
