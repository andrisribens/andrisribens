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
      <div className={styles.footer__links}>
        <Link target="_blank" href="https://www.kingofthebeach.me">
          King of The Beach
        </Link>
        <Link href="/" rel="author">
          Made by Andris Rībens
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
