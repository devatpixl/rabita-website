import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  tier: z.enum(['ordinary', 'voting', 'youth']),
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(60).optional().default(''),
  guardian: z.string().max(120).optional().default(''),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: 'mem_' + Date.now() });
}
