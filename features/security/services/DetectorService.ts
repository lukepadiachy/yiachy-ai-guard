import { injectable, inject } from 'inversify';
import { TYPES } from '@/lib/di/types';
import type { SecurityConfig } from '@/lib/config/security.config';
import type { Threat } from '../types';
import axios from 'axios';

@injectable()
export class DetectorService {
  constructor(
    @inject(TYPES.SecurityConfig) private config: SecurityConfig
  ) {}

  async detectThreat(prompt: string): Promise<Threat> {
    const { apiUrl, apiKey } = this.config.openguardrails;

    try {
      const response = await axios.post(
        `${apiUrl}/detect`,
        { prompt },
        {
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      const score = response.data.score ?? 0;
      const blocked = score > this.config.threatThreshold;

      return {
        score,
        severity: this.calculateSeverity(score),
        blocked,
        tags: response.data.tags ?? [],
      };
    } catch (error) {
      // Fallback to basic pattern detection if OpenGuardrails is unavailable
      console.warn('OpenGuardrails detection failed, using fallback:', error);
      return this.basicDetection(prompt);
    }
  }

  private basicDetection(prompt: string): Threat {
    const lowerPrompt = prompt.toLowerCase();
    let score = 0;

    // Basic pattern matching as fallback
    const suspiciousPatterns = this.config.policies.default.blockedPatterns;
    for (const pattern of suspiciousPatterns) {
      if (lowerPrompt.includes(pattern.toLowerCase())) {
        score += 0.3;
      }
    }

    // Normalize score to 0-1 range
    score = Math.min(score, 1);

    return {
      score,
      severity: this.calculateSeverity(score),
      blocked: score > this.config.threatThreshold,
      tags: ['fallback-detection'],
    };
  }

  private calculateSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.9) return 'critical';
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }
}
