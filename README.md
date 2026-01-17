# ralph-test-auto-todo

> A self-evolving autonomous development project powered by AI

## What Is This?

This project demonstrates **fully autonomous AI-driven development**. An AI agent (Ralph Wiggum) runs in an endless loop, reading GitHub issues and implementing them one by one — completely autonomously.

**The twist:** The base application is a simple todo tracker, but it can evolve into *anything* — a kanban board, calendar app, project manager, or whatever you describe in issues. The AI builds whatever you ask for.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    RALPH WIGGUM LOOP                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐                                           │
│   │ Check GitHub│                                           │
│   │   Issues    │                                           │
│   └──────┬──────┘                                           │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐     ┌─────────────────────────────────┐   │
│   │Issues exist?├─YES─►  Pick oldest issue              │   │
│   └──────┬──────┘     │  ↓                              │   │
│          │            │  Implement feature              │   │
│          NO           │  ↓                              │   │
│          │            │  Run tests (unit + E2E)         │   │
│          ▼            │  ↓                              │   │
│   ┌─────────────┐     │  Build project                  │   │
│   │   Wait...   │     │  ↓                              │   │
│   │ 1m → 5m → 10m│     │  Commit & push                  │   │
│   │   (repeat)  │     │  ↓                              │   │
│   └──────┬──────┘     │  Monitor Render deployment      │   │
│          │            │  ↓                              │   │
│          │            │  Visually verify in production  │   │
│          │            │  ↓                              │   │
│          │            │  Close issue                    │   │
│          │            └─────────────────────────────────┘   │
│          │                         │                        │
│          └─────────────────────────┘                        │
│                                                             │
│   Each iteration = Fresh context (no degradation)           │
│   Shared state = Files on disk + Git + GitHub Issues        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- **Issue-Driven Development** — Just create GitHub issues describing what you want
- **Fully Autonomous** — No human intervention needed once running
- **Self-Verifying** — Runs tests, monitors deployment, visually confirms features work
- **Fresh Context Each Loop** — Prevents AI context degradation over long sessions
- **Evolving Application** — Starts as a todo app, becomes whatever you describe

## Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript (strict mode)
- **Testing:** Playwright for E2E tests
- **Deployment:** Render (auto-deploy on push)
- **AI Agent:** Claude Code with Ralph Wiggum methodology

## Getting Started

### Prerequisites

- Node.js 18+
- GitHub CLI (`gh`) authenticated
- Claude Code CLI installed
- Render account with project connected

### Running the Loop

```bash
# Run forever (default)
./scripts/ralph-loop.sh

# Run with max iterations
./scripts/ralph-loop.sh 20

# For full autonomy (YOLO mode - use with caution!)
claude --dangerously-skip-permissions
```

### Creating Issues

Just create GitHub issues! The AI will pick them up and implement them.

**Good issue example:**
```markdown
Title: Add ability to mark todos as complete

Description:
- Add a checkbox next to each todo item
- Clicking the checkbox should toggle the completed state
- Completed todos should have strikethrough text
- Persist the completed state
```

## Project Structure

```
ralph-test-auto-todo/
├── README.md                # You are here
├── constitution.md          # Project principles & AI instructions
├── ralph_history.txt        # Log of breakthroughs and blockers
├── scripts/
│   └── ralph-loop.sh        # The endless autonomous loop
└── (app code will be here)
```

## The Constitution

The `constitution.md` file defines:
- Project principles (TDD, type safety, simplicity)
- Definition of Done (tests → build → deploy → verify)
- AI agent workflow instructions
- Waiting logic when no issues exist

The AI reads this file at the start of each iteration to understand how to work.

## Philosophy

This project is inspired by [Geoffrey Huntley's Ralph Wiggum methodology](https://github.com/ghuntley/how-to-ralph-wiggum) — the idea that AI agents work best when:

1. **Fresh context each iteration** — No context window overflow
2. **Clear completion signals** — Only "done" when truly done
3. **Backpressure via tests** — Tests act as guardrails
4. **State on disk** — Git and files are the source of truth

## Contributing

The fun part: you contribute by creating issues! Describe what you want, and Ralph will build it.

## License

MIT

---

*Built autonomously by Ralph Wiggum* 🤖
