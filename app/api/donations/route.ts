import { NextResponse } from 'next/server';
import { z } from 'zod';

// Stub. Phase 2 replaces this with the Vipps handoff, Prisma persistence and
// a webhook that updates CAMPAIGN.raisedNok. Kept intentionally thin so that
// nothing here has to be undone when the real integration lands.

const bodySchema = z.object({
  amount: z.number().int().positive(),
  frequency: z.enum(['monthly', 'once']),
  isZakat: z.boolean(),
  isAnonymous: z.boolean().optional(),
  purpose: z.enum(['general', 'building']).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, sessionId: 'stub_' + Date.now() });
}
