import { NextResponse } from 'next/server';
import { z } from 'zod';

import { backendConfigured, postToBackend } from '@/lib/backend';
import { SERVICE_KEYS } from '@/lib/services';

// The enquiry form's endpoint — every service page, /kontakt, /besok-oss and
// the apartments.
//
// UNTIL 2026-09-28 THIS DISCARDED EVERYTHING. It validated the payload and
// answered { ok: true } without sending or storing anything, so eighteen
// service pages have been thanking people for enquiries nobody received.
// The client's complaint that the pages "are not converting" is, in the most
// literal sense, this file. It now delivers the way /api/contact does: a
// plain-text mail through Resend's HTTP API, no new dependency, and a 503
// when the three envs are missing so the form can hand the visitor a mail
// draft instead of a false thank-you.
//
// TWO MORE THINGS FIXED HERE. The subject enum listed eight of the eighteen
// services, so the other ten pages' forms answered 400 on every send — the
// visitor saw "something was missing" with every field filled. It now reads
// SERVICE_KEYS. And `extra` carries the service-specific fields the pilot
// adds (bride's name, certificate status on nikah); labelled server-side so
// the mail reads in Norwegian whatever locale the form was in.

const EXTRA_LABEL: Record<string, string> = {
  bride: 'Brudens navn',
  certificate: 'Vigselsattest',
};

const SUBJECT_LABEL: Record<string, string> = {
  apartments: 'Leiligheter',
  visit: 'Besøk',
  contact: 'Kontakt',
};

const schema = z.object({
  subject: z.enum([...SERVICE_KEYS, 'apartments', 'visit', 'contact']),
  name: z.string().trim().min(1).max(120),
  contact: z.string().trim().min(3).max(200),
  notes: z.string().trim().max(2000).optional().default(''),
  preferred: z.string().trim().max(200).optional().default(''),
  extra: z.record(z.string(), z.string().trim().max(200)).optional().default({}),
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
    const { ok, status, data } = await postToBackend('/api/v1/requests', parsed.data);
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
  const { subject, name, contact, notes, preferred, extra, locale } = parsed.data;

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;
  if (!key || !to || !from) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const label = SUBJECT_LABEL[subject] ?? subject;
  const looksLikeMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

  const text = [
    `Tjeneste: ${label}`,
    `Navn: ${name}`,
    `Kontakt: ${contact}`,
    ...Object.entries(extra)
      .filter(([, v]) => v)
      .map(([k, v]) => `${EXTRA_LABEL[k] ?? k}: ${v}`),
    preferred ? `Ønsket: ${preferred}` : null,
    '',
    notes || '(ingen melding)',
    '',
    '—',
    `Språk: ${locale}`,
    'Sendt fra henvendelsesskjemaet på rabita.no',
  ]
    .filter((l) => l !== null)
    .join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        ...(looksLikeMail ? { reply_to: contact } : {}),
        subject: `Henvendelse: ${label} — ${name}`,
        text,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
