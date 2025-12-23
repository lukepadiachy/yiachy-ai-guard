# Dependency Injection Container

Centralized DI container using InversifyJS for managing service dependencies.

## Structure

```
lib/di/
├── types.ts          # Dependency identifiers (Symbols)
├── container.ts      # InversifyJS container instance
├── providers.ts      # Service bindings
├── example.ts        # Usage examples (reference only)
└── index.ts          # Public exports
```

## Usage

### 1. Define a Service with Dependencies

```typescript
import { injectable, inject } from 'inversify';
import { TYPES } from '@/lib/di';
import type { SecurityConfig } from '@/lib/config';

@injectable()
export class MyService {
  constructor(
    @inject(TYPES.SecurityConfig) private config: SecurityConfig
  ) {}

  doSomething() {
    console.log(this.config.threatThreshold);
  }
}
```

### 2. Register Service in Container

In `lib/di/providers.ts`:

```typescript
import { MyService } from '@/features/my-feature/services/my.service';

export function setupProviders() {
  // ... existing bindings
  container.bind(TYPES.MyService).to(MyService);
}
```

### 3. Use Service in API Routes

```typescript
import { container, TYPES } from '@/lib/di';

export async function POST(req: Request) {
  const service = container.get<MyService>(TYPES.MyService);
  const result = service.doSomething();

  return Response.json(result);
}
```

## Available Services

- `SecurityConfig` - Security configuration
- `AIConfig` - AI model configuration
- `SanitizerService` - Input sanitization (coming in /build-security)
- `DetectorService` - Threat detection (coming in /build-security)
- `PolicyService` - Policy enforcement (coming in /build-security)
- `ThreatLogService` - Threat logging (coming in /build-security)

## Configuration

All configs are centralized in `lib/config/`:

- `security.config.ts` - Threat thresholds, policies, OpenGuardrails
- `ai.config.ts` - Model selection, API keys

Environment variables are loaded automatically from `.env.local`.
