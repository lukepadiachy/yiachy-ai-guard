/**
 * Dependency Injection Usage Example
 *
 * This file demonstrates how to use the DI container with InversifyJS.
 * DO NOT import this file in production code - it's for reference only.
 */

import { injectable, inject } from 'inversify';
import { container, TYPES } from '@/lib/di';
import type { SecurityConfig } from '@/lib/config';

// Example 1: Create a service with DI
@injectable()
export class SanitizerService {
  constructor(
    @inject(TYPES.SecurityConfig) private config: SecurityConfig
  ) {}

  sanitize(input: string): string {
    // Use this.config.policies.default
    const maxLength = this.config.policies.default.maxPromptLength;

    if (input.length > maxLength) {
      throw new Error(`Input exceeds max length of ${maxLength}`);
    }

    // Check blocked patterns
    const lowerInput = input.toLowerCase();
    for (const pattern of this.config.policies.default.blockedPatterns) {
      if (lowerInput.includes(pattern)) {
        throw new Error(`Blocked pattern detected: ${pattern}`);
      }
    }

    return input.trim();
  }
}

// Example 2: Register service in container
// (This would be done in providers.ts)
export function registerSanitizer() {
  container.bind(TYPES.SanitizerService).to(SanitizerService);
}

// Example 3: Use service in API route
export function exampleAPIRoute() {
  // Get service from container
  const sanitizer = container.get<SanitizerService>(TYPES.SanitizerService);

  const userInput = "Some user input";
  const result = sanitizer.sanitize(userInput);

  return result;
}

// Example 4: Service with multiple dependencies
@injectable()
export class DetectorService {
  constructor(
    @inject(TYPES.SecurityConfig) private securityConfig: SecurityConfig,
    @inject(TYPES.SanitizerService) private sanitizer: SanitizerService
  ) {}

  async detect(input: string): Promise<{ isThreat: boolean; score: number }> {
    // First sanitize
    const sanitized = this.sanitizer.sanitize(input);

    // Then detect threats
    const score = 0.5; // Placeholder
    const isThreat = score > this.securityConfig.threatThreshold;

    return { isThreat, score };
  }
}
