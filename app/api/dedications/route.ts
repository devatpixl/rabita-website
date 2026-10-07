import { NextResponse } from 'next/server';
import { z } from 'zod';

import { backendConfigured, postToBackend } from '@/lib/backend';

// The id returned here is meant to be carried into the donation that follows,
// so the dedication and the gift are joined. Nothing passes it yet — the sadaqa
// page throws it away and opens the giving sheet with no link (see
// doner-en-bonneplass/page.tsx:41) — but the backend's Dedication.donationId is
// waiting for it and the id is returned so that wiring is a one-line change.

const schema = z.object({
  name: z.string().min(1).max(120),
  relation: z.string().max(120).optional().default(''),
  message: z.string().max(800).optional().default(''),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
  if (!backendConfigured()) {
    return NextResponse.json({ ok: true, id: 'ded_' + Date.now() });
  }
  const { ok, data } = await postToBackend('/api/v1/dedications', parsed.data);
  if (!ok) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 502 });
  return NextResponse.json({ ok: true, id: data?.id });
}
