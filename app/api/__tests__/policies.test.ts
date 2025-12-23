import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../policies/route';

// Mock the DI container
vi.mock('@/lib/di', () => ({
  container: {
    get: vi.fn(),
  },
  TYPES: {
    PolicyService: Symbol.for('PolicyService'),
  },
}));

describe('/api/policies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return list of policies', async () => {
      const { container } = await import('@/lib/di');

      const mockPolicy = {
        id: 'default',
        name: 'Default Policy',
        rules: [],
        blockThreshold: 0.7,
      };

      vi.mocked(container.get).mockReturnValue({
        getPolicy: vi.fn().mockReturnValue(mockPolicy),
      });

      const request = new Request('http://localhost/api/policies');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.total).toBeDefined();
    });
  });

  describe('POST', () => {
    it('should create new policy', async () => {
      const { container } = await import('@/lib/di');

      vi.mocked(container.get).mockReturnValue({
        getPolicy: vi.fn().mockReturnValue(undefined), // Policy doesn't exist
        addPolicy: vi.fn(),
      });

      const policyData = {
        id: 'custom',
        name: 'Custom Policy',
        rules: [
          {
            id: 'rule1',
            type: 'length',
            value: 5000,
            action: 'block',
          },
        ],
        blockThreshold: 0.8,
      };

      const request = new Request('http://localhost/api/policies', {
        method: 'POST',
        body: JSON.stringify(policyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.policy).toEqual(policyData);
    });

    it('should reject duplicate policy ID', async () => {
      const { container } = await import('@/lib/di');

      const existingPolicy = {
        id: 'custom',
        name: 'Existing',
        rules: [],
        blockThreshold: 0.7,
      };

      vi.mocked(container.get).mockReturnValue({
        getPolicy: vi.fn().mockReturnValue(existingPolicy),
        addPolicy: vi.fn(),
      });

      const request = new Request('http://localhost/api/policies', {
        method: 'POST',
        body: JSON.stringify(existingPolicy),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain('already exists');
    });

    it('should validate policy schema', async () => {
      const invalidData = {
        id: 'custom',
        name: 'Custom',
        rules: [
          {
            id: 'rule1',
            type: 'invalid_type', // Invalid
            value: 5000,
            action: 'block',
          },
        ],
        blockThreshold: 1.5, // Invalid - must be 0-1
      };

      const request = new Request('http://localhost/api/policies', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid policy data');
      expect(data.details).toBeDefined();
    });

    it('should accept valid rule types', async () => {
      const { container } = await import('@/lib/di');

      vi.mocked(container.get).mockReturnValue({
        getPolicy: vi.fn().mockReturnValue(undefined),
        addPolicy: vi.fn(),
      });

      const policyData = {
        id: 'multi-rule',
        name: 'Multi Rule Policy',
        rules: [
          { id: 'r1', type: 'pattern', value: 'test', action: 'block' },
          { id: 'r2', type: 'length', value: 1000, action: 'warn' },
          { id: 'r3', type: 'semantic', value: 'test', action: 'log' },
        ],
        blockThreshold: 0.6,
      };

      const request = new Request('http://localhost/api/policies', {
        method: 'POST',
        body: JSON.stringify(policyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.policy.rules).toHaveLength(3);
    });
  });
});
