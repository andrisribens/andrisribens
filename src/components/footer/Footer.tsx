import React from 'react';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__links}>
        <a target="_blank" href="https://www.kingofthebeach.me">
          King of The Beach
        </a>
        <a href="/" rel="author">
          Made by Andris Rībens
        </a>
      </div>
    </footer>
  );
};

export default Footer;
