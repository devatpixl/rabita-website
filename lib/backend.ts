// The one place the Django backend's address lives.
//
// Server-side only — there is no NEXT_PUBLIC_ equivalent and there must not be.
// The browser talks to this app's own /api/* routes; those routes talk to the
// backend. That keeps the API origin out of the client bundle, keeps CORS a
// non-issue, and means the browser-facing contract never changes shape.
//
// Unset means the backend is not wired up here yet. Every proxy below treats
// that as "not configured" and answers exactly as it did before the backend
// existed, which is what keeps this deployable while the VPS is still being
// built.

export const BACKEND_URL = (process.env.BACKEND_URL ?? '').replace(/\/$/, '');

export function backendConfigured(): boolean {
  return BACKEND_URL.length > 0;
}

/**
 * POST to the backend and hand back its status and parsed body.
 *
 * Never throws. A backend that is down, slow or unreachable must not take the
 * website's form with it — the caller decides what to do, and for most forms
 * that means falling back to the same `503 not_configured` the front end has
 * always answered, which is what triggers the mailto: draft in the UI.
 */
export async function postToBackend(
  path: string,
  body: unknown,
  timeoutMs = 12_000,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> | null }> {
  if (!backendConfigured()) return { ok: false, status: 0, data: null };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}
