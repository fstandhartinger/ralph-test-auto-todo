# Spec 001: Project Setup

> Initialize the Next.js project with TypeScript and testing infrastructure

## Requirements

- Create a new Next.js 14+ project with TypeScript
- Set up Playwright for E2E testing
- Create a basic homepage with a title
- Ensure the development server runs correctly

## Acceptance Criteria

- [ ] Next.js project initialized with TypeScript
- [ ] `package.json` includes Playwright as a dev dependency
- [ ] Playwright config file exists (`playwright.config.ts`)
- [ ] Homepage (`app/page.tsx`) displays "ralph-test-auto-todo"
- [ ] E2E test exists that verifies the homepage title
- [ ] `npm run dev` starts the development server without errors
- [ ] `npm run test:e2e` runs Playwright tests successfully

## Technical Notes

- Use App Router (not Pages Router)
- Use `npx create-next-app@latest` with TypeScript option
- Install Playwright with `npx playwright install`

## Definition of Done

All acceptance criteria checked, tests passing, changes committed.

**Output when complete:** `<promise>DONE</promise>`
