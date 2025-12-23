# Yiachy Guard - Scalable Architecture

**Design Philosophy:** Modular, Reusable, Centralized, Production-Ready

## Architecture Principles (2025 Best Practices)

### 1. Modular Monolith First
- Start with **single Next.js app**, internally structured into clean modules
- Easier to manage, deploy, and reason about
- Migrate to microservices only if specific services need independent scaling
- **Source:** [Modern Architecture Trends](https://www.cerbos.dev/blog/modern-application-architecture-trends)

### 2. Feature-Based Structure
- Organize by **features/domains**, not technical layers
- Each feature is self-contained with its own components, hooks, and logic
- Scales better than folder-by-type approach
- **Source:** [Feature-Based Architecture](https://medium.com/@nishibuch25/scaling-react-next-js-apps-a-feature-based-architecture-that-actually-works-c0c89c25936d)

### 3. Dependency Injection
- Centralize configuration and service instantiation
- Use **InversifyJS** or **TSyringe** for DI containers
- Makes testing easier and reduces coupling
- **Source:** [DI in Next.js](https://himynameistim.com/blog/dependency-injection-with-nextjs-and-typescript)

### 4. Reusable Agent Pattern (AI SDK 6)
- Define agents **once**, use everywhere (UI, API, background jobs)
- Agent class manages loops, messages, tools automatically
- **Source:** [AI SDK 6 Agents](https://vercel.com/blog/ai-sdk-6)

### 5. Atomic Design for UI
- **Atoms** → Buttons, Inputs (shadcn/ui primitives)
- **Molecules** → Form fields, Cards
- **Organisms** → Navigation, Dashboard sections
- **Templates** → Page layouts
- **Pages** → Full page implementations

---

## Project Structure (Feature-Based + DI)

```
yiachy-guard/
├── app/                          # Next.js App Router (routing only)
│   ├── (dashboard)/             # Route group
│   │   ├── layout.tsx           # Dashboard layout
│   │   ├── page.tsx             # Dashboard home
│   │   ├── threats/
│   │   │   └── page.tsx
│   │   ├── policies/
│   │   │   └── page.tsx
│   │   └── red-team/
│   │       └── page.tsx
│   └── api/                     # Edge API routes
│       ├── proxy/
│       │   └── route.ts
│       ├── threats/
│       │   └── route.ts
│       └── policies/
│           └── route.ts
│
├── features/                    # Feature modules (business logic)
│   ├── security/               # Security feature
│   │   ├── agents/             # AI agents
│   │   │   ├── GuardianAgent.ts
│   │   │   └── AnalyzerAgent.ts
│   │   ├── services/           # Business logic
│   │   │   ├── SanitizerService.ts
│   │   │   ├── DetectorService.ts
│   │   │   └── PolicyService.ts
│   │   ├── hooks/              # React hooks
│   │   │   └── useSecurityCheck.ts
│   │   ├── components/         # Feature-specific components
│   │   │   └── ThreatAlert.tsx
│   │   └── types.ts            # Feature types
│   │
│   ├── threats/                # Threat management feature
│   │   ├── services/
│   │   │   └── ThreatLogService.ts
│   │   ├── components/
│   │   │   ├── ThreatTable.tsx
│   │   │   └── ThreatDetail.tsx
│   │   └── types.ts
│   │
│   └── policies/               # Policy management feature
│       ├── services/
│       │   └── PolicyEngineService.ts
│       ├── components/
│       │   └── PolicyEditor.tsx
│       └── types.ts
│
├── components/                  # Shared UI components (Atomic Design)
│   ├── ui/                     # Atoms (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── molecules/              # Composed components
│   │   ├── FormField.tsx
│   │   └── SearchBar.tsx
│   └── organisms/              # Complex components
│       ├── Navigation.tsx
│       └── DashboardHeader.tsx
│
├── lib/                        # Core infrastructure
│   ├── di/                     # Dependency Injection
│   │   ├── container.ts        # IoC Container
│   │   ├── providers.ts        # Service providers
│   │   └── types.ts            # DI tokens
│   │
│   ├── config/                 # Centralized configuration
│   │   ├── app.config.ts       # App settings
│   │   ├── security.config.ts  # Security policies
│   │   └── ai.config.ts        # AI model configs
│   │
│   ├── db/                     # Database layer
│   │   ├── client.ts           # DB client
│   │   ├── schema.ts           # Schema definitions
│   │   └── migrations/
│   │
│   └── utils/                  # Shared utilities
│       ├── logger.ts
│       ├── validators.ts
│       └── errors.ts
│
├── types/                      # Global type definitions
│   ├── api.ts
│   ├── security.ts
│   └── index.ts
│
└── tests/                      # Test suites
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Dependency Injection Architecture

### Container Setup (`lib/di/container.ts`)

```typescript
import { Container } from 'inversify';
import { TYPES } from './types';

// Services
import { SanitizerService } from '@/features/security/services/SanitizerService';
import { DetectorService } from '@/features/security/services/DetectorService';
import { PolicyService } from '@/features/security/services/PolicyService';

// Configuration
import { securityConfig } from '@/lib/config/security.config';
import { aiConfig } from '@/lib/config/ai.config';

const container = new Container();

// Bind configurations
container.bind(TYPES.SecurityConfig).toConstantValue(securityConfig);
container.bind(TYPES.AIConfig).toConstantValue(aiConfig);

// Bind services (singleton pattern)
container.bind(TYPES.SanitizerService).to(SanitizerService).inSingletonScope();
container.bind(TYPES.DetectorService).to(DetectorService).inSingletonScope();
container.bind(TYPES.PolicyService).to(PolicyService).inSingletonScope();

export { container };
```

### Service with DI (`features/security/services/DetectorService.ts`)

```typescript
import { injectable, inject } from 'inversify';
import { TYPES } from '@/lib/di/types';
import type { SecurityConfig } from '@/lib/config/security.config';

@injectable()
export class DetectorService {
  constructor(
    @inject(TYPES.SecurityConfig) private config: SecurityConfig
  ) {}

  async detectThreat(prompt: string) {
    // Use centralized config
    const threshold = this.config.threatThreshold;

    // Detection logic...
    return { score, severity, blocked };
  }
}
```

### Usage in API Route (`app/api/proxy/route.ts`)

```typescript
import { container } from '@/lib/di/container';
import { TYPES } from '@/lib/di/types';
import type { DetectorService } from '@/features/security/services/DetectorService';

export const runtime = 'edge';

export async function POST(req: Request) {
  // Get service from container
  const detector = container.get<DetectorService>(TYPES.DetectorService);

  const { prompt } = await req.json();
  const threat = await detector.detectThreat(prompt);

  // ...
}
```

---

## Reusable AI Agent Pattern

### Agent Definition (`features/security/agents/GuardianAgent.ts`)

```typescript
import { Agent } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define once, use everywhere
export const guardianAgent = new Agent({
  model: openai('gpt-4'),
  system: `You are a security guardian that detects prompt injection attacks.
  Analyze prompts and return threat assessments.`,

  tools: {
    analyzeThreat: {
      description: 'Analyze a prompt for security threats',
      parameters: z.object({
        prompt: z.string(),
        context: z.string().optional(),
      }),
      execute: async ({ prompt, context }) => {
        // Detection logic
        return { threatLevel, confidence, reasoning };
      },
    },
  },
});
```

### Use in API (`app/api/proxy/route.ts`)

```typescript
import { guardianAgent } from '@/features/security/agents/GuardianAgent';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // Agent handles loop + tools automatically
  const result = await guardianAgent.execute({
    messages: [{ role: 'user', content: prompt }],
  });

  return Response.json(result);
}
```

### Use in Background Job (`lib/jobs/scan-threats.ts`)

```typescript
import { guardianAgent } from '@/features/security/agents/GuardianAgent';

export async function scanThreats() {
  const recentPrompts = await db.getRecentPrompts();

  for (const prompt of recentPrompts) {
    // Same agent, different context
    const result = await guardianAgent.execute({
      messages: [{ role: 'user', content: prompt }],
    });

    await db.logThreatAnalysis(result);
  }
}
```

---

## Centralized Configuration

### Security Config (`lib/config/security.config.ts`)

```typescript
export const securityConfig = {
  threatThreshold: 0.7,
  blockEnabled: true,

  policies: {
    default: {
      maxPromptLength: 10000,
      allowedPatterns: [],
      blockedPatterns: ['ignore previous', 'system prompt'],
    },
  },

  openguardrails: {
    apiUrl: process.env.OPENGUARDRAILS_URL,
    apiKey: process.env.OPENGUARDRAILS_API_KEY,
  },
} as const;

export type SecurityConfig = typeof securityConfig;
```

### AI Config (`lib/config/ai.config.ts`)

```typescript
export const aiConfig = {
  models: {
    guardian: 'gpt-4',
    analyzer: 'gpt-4-turbo',
  },

  limits: {
    maxTokens: 4096,
    temperature: 0.3,
  },

  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
  },
} as const;

export type AIConfig = typeof aiConfig;
```

---

## Why This Architecture?

### ✅ Scalability
- Feature modules can be extracted into separate packages later
- DI container makes it easy to swap implementations
- Agent abstraction allows horizontal scaling

### ✅ Reusability
- Agents defined once, used everywhere (UI, API, jobs)
- Services injected via DI, no tight coupling
- Shared components follow Atomic Design

### ✅ Centralization
- All config in `lib/config/`
- All DI setup in `lib/di/`
- Single source of truth for services

### ✅ Testability
- Mock services via DI container
- Test features in isolation
- Agent tools are pure functions

### ✅ Maintainability
- Feature-based structure is intuitive
- Clear separation of concerns
- Easy to onboard new developers

---

## Migration Path (If Needed)

### When to Extract Features into Packages:

1. **Feature grows to 10+ files** → Move to `packages/feature-name/`
2. **Multiple apps need same feature** → Use Turborepo monorepo
3. **Feature needs independent deployment** → Extract to microservice

### Monorepo Structure (If Needed Later):

```
yiachy-guard/
├── apps/
│   ├── web/              # Main dashboard
│   ├── admin/            # Admin panel
│   └── api/              # Standalone API
├── packages/
│   ├── security/         # Shared security feature
│   ├── ui/               # Shared components
│   └── config/           # Shared configs
└── turbo.json
```

**Source:** [Turborepo Architecture](https://medium.com/@sreehari9188/building-scalable-web-apps-with-next-js-why-i-chose-a-turborepo-monorepo-architecture-23a7446b0741)

---

## Key Takeaways

1. **Start simple** - Modular monolith first
2. **Feature-based** - Organize by domain, not tech layer
3. **Centralize** - Config, DI, agents in one place
4. **Reuse** - Define once, use everywhere
5. **Scale later** - Extract to monorepo/microservices only when needed

## Sources

- [Feature-Based Architecture](https://medium.com/@nishibuch25/scaling-react-next-js-apps-a-feature-based-architecture-that-actually-works-c0c89c25936d)
- [Modular Architecture Guide](https://blog.bitsrc.io/frontend-architecture-a-complete-guide-to-building-scalable-next-js-applications-d28b0000e2ee)
- [AI SDK 6 Agents](https://vercel.com/blog/ai-sdk-6)
- [DI in Next.js](https://himynameistim.com/blog/dependency-injection-with-nextjs-and-typescript)
- [Modern Architecture Trends](https://www.cerbos.dev/blog/modern-application-architecture-trends)
- [Turborepo Best Practices](https://medium.com/@sreehari9188/building-scalable-web-apps-with-next-js-why-i-chose-a-turborepo-monorepo-architecture-23a7446b0741)
