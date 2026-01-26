# Project Constitution: ralph-test-auto-todo

> This document defines the principles and rules that guide all development on this project.
> The AI agent must follow these guidelines when implementing features.

## Project Vision

This is a **self-evolving autonomous development project**. The core idea:

1. An endless loop of Ralph loops runs continuously
2. The agent reads work items from **TWO sources**: GitHub Issues AND the Change Requests API
3. When no work items remain, it waits (1 min → 5 min → 10 min, repeating) until new items arrive
4. The base application is a **todo tracker**, but it can evolve into anything — a kanban board, calendar app, or whatever — based entirely on the issues/requests submitted

**This project demonstrates that you can point an AI agent at a repo and let it autonomously build whatever you describe in issues or change requests.**

## Project Overview

**Type:** Web Application
**Stack:** Next.js + TypeScript + PostgreSQL (Neon)
**Deployment:** Render (auto-deploy on push)
**Work Sources:** GitHub Issues + Change Requests API

### Render Deployment Details

- **Service URL:** https://ralph-test-auto-todo.onrender.com
- **Service ID:** srv-d5lr6emr433s73dhi2tg
- **Dashboard:** https://dashboard.render.com/web/srv-d5lr6emr433s73dhi2tg
- **Auto-deploy:** Enabled (triggers on push to main)

To check deployment status:
```bash
render deploys --service srv-d5lr6emr433s73dhi2tg --output json
```

To view logs:
```bash
render logs --service srv-d5lr6emr433s73dhi2tg --output text
```

## Change Requests System

The Change Requests system is an alternative to GitHub Issues, accessible via API and web UI.

### API Endpoints

**Base URL:** `https://ralph-test-auto-todo.onrender.com/api/change-requests`

#### List all change requests
```bash
curl -s https://ralph-test-auto-todo.onrender.com/api/change-requests
```

#### Get open/in_progress change requests only
```bash
curl -s https://ralph-test-auto-todo.onrender.com/api/change-requests | jq '.[] | select(.status == "open" or .status == "in_progress")'
```

#### Update status to "in_progress" (when starting work)
```bash
curl -X PUT https://ralph-test-auto-todo.onrender.com/api/change-requests/CHANGE_REQUEST_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

#### Update status to "completed" (when done)
```bash
curl -X PUT https://ralph-test-auto-todo.onrender.com/api/change-requests/CHANGE_REQUEST_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

#### Add a comment (e.g., "Working on it", "Done, implemented like this...")
```bash
curl -X POST https://ralph-test-auto-todo.onrender.com/api/change-requests/CHANGE_REQUEST_ID/comments \
  -H "Content-Type: application/json" \
  -d '{"author": "Ralph Wiggum", "content": "Got it, I am working on this now!"}'
```

#### Get comments for a change request
```bash
curl -s https://ralph-test-auto-todo.onrender.com/api/change-requests/CHANGE_REQUEST_ID/comments
```

### Change Request Status Values

- `open` - New request, not yet started
- `in_progress` - Currently being worked on
- `completed` - Implementation finished and deployed
- `rejected` - Will not be implemented

### Change Request Priority Values

- `high` - Urgent, should be done first
- `medium` - Normal priority
- `low` - Can wait

### Web UI

The Change Requests can also be viewed and managed at:
https://ralph-test-auto-todo.onrender.com/change-requests

## Core Principles

### 1. Test-Driven Development
- Write tests before or alongside implementation
- No feature is complete without passing tests
- E2E tests are the primary verification method (Playwright/Cypress)

### 2. Type Safety
- Use TypeScript strictly — avoid `any` types
- Define interfaces/types for all data structures
- Leverage TypeScript's type inference where appropriate

### 3. Simplicity Over Cleverness
- Prefer readable, straightforward code over clever one-liners
- Code should be self-documenting where possible
- If logic is complex, add a brief comment explaining *why*, not *what*

### 4. Small, Atomic Commits
- Each commit should represent a single logical change
- Commit messages should be clear and descriptive
- Commit after each meaningful milestone, not in large batches

## Testing Requirements

- **Primary:** End-to-end tests using Playwright or Cypress
- All acceptance criteria must have corresponding E2E tests
- Tests must pass before marking any spec as DONE

## Definition of Done

A spec/issue/change-request is complete ONLY when:
1. All acceptance criteria are implemented
2. Unit tests pass
3. Integration tests pass
4. Build succeeds (`npm run build`)
5. TypeScript compilation succeeds with no errors
6. Code is committed and pushed (this triggers Render deployment)
7. **Deployment verified:** Use Render MCP to watch deployment logs until deployment succeeds
8. **Visual verification:** Test the deployed app visually to confirm the feature works in production
9. **Status updated:** For Change Requests, update status to `completed` and add a completion comment
10. The agent outputs `<promise>DONE</promise>`

**IMPORTANT:** Steps 1-5 must ALL pass BEFORE committing. Never push broken code.

## AI Agent Instructions

### Multi-Source Issue-Driven Workflow

1. Read this constitution before starting any work
2. Check for work from **TWO sources**:
   - GitHub Issues: `gh issue list --state open`
   - Change Requests API: `curl -s https://ralph-test-auto-todo.onrender.com/api/change-requests | jq '.[] | select(.status == "open" or .status == "in_progress")'`
3. Pick ONE work item at a time using this priority order:
   - High priority Change Requests
   - GitHub Issues (oldest first)
   - Medium priority Change Requests
   - Low priority Change Requests
4. **For Change Requests:** Before starting work:
   - Update status to `in_progress`
   - Add a comment: "Got it, I am working on this now!"
5. Implement following the Definition of Done
6. **For Change Requests:** After completion:
   - Update status to `completed`
   - Add a completion comment describing what was done
7. Log significant breakthroughs or blockers in `ralph_history.txt`
8. Repeat from step 2

### When No Work Items Exist

If no open issues or change requests are found:
1. Wait 1 minute, then check again
2. If still no items, wait 5 minutes, then check again
3. If still no items, wait 10 minutes, then check again
4. Repeat the 1 → 5 → 10 minute cycle indefinitely

### Implementation Steps (Per Work Item)

1. Read and understand the requirements
2. **For Change Requests:** Update status to `in_progress` and add "working on it" comment
3. Plan the implementation (break into small steps if complex)
4. Write tests first (TDD)
5. Implement the feature
6. Run all tests: `npm test` and `npm run test:e2e`
7. Run build: `npm run build`
8. If all pass → commit and push
9. Monitor Render deployment via Render MCP
10. Once deployed, visually test the feature in production
11. **For GitHub Issues:** Close the issue
12. **For Change Requests:** Update status to `completed` and add completion comment
13. Output `<promise>DONE</promise>`

### Example Change Request Workflow

```bash
# 1. Find open change requests
curl -s https://ralph-test-auto-todo.onrender.com/api/change-requests | jq '.[] | select(.status == "open")'

# 2. Pick one (e.g., ID: abc123) and mark as in_progress
curl -X PUT https://ralph-test-auto-todo.onrender.com/api/change-requests/abc123 \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'

# 3. Add a "working on it" comment
curl -X POST https://ralph-test-auto-todo.onrender.com/api/change-requests/abc123/comments \
  -H "Content-Type: application/json" \
  -d '{"author": "Ralph Wiggum", "content": "Got it, I am working on this now!"}'

# 4. Implement the feature...

# 5. Mark as completed
curl -X PUT https://ralph-test-auto-todo.onrender.com/api/change-requests/abc123 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# 6. Add completion comment
curl -X POST https://ralph-test-auto-todo.onrender.com/api/change-requests/abc123/comments \
  -H "Content-Type: application/json" \
  -d '{"author": "Ralph Wiggum", "content": "Done! Implemented the feature with the following changes:\n- Added X component\n- Updated Y service\n- Deployed and verified working"}'
```

### Tools Required

- **GitHub CLI (`gh`)** — for reading/closing GitHub issues
- **curl/jq** — for interacting with the Change Requests API
- **Render MCP** — for monitoring deployments and viewing logs
- **Browser/Puppeteer** — for visual verification of deployed features
