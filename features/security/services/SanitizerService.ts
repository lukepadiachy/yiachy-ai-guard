import { injectable, inject } from 'inversify';
import { TYPES } from '@/lib/di/types';
import type { SecurityConfig } from '@/lib/config/security.config';
import { z } from 'zod';

export const PromptSchema = z.object({
  text: z.string().max(10000),
  userId: z.string().optional(),
});

@injectable()
export class SanitizerService {
  constructor(
    @inject(TYPES.SecurityConfig) private config: SecurityConfig
  ) {}

  sanitize(input: string): string {
    let sanitized = input.trim();

    // Remove blocked patterns from config
    for (const pattern of this.config.policies.default.blockedPatterns) {
      sanitized = sanitized.replace(new RegExp(pattern, 'gi'), '');
    }

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');

    return sanitized;
  }

  validate(input: string): { valid: boolean; error?: string } {
    const maxLength = this.config.policies.default.maxPromptLength;

    if (input.length > maxLength) {
      return {
        valid: false,
        error: `Input exceeds maximum length of ${maxLength} characters`,
      };
    }

    return { valid: true };
  }
}
