import Link from 'next/link';

// Root-level not-found for paths that never made it through the locale
// middleware. Renders a full HTML shell since it sits above [locale].
export default function GlobalNotFound() {
  return (
    <html lang="no">
      <body className="bg-paper text-ink">
        <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-24">
          <p className="text-[13px] text-gold">404</p>
          <h1 className="mt-3 font-serif text-display">Siden finnes ikke.</h1>
          <p className="mt-4 text-body text-ink-60">
            Kanskje adressen er gammel, eller den er skrevet feil.
          </p>
          <div className="mt-8">
            <Link href="/no" className="min-h-11 inline-block rounded-full bg-ink px-4 py-2 text-body font-semibold text-paper">
              Til forsiden
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
