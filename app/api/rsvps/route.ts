import { NextResponse } from 'next/server';
import { z } from 'zod';

import { backendConfigured, postToBackend } from '@/lib/backend';

// TWO CALLERS, TWO SHAPES. rsvp-sheet.tsx sends everything; the event detail
// page sends only slug/name/email/count. The defaults below are what makes one
// endpoint serve both — do not make phone or newsletterOptIn required.
//
// newsletterOptIn defaults false and is never pre-checked in the UI. GDPR: an
// omitted field is not consent.

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
  if (!backendConfigured()) {
    return NextResponse.json({ ok: true, id: 'rsvp_' + Date.now() });
  }
  const { ok, data } = await postToBackend('/api/v1/rsvps', parsed.data);
  if (!ok) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 502 });
  return NextResponse.json({ ok: true, id: data?.id });
}
