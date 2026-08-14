import { NextResponse } from 'next/server';

// Per-event RSVP export as CSV.
//
// Gated by a bearer token pulled from the ADMIN_EXPORT_TOKEN env var
// so it can ship before Rabita's admin auth exists. Once the admin
// area is real, replace this with session-based access — the token
// gate is a floor, not the ceiling.
//
// Env states:
//   ADMIN_EXPORT_TOKEN unset  -> 503 (feature not configured on this env)
//   header missing/mismatched -> 401
//   header matches            -> stream CSV
//
// Phase 2 stub — returns an empty CSV with only the header row.
// Wire to Prisma's Rsvp model in Phase 3:
//   const rows = await prisma.rsvp.findMany({
//     where: { event: { slug: params.id } },
//     orderBy: { createdAt: 'asc' },
//   });

const HEADER = [
  'id',
  'name',
  'email',
  'phone',
  'count',
  'newsletter_opt_in',
  'created_at',
] as const;

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const configured = process.env.ADMIN_EXPORT_TOKEN;
  if (!configured) {
    return NextResponse.json(
      { ok: false, error: 'export_not_configured' },
      { status: 503 },
    );
  }
  const auth = req.headers.get('authorization') ?? '';
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!provided || provided !== configured) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // TODO Phase 3: replace with Prisma query on Rsvp joined to Event.slug === id.
  const rows: Array<Record<(typeof HEADER)[number], unknown>> = [];

  const lines = [HEADER.join(',')];
  for (const r of rows) {
    lines.push(HEADER.map((k) => csvEscape(r[k])).join(','));
  }
  const csv = lines.join('\r\n') + '\r\n';

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="rsvps-${id}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
