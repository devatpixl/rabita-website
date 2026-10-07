import { NextResponse } from 'next/server';
import { z } from 'zod';

import { backendConfigured, postToBackend } from '@/lib/backend';

// Hands the gift to the backend, which creates it in Vipps and returns the URL
// the donor must be sent to.
//
// WHAT THE CLIENT ACTUALLY POSTS is wider than this schema used to admit. The
// giving sheet spreads the whole payload (giving-sheet.tsx:120), so `method`
// and `details` — including a fødselsnummer when the donor asked for a tax
// deduction — have been arriving all along and being silently dropped by the
// old schema. They are passed through now. The backend accepts the fnr and
// discards it; see Donor.fnr_encrypted there for why it is not stored.
//
// `amount` is in KRONER. The backend converts once, at its serializer.

const detailsSchema = z.object({
  firstName: z.string().max(120).optional().default(''),
  lastName: z.string().max(120).optional().default(''),
  email: z.string().max(200).optional().default(''),
  mobile: z.string().max(60).optional().default(''),
  taxDeduction: z.boolean().optional().default(false),
  fnr: z.string().max(20).optional().default(''),
  consent: z.boolean().optional().default(false),
});

const bodySchema = z.object({
  amount: z.number().int().positive(),
  frequency: z.enum(['monthly', 'once']),
  isZakat: z.boolean(),
  isAnonymous: z.boolean().optional(),
  purpose: z.enum(['general', 'building']).optional(),
  method: z.string().max(20).optional(),
  details: detailsSchema.optional(),
  locale: z.enum(['no', 'en', 'ar']).optional(),
  returnTo: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  if (!backendConfigured()) {
    // The stub's old answer, kept verbatim. Both callers ignore the body and
    // push to /takk, so this behaves exactly as it did before — which is what
    // lets this branch deploy to Vercel while the VPS is still being built.
    return NextResponse.json({ ok: true, sessionId: 'stub_' + Date.now() });
  }

  const { ok, status, data } = await postToBackend('/api/v1/donations/checkout', parsed.data);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: (data?.error as string) ?? 'payment_unavailable' },
      { status: status === 400 ? 400 : 502 },
    );
  }

  // redirectUrl is the whole point: the donor has to end up in Vipps.
  return NextResponse.json({
    ok: true,
    id: data?.id,
    reference: data?.reference,
    redirectUrl: data?.redirectUrl,
  });
}
