import { NextResponse } from 'next/server';
import { z } from 'zod';

// Stub. Phase 3 wires the certificate email + Prisma persistence.
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
  return NextResponse.json({ ok: true, id: 'ded_' + Date.now() });
}
