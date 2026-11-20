import './globals.css';
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from 'next/font/google';
import { cookies } from 'next/headers';

import type { Metadata, Viewport } from 'next';

const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Allocations',
  description: 'Manage your funds and allocations effectively',
};

async function readTheme(): Promise<'dark' | 'light'> {
  const jar = await cookies();
  return jar.get('pace-theme')?.value === 'light' ? 'light' : 'dark';
}

export async function generateViewport(): Promise<Viewport> {
  const theme = await readTheme();
  return {
    themeColor: theme === 'light' ? '#f4f3f0' : '#09090b',
    viewportFit: 'cover',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await readTheme();

  return (
    <html
      lang='en'
      data-theme={theme}
      className={`${plexSans.variable} ${plexMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <meta name='apple-mobile-web-app-title' content='Allocations' />
      </head>
      <body className='bg-bg text-ink font-sans antialiased'>{children}</body>
    </html>
  );
}
