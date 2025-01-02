import React from 'react';
import styles from './Header.module.scss';
import Switch from '../switch/Switch';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.header__inner}>
          <nav className={styles.mainNav}>
            <ul>
              <li>
                <a href="/" className={styles.mainNav__item}>
                  Home
                </a>
              </li>
              <li>
                <a href="/dashboard" className={styles.mainNav__item}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/catfacts" className={styles.mainNav__item}>
                  Cat facts
                </a>
              </li>
              <li>
                <a href="/weather" className={styles.mainNav__item}>
                  Weather
                </a>
              </li>
            </ul>
          </nav>
          {/* <Switch /> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
