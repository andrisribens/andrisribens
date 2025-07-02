import Script from 'next/script';
import type { Metadata } from 'next';
import '../styles/globals.scss';
import Footer from '../components/footer/Footer';

// Optional: Uncomment and customize metadata if needed
export const metadata: Metadata = {
  title: 'Andris Rībens website',
  description:
    'This is Andris Rībens personal website, where I showcase some of my personal projects.',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
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
