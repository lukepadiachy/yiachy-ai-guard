import { describe, it, expect } from 'vitest';
import { GET, POST } from '../threats/route';

describe('/api/threats', () => {
  describe('GET', () => {
    it('should return paginated threats', async () => {
      const request = new Request(
        'http://localhost/api/threats?page=1&limit=20'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
    });

    it('should filter by severity', async () => {
      const request = new Request(
        'http://localhost/api/threats?severity=high'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.every((t: any) => t.severity === 'high')).toBe(true);
    });

    it('should filter by blocked status', async () => {
      const request = new Request(
        'http://localhost/api/threats?blocked=true'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.every((t: any) => t.blocked === true)).toBe(true);
    });

    it('should validate query parameters', async () => {
      const request = new Request(
        'http://localhost/api/threats?page=-1' // Invalid page, will default to 1
      );

      const response = await GET(request);
      const data = await response.json();

      // Schema uses .catch() so invalid values default to safe values
      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(1); // Defaults to 1
    });

    it('should use default pagination values', async () => {
      const request = new Request('http://localhost/api/threats');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
    });
  });

  describe('POST', () => {
    it('should create new threat report', async () => {
      const threatData = {
        inputText: 'Test malicious prompt',
        threatScore: 0.85,
        severity: 'high',
        blocked: true,
        policyId: 'default',
        tags: ['test'],
      };

      const request = new Request('http://localhost/api/threats', {
        method: 'POST',
        body: JSON.stringify(threatData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.threat).toBeDefined();
      expect(data.threat.inputText).toBe(threatData.inputText);
    });

    it('should validate threat schema', async () => {
      const invalidData = {
        inputText: 'Test',
        threatScore: 2.0, // Invalid - must be 0-1
        severity: 'invalid',
        blocked: true,
        policyId: 'default',
      };

      const request = new Request('http://localhost/api/threats', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid threat data');
    });

    it('should accept optional fields', async () => {
      const threatData = {
        inputText: 'Test prompt',
        threatScore: 0.5,
        severity: 'medium',
        blocked: false,
        policyId: 'default',
        userId: 'user123',
        tags: ['tag1', 'tag2'],
      };

      const request = new Request('http://localhost/api/threats', {
        method: 'POST',
        body: JSON.stringify(threatData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.threat.userId).toBe('user123');
      expect(data.threat.tags).toEqual(['tag1', 'tag2']);
    });
  });
});
