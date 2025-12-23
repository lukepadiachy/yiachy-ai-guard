import { injectable } from 'inversify';
import type { Policy, Threat } from '../types';

export type PolicyResult = {
  allowed: boolean;
  reason: string | null;
  actions: string[];
};

@injectable()
export class PolicyService {
  private policies: Map<string, Policy> = new Map();

  constructor() {
    // Initialize default policy
    this.policies.set('default', {
      id: 'default',
      name: 'Default Security Policy',
      rules: [
        {
          id: 'threshold-check',
          type: 'semantic',
          value: 0.7,
          action: 'block',
        },
      ],
      blockThreshold: 0.7,
    });
  }

  addPolicy(policy: Policy): void {
    this.policies.set(policy.id, policy);
  }

  getPolicy(policyId: string): Policy | undefined {
    return this.policies.get(policyId);
  }

  enforcePolicy(threat: Threat, policy: Policy): PolicyResult {
    const allowed = threat.score < policy.blockThreshold;

    if (allowed) {
      return {
        allowed: true,
        reason: null,
        actions: threat.severity === 'medium' ? ['log'] : [],
      };
    }

    return {
      allowed: false,
      reason: `Threat score ${threat.score.toFixed(2)} exceeds threshold ${policy.blockThreshold}`,
      actions: ['block', 'log', 'alert'],
    };
  }

  evaluateRules(input: string, policy: Policy): string[] {
    const violations: string[] = [];

    for (const rule of policy.rules) {
      if (rule.type === 'length' && typeof rule.value === 'number') {
        if (input.length > rule.value) {
          violations.push(`Input exceeds maximum length: ${rule.value}`);
        }
      }

      if (rule.type === 'pattern' && typeof rule.value === 'string') {
        const regex = new RegExp(rule.value, 'i');
        if (regex.test(input)) {
          violations.push(`Blocked pattern detected: ${rule.value}`);
        }
      }
    }

    return violations;
  }
}
