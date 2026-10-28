'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.scss';

const Footer = () => {
  const pathname = usePathname();
  const isWeather = pathname?.startsWith('/weather') ?? false;

  if (!isWeather) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <nav className={styles.footer__links} aria-label="Related links">
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.kingofthebeach.me"
        >
          King of The Beach
          <span className="visuallyHidden"> (opens in a new tab)</span>
        </Link>
        <Link href="/" rel="author">
          Made by Andris Rībens
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
