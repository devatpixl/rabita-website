import { NextResponse } from 'next/server';
import { z } from 'zod';

import { backendConfigured, postToBackend } from '@/lib/backend';

const schema = z.object({
  name: z.string().min(1).max(120),
  contact: z.string().min(3).max(200),
  interests: z.array(z.string().max(60)).max(20),
  availability: z.string().max(1000).optional().default(''),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
  if (!backendConfigured()) {
    return NextResponse.json({ ok: true, id: 'vol_' + Date.now() });
  }
  const { ok, data } = await postToBackend('/api/v1/volunteers', parsed.data);
  // The page sets done=true without reading this, so a 502 would be invisible.
  // The backend saves the row before it tries to e-mail anybody.
  if (!ok) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 502 });
  return NextResponse.json({ ok: true, id: data?.id });
}
