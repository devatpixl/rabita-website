import { NextResponse } from 'next/server';
import { z } from 'zod';

import { backendConfigured, postToBackend } from '@/lib/backend';

// The contact panel's endpoint (client, Gjøremål 2026-09-15).
//
// THIS ONE ACTUALLY DELIVERS — which makes it the odd one out. Every other
// route in this folder validates its payload and returns { ok: true } without
// storing or sending anything: /api/requests, /api/memberships, /api/rsvps,
// /api/volunteers, /api/dedications, /api/donations. There is no mail
// transport in package.json and no route imports Prisma, whose schema points
// at a SQLite dev file Vercel would not persist. So today every enquiry made
// through this site is discarded while the UI says thank you.
//
// That is survivable on a form that mostly repeats what a page already says.
// It is not survivable here: the whole point of this button, in the client's
// own words, is that people "legge igjen epost-adressen sin" — leave their
// e-mail address. A button that collects addresses and drops them is worse
// than no button, because Rabita would believe it was working.
//
// NO NEW DEPENDENCY. Resend is an HTTP API, so this is a fetch. That also
// means swapping provider later is a change to one function, not a package
// removal — and nothing here is Resend-shaped beyond the URL and the body.
//
// UNCONFIGURED IS NOT AN ERROR. Until RESEND_API_KEY / CONTACT_TO / CONTACT_FROM
// exist this answers 503 not_configured, and the panel hands the visitor a
// prefilled mail draft instead. Never return { ok: true } from here without
// having sent something.

const schema = z.object({
  question: z.string().trim().min(1).max(2000),
  email: z.string().trim().email().max(200),
  name: z.string().trim().max(120).optional().default(''),
  phone: z.string().trim().max(60).optional().default(''),
  locale: z.enum(['no', 'en', 'ar']).optional().default('no'),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  // Straight to the backend when it is wired up: the submission is persisted
  // there and staff are e-mailed from there. Its status is passed through
  // UNCHANGED, which matters most for 503 not_configured — this form answers
  // that by opening a prefilled mailto: draft, and swallowing it would turn a
  // failed send into a silent one.
  //
  // Without a backend this falls through to the Resend path below, exactly as
  // before. That is what lets this branch deploy while the VPS is being built.
  if (backendConfigured()) {
    const { ok, status, data } = await postToBackend('/api/v1/contact', parsed.data);
    if (ok) return NextResponse.json({ ok: true, id: data?.id });
    if (status) {
      return NextResponse.json(
        { ok: false, error: (data?.error as string) ?? 'send_failed' },
        { status },
      );
    }
    // status 0 means the backend was unreachable, not that it refused. Fall
    // through to Resend rather than losing the message.
  }
  const { question, email, name, phone, locale } = parsed.data;

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;
  if (!key || !to || !from) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  // Plain text on purpose: there is no template here worth an HTML part, and
  // text cannot carry an injection into whatever client Rabita reads mail in.
  const text = [
    question,
    '',
    '—',
    name ? `Navn: ${name}` : null,
    `E-post: ${email}`,
    phone ? `Telefon: ${phone}` : null,
    `Språk: ${locale}`,
    'Sendt fra kontaktknappen på rabita.no',
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
        // So a reply goes straight to the person who asked, rather than to
        // whatever address we happen to send from.
        reply_to: email,
        subject: name ? `Spørsmål fra ${name}` : 'Spørsmål fra nettsiden',
        text,
      }),
    });
    if (!res.ok) {
      // Log the provider's reason server-side; never hand it to the browser.
      console.error('[contact] send failed', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
    }
  } catch (err) {
    console.error('[contact] transport error', err);
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
