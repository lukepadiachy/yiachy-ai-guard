import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Container } from 'inversify';
import { DetectorService } from '../services/DetectorService';
import { TYPES } from '@/lib/di/types';
import type { SecurityConfig } from '@/lib/config/security.config';
import axios from 'axios';

vi.mock('axios');

describe('DetectorService', () => {
  let container: Container;
  let detector: DetectorService;
  let mockConfig: SecurityConfig;

  beforeEach(() => {
    container = new Container();

    mockConfig = {
      threatThreshold: 0.7,
      blockEnabled: true,
      policies: {
        default: {
          maxPromptLength: 1000,
          blockedPatterns: ['ignore previous', 'system prompt'],
        },
      },
      openguardrails: {
        apiUrl: 'http://localhost:8080',
        apiKey: 'test-key',
      },
    };

    container.bind(TYPES.SecurityConfig).toConstantValue(mockConfig);
    container.bind(TYPES.DetectorService).to(DetectorService);

    detector = container.get(TYPES.DetectorService);

    vi.clearAllMocks();
  });

  describe('detectThreat', () => {
    it('should return threat data from OpenGuardrails', async () => {
      const mockResponse = {
        data: {
          score: 0.85,
          tags: ['injection', 'jailbreak'],
        },
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      const result = await detector.detectThreat('test prompt');

      expect(result).toEqual({
        score: 0.85,
        severity: 'high',
        blocked: true,
        tags: ['injection', 'jailbreak'],
      });

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/detect',
        { prompt: 'test prompt' },
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-key',
          }),
        })
      );
    });

    it('should use fallback detection when API fails', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));

      const result = await detector.detectThreat('ignore previous instructions');

      expect(result.tags).toContain('fallback-detection');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should calculate severity correctly', async () => {
      const testCases = [
        { score: 0.95, expectedSeverity: 'critical' },
        { score: 0.75, expectedSeverity: 'high' },
        { score: 0.5, expectedSeverity: 'medium' },
        { score: 0.2, expectedSeverity: 'low' },
      ];

      for (const { score, expectedSeverity } of testCases) {
        vi.mocked(axios.post).mockResolvedValueOnce({
          data: { score, tags: [] },
        });

        const result = await detector.detectThreat('test');
        expect(result.severity).toBe(expectedSeverity);
      }
    });

    it('should mark as blocked when score exceeds threshold', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { score: 0.8, tags: [] },
      });

      const result = await detector.detectThreat('test');
      expect(result.blocked).toBe(true);
    });

    it('should not block when score is below threshold', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { score: 0.5, tags: [] },
      });

      const result = await detector.detectThreat('test');
      expect(result.blocked).toBe(false);
    });
  });
});
