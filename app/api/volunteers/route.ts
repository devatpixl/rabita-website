import { NextResponse } from 'next/server';
import { z } from 'zod';

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
  return NextResponse.json({ ok: true, id: 'vol_' + Date.now() });
}
