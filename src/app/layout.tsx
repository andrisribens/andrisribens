import Script from 'next/script';
import type { Metadata } from 'next';
import '../styles/globals.scss';
import Footer from '../components/footer/Footer';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://andrisribens.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Andris Rībens website',
  description:
    'This is Andris Rībens personal website, where I showcase some of my personal projects.',
  manifest: '/img/site.webmanifest',
  openGraph: {
    title: 'Andris Rībens website',
    description:
      'This is Andris Rībens personal website, where I showcase some of my personal projects.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Andris Rībens website',
    description:
      'This is Andris Rībens personal website, where I showcase some of my personal projects.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0J4LS936SG"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0J4LS936SG', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
