# Security Feature

Core security services for Yiachy Guard - protecting LLM applications from prompt injection and other threats.

## Architecture

```
features/security/
├── services/
│   ├── SanitizerService.ts      # Input sanitization
│   ├── DetectorService.ts       # Threat detection (OpenGuardrails)
│   ├── PolicyService.ts         # Policy enforcement
│   └── SecurityOrchestrator.ts  # Pipeline orchestration
├── agents/
│   └── GuardianAgent.ts         # AI-powered threat analysis
├── types.ts                     # TypeScript types
└── index.ts                     # Public exports
```

## Services

### SanitizerService

Sanitizes and validates user input before processing.

```typescript
import { container, TYPES } from '@/lib/di';
import type { SanitizerService } from '@/features/security';

const sanitizer = container.get<SanitizerService>(TYPES.SanitizerService);

// Sanitize input
const clean = sanitizer.sanitize('  user input  ');

// Validate input
const result = sanitizer.validate(userInput);
if (!result.valid) {
  throw new Error(result.error);
}
```

**Features:**
- Removes blocked patterns from config
- Normalizes whitespace
- Enforces max length limits
- Pattern-based filtering

### DetectorService

Detects threats using OpenGuardrails API with fallback to basic pattern matching.

```typescript
const detector = container.get<DetectorService>(TYPES.DetectorService);

const threat = await detector.detectThreat(prompt);
// Returns: { score, severity, blocked, tags }
```

**Features:**
- OpenGuardrails integration
- Fallback detection if API unavailable
- Severity calculation (low/medium/high/critical)
- Automatic blocking above threshold

### PolicyService

Manages and enforces security policies.

```typescript
const policyService = container.get<PolicyService>(TYPES.PolicyService);

// Get policy
const policy = policyService.getPolicy('default');

// Enforce policy
const result = policyService.enforcePolicy(threat, policy);
// Returns: { allowed, reason, actions }

// Add custom policy
policyService.addPolicy({
  id: 'strict',
  name: 'Strict Security',
  rules: [...],
  blockThreshold: 0.5,
});
```

**Features:**
- Default policy included
- Custom policy support
- Rule evaluation (pattern, length, semantic)
- Action recommendations (block, log, alert)

### SecurityOrchestrator

Orchestrates the entire security pipeline.

```typescript
const orchestrator = container.get<SecurityOrchestrator>(TYPES.SecurityOrchestrator);

// Standard security check
const result = await orchestrator.securePrompt(
  userInput,
  'default', // policyId
  userId
);

// Deep analysis with AI
const deepResult = await orchestrator.deepAnalysis(userInput);
// Includes AI analysis for high-threat inputs
```

**Pipeline:**
1. Validate input
2. Sanitize
3. Detect threats (OpenGuardrails)
4. Enforce policy
5. Log security event
6. (Optional) AI deep analysis

## Guardian Agent

AI-powered semantic threat analysis using Gemini.

```typescript
import { guardianAgent } from '@/features/security';

const analysis = await guardianAgent.analyze(prompt);
// Returns: { threatLevel, confidence, reasoning, patterns }
```

**Detects:**
- Prompt injection attempts
- Jailbreak patterns
- Data exfiltration
- Malicious instructions

## Usage Example

```typescript
import { container, TYPES } from '@/lib/di';
import { SecurityOrchestrator } from '@/features/security';

export async function POST(req: Request) {
  const { prompt, userId } = await req.json();

  // Get orchestrator from DI container
  const orchestrator = container.get<SecurityOrchestrator>(
    TYPES.SecurityOrchestrator
  );

  // Run security check
  const security = await orchestrator.securePrompt(prompt, 'default', userId);

  if (!security.allowed) {
    return Response.json(
      { error: 'Blocked', reason: security.reason },
      { status: 403 }
    );
  }

  // Safe to process
  return Response.json({
    message: 'Allowed',
    sanitized: security.sanitized
  });
}
```

## Configuration

Security settings are in `lib/config/security.config.ts`:

```typescript
export const securityConfig = {
  threatThreshold: 0.7,      // Block if score > 0.7
  blockEnabled: true,        // Enable blocking

  policies: {
    default: {
      maxPromptLength: 10000,
      blockedPatterns: [
        'ignore previous',
        'system prompt',
        'disregard instructions',
      ],
    },
  },

  openguardrails: {
    apiUrl: process.env.OPENGUARDRAILS_URL,
    apiKey: process.env.OPENGUARDRAILS_API_KEY,
  },
};
```

## Database

Security events are logged to PostgreSQL:

```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP,
  input_text TEXT,
  sanitized_text TEXT,
  threat_score FLOAT,
  severity TEXT,
  blocked BOOLEAN,
  policy_id TEXT,
  user_id TEXT,
  ai_analysis JSONB
);
```

See `lib/db/schema.sql` for full schema.

## Testing

Run unit tests:

```bash
npm test features/security
```

**Test Coverage:**
- SanitizerService: 8 tests
- DetectorService: 5 tests
- PolicyService: 10 tests
- Total: 23 tests ✓

## Next Steps

1. Implement database logging in SecurityOrchestrator
2. Add more attack vectors to test suite
3. Integrate with API proxy layer
4. Build admin dashboard for policy management
