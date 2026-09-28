import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CAMPAIGN } from '@/lib/campaign';

// The resignation form's endpoint (client ticket "Nettside medlemskap",
// 2026-09-17: "utmeldingskjema nederst kan linkes til mail adressen:
// medlemskap@rabita.no").
//
// Built on /api/contact, which is the one route in this folder that actually
// delivers — see the note there for why the others do not. The same three
// rules hold here:
//
//   NO NEW DEPENDENCY.  Resend is an HTTP API, so this is a fetch.
//   UNCONFIGURED IS NOT AN ERROR.  Without RESEND_API_KEY and CONTACT_FROM
//     this answers 503 not_configured and the form hands the visitor a
//     prefilled mail draft to the same address, so a resignation is never
//     silently dropped. Never return { ok: true } without having sent.
//   PLAIN TEXT.  Nothing here is worth an HTML part, and text cannot carry
//     an injection into whatever client Rabita reads mail in.
//
// WHERE IT GOES. The client named the address, so it is the default and
// lives in lib/campaign.ts beside the other contact addresses. An env
// override (MEMBERSHIP_TO) exists for the same reason CONTACT_TO does: to
// route a test deployment somewhere else without a code change.
//
// A resignation is a legal act for a registered trossamfunn — the member has
// to come off the register that is reported for the state grant — so the
// mail carries everything the office needs to find the record: both names,
// the e-mail used at signup, and the under-15 flag, which changes who is
// allowed to sign.

const schema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional().default(''),
  reason: z.string().trim().max(2000).optional().default(''),
  child: z.boolean().optional().default(false),
  locale: z.enum(['no', 'en', 'ar']).optional().default('no'),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
  const { firstName, lastName, email, phone, reason, child, locale } = parsed.data;

  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.MEMBERSHIP_TO || CAMPAIGN.membershipEmail;
  if (!key || !from) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const name = `${firstName} ${lastName}`;
  const text = [
    `Utmelding fra Rabita – Det Islamske Forbundet`,
    '',
    `Navn: ${name}`,
    `E-post ved innmelding: ${email}`,
    phone ? `Telefon: ${phone}` : null,
    child ? 'Gjelder et barn under 15 år; avsender oppgir å ha foreldreansvar.' : null,
    '',
    reason ? `Begrunnelse (valgfri):\n${reason}` : 'Ingen begrunnelse oppgitt.',
    '',
    '—',
    `Språk: ${locale}`,
    'Sendt fra utmeldingsskjemaet på rabita.no',
  ]
    .filter((l) => l !== null)
    .join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        // A reply from the office goes straight to the member.
        reply_to: email,
        subject: `Utmelding: ${name}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error('[utmelding] send failed', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
    }
  } catch (err) {
    console.error('[utmelding] transport error', err);
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
