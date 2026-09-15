import { NextResponse } from 'next/server';
import { z } from 'zod';

// Guardian is two fields now, not one free-text box, and both are required
// when the form says the member is under 15 — a name with no number is not a
// contact.
//
// It hangs off `under15` rather than a tier since 2026-09-16: the three
// membership tiers were removed (one free membership, everyone votes), and
// guardian consent for a minor is a legal requirement rather than a class of
// membership, so it survived the tiers as a plain flag.
const schema = z
  .object({
    // Tiers were removed on 2026-09-16 (one free membership, everyone
    // votes). Kept OPTIONAL rather than deleted so a form still open in
    // somebody's tab, or a cached bundle, does not start 400-ing.
    tier: z.enum(['ordinary', 'voting', 'youth']).optional(),
    under15: z.boolean().optional().default(false),
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(60).optional().default(''),
    guardianName: z.string().max(120).optional().default(''),
    guardianPhone: z.string().max(60).optional().default(''),
  })
  .superRefine((v, ctx) => {
    if (!v.under15) return;
    if (!v.guardianName.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianName'], message: 'required' });
    }
    if (!v.guardianPhone.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianPhone'], message: 'required' });
    }
  });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: 'mem_' + Date.now() });
}
