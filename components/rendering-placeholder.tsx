import { cn } from '@/lib/cn';

// Placeholder for a rendering that has not yet arrived from Norconsult.
// Fills the correct aspect ratio with the paper-2 tint and a small caption
// noting the pixel spec we are waiting on (§1: request source above 2 560px).
// When the real WebP/AVIF lands, swap this component for <Image />.
type Props = {
  ratio?: 'hero' | 'portrait' | 'square';
  caption?: string;
  className?: string;
};

const ratioClass: Record<NonNullable<Props['ratio']>, string> = {
  hero: 'aspect-[16/10]',
  portrait: 'aspect-[3/4]',
  square: 'aspect-square',
};

export function RenderingPlaceholder({ ratio = 'hero', caption, className }: Props) {
  return (
    <div
      role="img"
      aria-label={caption ?? 'Rendering pending'}
      className={cn(
        'relative w-full bg-paper-2 flex items-end justify-start',
        ratioClass[ratio],
        className,
      )}
    >
      <span className="m-4 text-[12px] text-ink-60">
        {caption ?? 'Rendering 2560×1440 pending Norconsult'}
      </span>
    </div>
  );
}
