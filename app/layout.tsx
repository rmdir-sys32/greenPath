import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GreenPath — Pollution-Aware Navigation',
  description: 'Find the cleanest route to your destination. GreenPath uses real-time air quality data to recommend routes with the lowest pollution exposure.',
  keywords: ['air quality', 'pollution', 'routing', 'navigation', 'health', 'PM2.5', 'AQI'],
  authors: [{ name: 'GreenPath Team' }],
  openGraph: {
    title: 'GreenPath — Breathe Cleaner Air on Every Journey',
    description: 'Pollution-aware routing powered by real-time AQI data.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 transition-colors`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
