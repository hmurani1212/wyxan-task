import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The small web — addresses, pages, history',
  description:
    'Ten pages at ten addresses. Type an address, follow a link, search what exists, and see where you have been.',
};

export const viewport: Viewport = {
  themeColor: '#f3ece0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
