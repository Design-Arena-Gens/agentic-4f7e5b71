import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TechSpace AI',
  description: 'Autonomous AI news curator and video script generator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
