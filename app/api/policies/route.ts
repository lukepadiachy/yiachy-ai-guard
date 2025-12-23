import { container, TYPES } from '@/lib/di';
import { PolicyService, type Policy } from '@/features/security';
import { z } from 'zod';

export const runtime = 'edge';

const PolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  rules: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['pattern', 'length', 'semantic']),
      value: z.union([z.string(), z.number()]),
      action: z.enum(['block', 'warn', 'log']),
    })
  ),
  blockThreshold: z.number().min(0).max(1),
});

// GET: List all policies
export async function GET(req: Request) {
  try {
    const policyService = container.get<PolicyService>(TYPES.PolicyService);

    // Get default policy
    const defaultPolicy = policyService.getPolicy('default');

    // TODO: Fetch all policies from database
    // For now, return just the default policy
    const policies = defaultPolicy ? [defaultPolicy] : [];

    return Response.json({
      data: policies,
      total: policies.length,
    });
  } catch (error) {
    console.error('Policies GET error:', error);
    return Response.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

// POST: Create new policy
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const policyData = PolicySchema.parse(body);

    const policyService = container.get<PolicyService>(TYPES.PolicyService);

    // Check if policy already exists
    const existing = policyService.getPolicy(policyData.id);
    if (existing) {
      return Response.json(
        { error: 'Policy with this ID already exists' },
        { status: 409 }
      );
    }

    // Add policy
    policyService.addPolicy(policyData as Policy);

    // TODO: Persist to database
    // import { sql } from '@vercel/postgres';
    // await sql`INSERT INTO policies (id, name, rules, block_threshold) VALUES (...)`;

    return Response.json(
      { success: true, policy: policyData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Policies POST error:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid policy data', details: error.issues },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}
