# Yiachy Guard 🛡️

**Protecting AI from Tomorrow's Attacks**

An open-source AI security platform that defends LLM applications against prompt injection, jailbreaks, and adversarial attacks.

## Features

- 🔒 **Real-time Prompt Injection Defense** - Multi-layer detection + blocking
- 📊 **Security Dashboard** - Monitor threats and attack patterns
- 🚀 **API Gateway** - Secure proxy for all LLM requests
- 🎯 **Red Team Toolkit** - Test your defenses with real attack vectors
- 📈 **Audit Logging** - Complete trail of all security events
- ⚡ **Edge Deployment** - Low latency on Vercel Edge Functions

## Tech Stack

Built with production-ready, December 2025 technologies:

- [Next.js 16.1.1](https://nextjs.org/blog/next-16-1) - App Router + React 19 + Turbopack
- [Vercel AI SDK 6.0.2](https://vercel.com/blog/ai-sdk-6) - Agents + MCP + Tool Approval
- [shadcn/ui](https://ui.shadcn.com/docs/installation/next) - Component library
- [OpenGuardrails](https://www.openguardrails.com/) - AI security detection
- TypeScript + Tailwind CSS v4

## Quick Start

```bash
# Clone repo
git clone https://github.com/lukepadiachy/yiachy-ai-guard.git
cd yiachy-ai-guard

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your API keys

# Run dev server
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

## Development Workflow

### Commit Standards

**Format:** `type(scope): description`

**Examples:**
- `feat(security): add prompt injection detection`
- `fix(api): resolve threat scoring bug`
- `refactor(ui): improve dashboard layout`
- `docs(readme): update setup instructions`

**Types:** feat, fix, refactor, docs, style, test
**Scopes:** security, api, ui, db, config, deps

## Project Structure

```
yiachy-guard/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── components/        # UI components
├── lib/
│   ├── security/          # Security modules
│   │   ├── sanitizer/     # Input sanitization
│   │   ├── detector/      # Threat detection
│   │   └── policy/        # Policy engine
│   ├── db/                # Database client
│   └── utils/             # Utilities
└── tests/                 # Test suites
```

## Building the Platform

Use Claude Code commands for step-by-step development:

```bash
/setup-project      # Phase 1: Initialize
/build-security     # Phase 2: Security core
/build-api          # Phase 3: API layer
/build-dashboard    # Phase 4: Dashboard UI
/test-security      # Phase 5: Testing
```

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for full details.

## Security

This platform addresses OWASP LLM Top 10 vulnerabilities, with primary focus on:
- **LLM01**: Prompt Injection
- **LLM02**: Insecure Output Handling
- **LLM06**: Sensitive Information Disclosure

## Documentation

- [Getting Started](./docs/GETTING_STARTED.md) - Quick start guide
- [Project Plan](./PROJECT_PLAN.md) - Tech stack + build phases
- [Architecture](./docs/ARCHITECTURE.md) - Scalable design patterns
- [Scalability](./docs/SCALABILITY.md) - Scaling path + migration strategies
- [API Docs](./docs/api.md) - API reference _(coming soon)_
- [Security Guide](./docs/security.md) - Best practices _(coming soon)_

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## Acknowledgments

Built on research from:
- [OpenGuardrails](https://www.openguardrails.com/)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Meta's LlamaFirewall](https://www.reddit.com/r/OpenSourceeAI/comments/1ki96se)

---

**Built with ❤️ to make AI safer**
