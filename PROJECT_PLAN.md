# Yiachy Guard - AI Security Platform

**Tagline:** "Protecting AI from Tomorrow's Attacks"

## Tech Stack (2025 - Production Ready)

- **Next.js 16.1.1** - App Router, React 19, Turbopack
- **Vercel AI SDK 6.0.2** - Stable (agents, tool approval, MCP)
- **shadcn/ui + Tailwind v4** - Component system
- **OpenGuardrails** - Production-ready AI security (open source)
- **TypeScript** - Full type safety
- **PostgreSQL/Redis** - Audit logs + policies
- **Vercel** - Deployment

## Core Features (MVP)

1. **Prompt Injection Defense**
   - Real-time detection + blocking
   - Pre-processing sanitization
   - Multi-layer validation

2. **Security Dashboard**
   - Live threat monitoring
   - Attack pattern visualization
   - Audit trail + logs

3. **API Gateway**
   - Middleware for all LLM requests
   - Policy enforcement engine
   - Rate limiting + access control

4. **Red Team Toolkit**
   - Test injection vectors
   - Security scoring
   - Compliance reporting

## Architecture

```
Frontend (Next.js)
    ↓
Security API Layer (Edge Functions)
    ↓
┌─────────────┬──────────────┬──────────────┐
│  Sanitizer  │   Detector   │    Policy    │
│  (DataFilt) │(OpenGuard)   │   Engine     │
└─────────────┴──────────────┴──────────────┘
    ↓
LLM APIs (OpenAI/Anthropic/etc)
```

## Repo Structure

```
yiachy-guard/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Dashboard pages
│   ├── api/                 # API routes
│   └── components/          # UI components
├── lib/
│   ├── security/            # Security modules
│   │   ├── sanitizer/
│   │   ├── detector/
│   │   └── policy/
│   ├── db/                  # Database client
│   └── utils/
├── .claude/
│   └── commands/            # Build prompts
├── public/
└── config/
```

## Build Phases

1. **Setup** - Next.js 16 + feature-based structure
2. **DI Setup** - Container + centralized configs
3. **Security Core** - Feature module with services + agents (DI)
4. **API Layer** - Edge routes using DI services
5. **Dashboard** - UI with Atomic Design
6. **Testing** - Unit + integration + red team
7. **Deploy** - Vercel production

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for scalable design patterns.

## Quick Start

```bash
# Use Claude Code commands:
/setup-project      # Phase 1
/build-security     # Phase 2
/build-api          # Phase 3
/build-dashboard    # Phase 4
/test-security      # Phase 5
```

## Sources

- [Next.js 16.1](https://nextjs.org/blog/next-16-1)
- [Next.js 16](https://nextjs.org/blog/next-16)
- [Vercel AI SDK 6](https://vercel.com/blog/ai-sdk-6)
- [shadcn/ui](https://ui.shadcn.com/docs/installation/next)
- [OpenGuardrails](https://www.openguardrails.com/)
