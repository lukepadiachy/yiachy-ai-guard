import { container, TYPES } from '@/lib/di';
import { SecurityOrchestrator } from '@/features/security';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

const RequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  policyId: z.string().optional().default('default'),
  userId: z.string().optional(),
  model: z.string().optional().default('gemini-2.0-flash-exp'),
});

export async function POST(req: Request) {
  try {
    // Parse and validate request
    const body = await req.json();
    const { prompt, policyId, userId, model } = RequestSchema.parse(body);

    // Get security orchestrator from DI container
    const orchestrator = container.get<SecurityOrchestrator>(
      TYPES.SecurityOrchestrator
    );

    // Run security check
    const security = await orchestrator.securePrompt(prompt, policyId, userId);

    // Block if not allowed
    if (!security.allowed) {
      return Response.json(
        {
          error: 'Request blocked by security policy',
          reason: security.reason,
          threat: {
            score: security.threat.score,
            severity: security.threat.severity,
            tags: security.threat.tags,
          },
        },
        { status: 403 }
      );
    }

    // Stream LLM response with sanitized prompt
    const result = streamText({
      model: google(model),
      prompt: security.sanitized,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Proxy error:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing/health check
export async function GET() {
  return Response.json({
    service: 'Yiachy Guard LLM Proxy',
    status: 'operational',
    runtime: 'edge',
    version: '1.0.0',
  });
}
