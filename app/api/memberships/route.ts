import { NextResponse } from 'next/server';
import { z } from 'zod';

import { backendConfigured, postToBackend } from '@/lib/backend';

// Was a stub returning `mem_<timestamp>`; the signup was never recorded
// anywhere. The caller does not read this response — membership-signup.tsx
// sets done=true unconditionally — so the row is the only thing that matters
// and it is saved before anything else happens.

const schema = z
  .object({
    // Vestigial since 2026-09-16 (one free tier, everybody votes). Kept so a
    // stale tab does not 400; the form never sends it.
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
    if (!v.guardianName.trim())
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianName'], message: 'required' });
    if (!v.guardianPhone.trim())
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianPhone'], message: 'required' });
  });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
  if (!backendConfigured()) {
    return NextResponse.json({ ok: true, id: 'mem_' + Date.now() });
  }
  const { ok, data } = await postToBackend('/api/v1/memberships', parsed.data);
  if (!ok) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 502 });
  return NextResponse.json({ ok: true, id: data?.id });
}
