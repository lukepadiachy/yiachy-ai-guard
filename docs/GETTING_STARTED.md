# Getting Started with Yiachy Guard

## What We Built

Your AI security platform is structured and ready to build. Here's what's set up:

```
yiachy-guard/
├── .claude/
│   ├── CLAUDE.md                    # Project context for AI
│   └── commands/                    # Step-by-step build prompts
│       ├── start-building.md        # Kickoff guide
│       ├── setup-project.md         # Phase 1: Init
│       ├── build-security.md        # Phase 2: Security core
│       ├── build-api.md             # Phase 3: API layer
│       ├── build-dashboard.md       # Phase 4: Dashboard UI
│       └── test-security.md         # Phase 5: Testing
├── PROJECT_PLAN.md                  # Full architecture + plan
├── README.md                        # Project overview
├── .env.example                     # Environment template
└── .gitignore                       # Git ignore rules
```

## Tech Stack Validated ✅

All dependencies are **production-ready for December 2025**:

- **Next.js 16.1.1** - Latest stable with React 19 + Turbopack (Dec 18, 2025)
- **Vercel AI SDK 6.0.2** - Stable with agents + MCP (Dec 23, 2025)
- **shadcn/ui** - Full Next.js 16 + Tailwind v4 support
- **OpenGuardrails** - Only production-ready security library
- **TypeScript** - Full type safety

## How to Build

### Option 1: Use Claude Code Commands (Recommended)

```bash
# In Claude Code, run these commands in order:
/start-building      # Kickoff + Phase 1
/build-security      # Phase 2
/build-api           # Phase 3
/build-dashboard     # Phase 4
/test-security       # Phase 5
```

### Option 2: Manual Build

1. Read `PROJECT_PLAN.md` for full architecture
2. Follow each phase in `.claude/commands/` manually
3. Test after each phase

## Build Phases

| Phase | Command | Builds |
|-------|---------|--------|
| 1 | `/setup-project` | Next.js 15 + deps, folder structure |
| 2 | `/build-security` | Sanitizer, OpenGuardrails, Policy Engine |
| 3 | `/build-api` | Proxy endpoint, Threat API, Middleware |
| 4 | `/build-dashboard` | Security dashboard with shadcn/ui |
| 5 | `/test-security` | Tests, red team, CI/CD |

## Architecture Highlights

This project uses **2025 best practices** for scalability:

✅ **Feature-Based** - Organize by domain (security, threats, policies)
✅ **Dependency Injection** - Centralized configs + reusable services
✅ **Reusable Agents** - AI SDK 6 Agent pattern (define once, use everywhere)
✅ **Atomic Design** - UI component hierarchy (atoms → organisms)
✅ **Modular Monolith** - Start simple, scale to monorepo later if needed

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for full design details.

## Why This Approach?

✅ **Lean prompts** - Each command is <500 tokens
✅ **Step-by-step** - No overwhelming context dumps
✅ **Scalable** - Feature modules can extract to packages
✅ **Testable** - DI makes mocking easy
✅ **Cost-effective** - Avoid redundant context re-sends

## Next Steps

1. **Navigate to project:**
   ```bash
   cd /Users/lukepadiachy/personal-projects/yiachy-guard
   ```

2. **Run first command:**
   ```bash
   /start-building
   ```

3. **Let the prompts guide you** through each phase

## Project Goals

Build a **production-ready AI security gateway** that:
- Blocks prompt injection attacks in real-time
- Provides security dashboard for monitoring
- Offers API gateway for all LLM requests
- Includes red team toolkit for testing

## Resources

- [Next.js 16.1](https://nextjs.org/blog/next-16-1)
- [Next.js 16 Docs](https://nextjs.org/blog/next-16)
- [Vercel AI SDK 6](https://vercel.com/blog/ai-sdk-6)
- [shadcn/ui](https://ui.shadcn.com/docs/installation/next)
- [OpenGuardrails](https://www.openguardrails.com/)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

---

**Ready to cook? Run `/start-building` 🚀**
