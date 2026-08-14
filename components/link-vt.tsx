'use client';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';

// View Transitions wrapper. When document.startViewTransition is
// available (Chrome 111+, Safari 18+, Firefox 129+) navigation is
// wrapped in a startViewTransition callback so the browser cross-fades
// old → new tree. Otherwise falls back to normal <Link> behaviour.
//
// Used sparingly — mount only on the nav items + wordmark + Give button
// so shared elements persist across routes without a full sweep of the
// codebase.

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
  };

export function LinkVT({ children, onClick, href, ...rest }: Props) {
  const router = useRouter();
  const supported =
    typeof document !== 'undefined' && 'startViewTransition' in document;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!supported) return;
    // Only intercept plain left-clicks — respect open-in-new-tab, etc.
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }
    e.preventDefault();
    const url = typeof href === 'string' ? href : href.toString();
    (document as unknown as {
      startViewTransition: (cb: () => void) => void;
    }).startViewTransition(() => {
      router.push(url);
    });
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
