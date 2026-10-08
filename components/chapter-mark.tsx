import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

export type Chapter = 'services' | 'project' | 'apartments' | 'fundraising' | 'social';

/**
 * The mark each front-page chapter opens with on a phone: Rabita's rosette and
 * the section's name, in plain words.
 *
 * WHY THIS EXISTS (client, Mobilversjon, and three times since — most recently
 * 2026-10-08, with two seams boxed in red): "overgangene mellom vær seksjon må
 * være tydligere ... det blir bare mye info og tekst, som ikke nødvendigvis har
 * noe med hverandre å gjøre."
 *
 * Hairlines between sections did not answer it, and looking at the page as one
 * continuous strip shows why. Every section opens the SAME way — a serif
 * headline with one word in gold italic: Våre *tjenester*, *Drømmemoskéen*, 3 av
 * 15 er *solgt*, Samlet inn til *mosképrosjektet*, Huset er åpent — også *på
 * nett*. Six sections, one look, so the start of a section is indistinguishable
 * from the middle of one. And the headlines are clever sentences rather than
 * topics: you have to READ "Huset er åpent — også på nett" to learn that it is
 * the social-media section. A hairline says that something ended. It never says
 * what comes next.
 *
 * So the topic is named first, the same way every time, and the clever line
 * follows it. Five identical openers read as five chapters of one story.
 *
 * THE FORM WAS CHOSEN FROM TWO PROTOTYPES rendered on the live page (user,
 * 2026-10-08): a centred headpiece, and this left-aligned running head. The
 * running head won, and the trailing rule it was drawn with came off at the same
 * time ("without the ——— after the headings").
 *
 * THE ROSETTE IS THE HEADER'S OWN MARK, rabita-mark-tight-216.png — the figure
 * the client asked to have beside the logo in the menu. marks.tsx's
 * RosetteMark is a construction drawing with its circles and radii left in,
 * which turns to noise at 18px.
 *
 * md:hidden. The complaint is about scrolling on a phone; the desktop keeps
 * its existing eyebrows and gutters.
 */
export function ChapterMark({
  chapter,
  tone = 'light',
  className,
}: {
  chapter: Chapter;
  /** `dark` on dusk grounds, where gold-deep would sink into the background. */
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const t = useTranslations('chapters');
  return (
    <p className={cn('flex items-center gap-2.5 md:hidden', className)}>
      <Image
        src="/logo/rabita-mark-tight-216.png"
        alt=""
        aria-hidden
        width={36}
        height={36}
        className="h-[18px] w-[18px] shrink-0"
      />
      <span
        className={cn(
          'font-mono text-[0.6875rem] uppercase tracking-[0.24em]',
          tone === 'dark' ? 'text-gold' : 'text-gold-deep',
        )}
      >
        {t(chapter)}
      </span>
    </p>
  );
}
