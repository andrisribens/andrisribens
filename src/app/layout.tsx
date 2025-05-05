'use client';
import type { Metadata } from 'next';
import '../styles/globals.scss';
import Footer from '../components/footer/Footer';

// Optional: Uncomment and customize metadata if needed
// export const metadata: Metadata = {
//   title: 'My App Title',
//   description: 'App description here',
// };

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
