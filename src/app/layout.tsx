import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Laundry Simulator v1 - Casual 2D Web Game',
  description:
    'Game simulasi bisnis 2D kasual berbasis web: kasir, timbangan, inventori sabun, dan laporan keuangan harian (End of Day).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className="antialiased bg-slate-950 text-white selection:bg-yellow-400 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
