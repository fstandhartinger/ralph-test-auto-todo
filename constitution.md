# Project Constitution: ralph-test-auto-todo

> This document defines the principles and rules that guide all development on this project.
> The AI agent must follow these guidelines when implementing features.

## Project Vision

This is a **self-evolving autonomous development project**. The core idea:

1. An endless loop of Ralph loops runs continuously
2. The agent reads GitHub issues and implements them one by one
3. When no issues remain, it waits (1 min → 5 min → 10 min, repeating) until new issues arrive
4. The base application is a **todo tracker**, but it can evolve into anything — a kanban board, calendar app, or whatever — based entirely on the issues submitted

**This project demonstrates that you can point an AI agent at a repo and let it autonomously build whatever you describe in issues.**

## Project Overview

**Type:** Web Application
**Stack:** Next.js + TypeScript
**Deployment:** Render (auto-deploy on push)
**Issue Source:** GitHub Issues

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

A spec/issue is complete ONLY when:
1. All acceptance criteria are implemented
2. Unit tests pass
3. Integration tests pass
4. Build succeeds (`npm run build`)
5. TypeScript compilation succeeds with no errors
6. Code is committed and pushed (this triggers Render deployment)
7. **Deployment verified:** Use Render MCP to watch deployment logs until deployment succeeds
8. **Visual verification:** Test the deployed app visually to confirm the feature works in production
9. The agent outputs `<promise>DONE</promise>`

**IMPORTANT:** Steps 1-5 must ALL pass BEFORE committing. Never push broken code.

## AI Agent Instructions

### Issue-Driven Workflow

1. Read this constitution before starting any work
2. Check GitHub issues for open issues (use `gh issue list`)
3. Pick ONE issue at a time, starting with the oldest/highest priority
4. Implement the issue following the Definition of Done
5. Close the issue after successful deployment and visual verification
6. Log significant breakthroughs or blockers in `ralph_history.txt`
7. Repeat from step 2

### When No Issues Exist

If no open issues are found:
1. Wait 1 minute, then check again
2. If still no issues, wait 5 minutes, then check again
3. If still no issues, wait 10 minutes, then check again
4. Repeat the 1 → 5 → 10 minute cycle indefinitely

### Implementation Steps (Per Issue)

1. Read and understand the issue requirements
2. Plan the implementation (break into small steps if complex)
3. Write tests first (TDD)
4. Implement the feature
5. Run all tests: `npm test` and `npm run test:e2e`
6. Run build: `npm run build`
7. If all pass → commit and push
8. Monitor Render deployment via Render MCP
9. Once deployed, visually test the feature in production
10. Close the GitHub issue
11. Output `<promise>DONE</promise>`

### Tools Required

- **GitHub CLI (`gh`)** — for reading/closing issues
- **Render MCP** — for monitoring deployments and viewing logs
- **Browser/Puppeteer** — for visual verification of deployed features
