import { NextResponse } from 'next/server';
import { z } from 'zod';

// RSVP capture. Phase 2 stub — returns a synthetic id. Wire to Prisma's
// Rsvp model in Phase 3 (schema already includes name, email, phone,
// count, newsletterOptIn, eventId). Phone is optional at both UI and
// API layers. Newsletter opt-in defaults to false and must be
// user-ticked — GDPR requires opt-in consent for marketing.

const schema = z.object({
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  count: z.number().int().min(1).max(20),
  newsletterOptIn: z.boolean().default(false),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: 'rsvp_' + Date.now() });
}
