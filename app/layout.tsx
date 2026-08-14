import type { ReactNode } from 'react';
import './globals.css';

// The [locale] segment owns <html>, <body> and the visible chrome. This
// root layout exists only to satisfy the App Router's requirement.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
