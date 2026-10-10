import { NextResponse } from 'next/server';
import { backendConfigured, getFromBackend } from '@/lib/backend';

// What /takk asks to tell a donor the truth. The backend answers
// {ok, kind: one_time|monthly, status, amount, purpose} and polls Vipps itself
// while a row is still pending, so this is a plain pass-through. It exists so
// the browser never needs the backend's origin (lib/backend.ts).
//
// Statuses, from the backend's models: one_time → pending | authorized |
// captured | cancelled | failed | expired; monthly → pending | active |
// stopped | expired. /takk maps them to confirmed / confirming / not
// completed / not found.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const ref = (new URL(req.url).searchParams.get('ref') ?? '').trim();
  if (!ref || ref.length > 80 || !/^[a-zA-Z0-9_-]+$/.test(ref)) {
    return NextResponse.json({ ok: false, error: 'missing_ref' }, { status: 400 });
  }
  if (!backendConfigured()) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }
  const { ok, status, data } = await getFromBackend(
    `/api/v1/donations/status?ref=${encodeURIComponent(ref)}`,
  );
  if (status === 404) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  if (!ok || !data) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 502 });
  return NextResponse.json(data, { headers: { 'cache-control': 'no-store' } });
}
