import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
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
