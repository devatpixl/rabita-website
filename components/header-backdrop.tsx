import Image from 'next/image';

// What sits behind the bar while it is still a pill. Without this the page behind the header is paper, and a pill clipped out of paper on paper is invisible.
export function HeaderBackdrop() {
  return (
    <div
      aria-hidden
      className="header-backdrop pointer-events-none fixed inset-x-0 top-0 z-[39] h-[136px] overflow-hidden"
    >
      <Image
        src="/hero/volunteers-gateiftar-16x9.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{
          objectPosition: 'center 26%',
          filter: 'saturate(0.72) contrast(1.12) brightness(0.82) blur(10px)',
          transform: 'scale(1.08)',
        }}
      />
      <div className="absolute inset-0 bg-dusk/45" />
    </div>
  );
}
