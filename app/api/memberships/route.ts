import { NextResponse } from 'next/server';
import { z } from 'zod';

// Guardian is two fields now, not one free-text box. Under-15 membership is
// the only tier that has a guardian, and for that tier both parts are
// required — a name with no number is not a contact.
const schema = z
  .object({
    tier: z.enum(['ordinary', 'voting', 'youth']),
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(60).optional().default(''),
    guardianName: z.string().max(120).optional().default(''),
    guardianPhone: z.string().max(60).optional().default(''),
  })
  .superRefine((v, ctx) => {
    if (v.tier !== 'youth') return;
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
