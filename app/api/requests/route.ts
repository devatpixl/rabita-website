import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  subject: z.enum(['nikah', 'janaza', 'shahada', 'counselling', 'hajj-umrah', 'skole', 'koran', 'kurs', 'apartments', 'visit', 'contact']),
  name: z.string().min(1).max(120),
  contact: z.string().min(3).max(200),
  notes: z.string().max(2000).optional().default(''),
  preferred: z.string().max(200).optional().default(''),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: 'req_' + Date.now() });
}
