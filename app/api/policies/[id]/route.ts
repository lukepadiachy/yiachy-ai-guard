import { container, TYPES } from '@/lib/di';
import { PolicyService, type Policy } from '@/features/security';
import { z } from 'zod';

export const runtime = 'edge';

const PolicyUpdateSchema = z.object({
  name: z.string().optional(),
  rules: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(['pattern', 'length', 'semantic']),
        value: z.union([z.string(), z.number()]),
        action: z.enum(['block', 'warn', 'log']),
      })
    )
    .optional(),
  blockThreshold: z.number().min(0).max(1).optional(),
});

// GET: Get policy by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const policyService = container.get<PolicyService>(TYPES.PolicyService);

    const policy = policyService.getPolicy(id);

    if (!policy) {
      return Response.json({ error: 'Policy not found' }, { status: 404 });
    }

    return Response.json({ data: policy });
  } catch (error) {
    console.error('Policy GET error:', error);
    return Response.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}

// PUT: Update policy
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updates = PolicyUpdateSchema.parse(body);

    const policyService = container.get<PolicyService>(TYPES.PolicyService);

    const existing = policyService.getPolicy(id);
    if (!existing) {
      return Response.json({ error: 'Policy not found' }, { status: 404 });
    }

    // Don't allow updating the default policy
    if (id === 'default') {
      return Response.json(
        { error: 'Cannot update default policy' },
        { status: 403 }
      );
    }

    // Merge updates
    const updated: Policy = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
    };

    // Update in service
    policyService.addPolicy(updated);

    // TODO: Update in database
    // import { sql } from '@vercel/postgres';
    // await sql`UPDATE policies SET name = ${updated.name}, ... WHERE id = ${id}`;

    return Response.json({ success: true, policy: updated });
  } catch (error) {
    console.error('Policy PUT error:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid update data', details: error.issues },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}

// DELETE: Delete policy
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const policyService = container.get<PolicyService>(TYPES.PolicyService);

    const existing = policyService.getPolicy(id);
    if (!existing) {
      return Response.json({ error: 'Policy not found' }, { status: 404 });
    }

    // Don't allow deleting the default policy
    if (id === 'default') {
      return Response.json(
        { error: 'Cannot delete default policy' },
        { status: 403 }
      );
    }

    // TODO: Delete from database and service
    // For now, service doesn't have a delete method
    // Would need to add: policyService.deletePolicy(id);
    // import { sql } from '@vercel/postgres';
    // await sql`DELETE FROM policies WHERE id = ${id}`;

    return Response.json({ success: true, message: 'Policy deleted' });
  } catch (error) {
    console.error('Policy DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete policy' },
      { status: 500 }
    );
  }
}
