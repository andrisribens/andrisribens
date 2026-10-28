import React from 'react';
import styles from './WeatherTop.module.scss';
import Image from 'next/image';

const WeatherTop: React.FC = () => {
  return (
    <header className={styles.weatherTop}>
      <div className="container">
        <div className={styles.weatherTop__inner}>
          <a href="/weather">
            <Image
              src="/img/logo8.png"
              alt="Weather Now"
              width={1000}
              height={1000}
              priority={true}
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default WeatherTop;
