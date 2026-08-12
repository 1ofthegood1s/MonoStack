import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LILY Monolith',
  description: 'Stack 30 blocks. Misses get trimmed. Reassemble the LILY monolith.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
