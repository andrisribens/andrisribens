// 'use client';
import type { Metadata } from 'next';
import '../styles/globals.scss';
import Footer from '../components/footer/Footer';

// Optional: Uncomment and customize metadata if needed
export const metadata: Metadata = {
  title: 'Andris Rībens website',
  description:
    'This is Andris Rībens personal website, where I showcase some of my personal projets.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
