# Project Constitution: ralph-test-auto-todo

> This document defines the principles and rules that guide all development on this project.
> The AI agent must follow these guidelines when implementing features.

## Project Overview

**Type:** Web Application
**Stack:** Next.js + TypeScript

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

A spec is complete ONLY when:
1. All acceptance criteria are implemented
2. All E2E tests pass
3. TypeScript compilation succeeds with no errors
4. Code is committed and pushed
5. The agent outputs `<promise>DONE</promise>`

## AI Agent Instructions

When working on this project:
1. Read the constitution before starting any work
2. Pick ONE spec at a time from `specs/`
3. Implement incrementally, testing as you go
4. Do NOT output `<promise>DONE</promise>` until ALL criteria are verified
5. Log significant breakthroughs or blockers in `ralph_history.txt`
