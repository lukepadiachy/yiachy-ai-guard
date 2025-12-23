import { injectable, inject } from 'inversify';
import { TYPES } from '@/lib/di/types';
import { SanitizerService } from './SanitizerService';
import { DetectorService } from './DetectorService';
import { PolicyService } from './PolicyService';
import { guardianAgent, type GuardianAnalysis } from '../agents/GuardianAgent';
import type { SecurityResult, SecurityEvent } from '../types';

@injectable()
export class SecurityOrchestrator {
  constructor(
    @inject(TYPES.SanitizerService) private sanitizer: SanitizerService,
    @inject(TYPES.DetectorService) private detector: DetectorService,
    @inject(TYPES.PolicyService) private policy: PolicyService
  ) {}

  async securePrompt(
    input: string,
    policyId: string = 'default',
    userId?: string
  ): Promise<SecurityResult> {
    // 1. Validate input
    const validation = this.sanitizer.validate(input);
    if (!validation.valid) {
      return {
        allowed: false,
        reason: validation.error!,
        sanitized: input,
        threat: {
          score: 0,
          severity: 'low',
          blocked: true,
          tags: ['validation-error'],
        },
      };
    }

    // 2. Sanitize input
    const sanitized = this.sanitizer.sanitize(input);

    // 3. Detect threats using OpenGuardrails
    const threat = await this.detector.detectThreat(sanitized);

    // 4. Get policy
    const policyObj = this.policy.getPolicy(policyId);
    if (!policyObj) {
      throw new Error(`Policy not found: ${policyId}`);
    }

    // 5. Enforce policy
    const policyResult = this.policy.enforcePolicy(threat, policyObj);

    // 6. Log security event
    await this.logSecurityEvent({
      inputText: input,
      sanitizedText: sanitized,
      threatScore: threat.score,
      severity: threat.severity,
      blocked: !policyResult.allowed,
      policyId,
      userId,
    });

    return {
      allowed: policyResult.allowed,
      reason: policyResult.reason,
      sanitized,
      threat,
    };
  }

  async deepAnalysis(
    input: string,
    policyId: string = 'default'
  ): Promise<SecurityResult & { aiAnalysis: GuardianAnalysis }> {
    // Run standard security check
    const result = await this.securePrompt(input, policyId);

    // If threat detected, perform deep AI analysis
    if (result.threat.score > 0.5) {
      const aiAnalysis = await guardianAgent.analyze(input);

      // Combine scores (weighted average: 60% detector, 40% AI)
      const combinedScore =
        result.threat.score * 0.6 + aiAnalysis.confidence * 0.4;

      return {
        ...result,
        threat: {
          ...result.threat,
          score: combinedScore,
          tags: [...result.threat.tags, ...aiAnalysis.patterns],
        },
        aiAnalysis,
      };
    }

    return {
      ...result,
      aiAnalysis: {
        threatLevel: 'low',
        confidence: 0,
        reasoning: 'No deep analysis needed',
        patterns: [],
      },
    };
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // TODO: Implement database logging
    // For now, just log to console
    console.log('[Security Event]', {
      timestamp: new Date().toISOString(),
      ...event,
    });
  }
}
