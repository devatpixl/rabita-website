import { getTranslations } from 'next-intl/server';
import { GivingCard } from './giving-card';

// The giving card on a phone, as its own band under the hero (2026-08-30).
//
// It briefly lived INSIDE the hero on mobile, which answered the client's
// "where is the donation box?" but broke the picture: the hero sizes to its
// content and its photo is object-cover, so adding a ~600px card to the
// column cropped the image far harder and it read as badly zoomed in.
//
// Here the hero keeps its intended crop and the card still arrives in the
// first scroll. Dusk ground, same as the hero above it, so the two read as
// one move rather than two sections; the paper card is the only bright thing
// on it. md:hidden — from md up the hero's own right column carries the card.
export async function HeroGive() {
  const t = await getTranslations('giving');

  return (
    <section aria-label={t('sheetTitle')} className="bg-dusk px-5 pb-12 md:hidden">
      <div className="mx-auto max-w-[30rem]">
        <div className="overflow-hidden rounded-2xl border border-gold/30 bg-paper text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-10px_rgba(0,0,0,0.35),0_28px_60px_-24px_rgba(0,0,0,0.4)]">
          <GivingCard />
        </div>
      </div>
    </section>
  );
}
