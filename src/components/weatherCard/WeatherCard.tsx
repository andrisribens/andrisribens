import React from 'react';
import Image from 'next/image';
import styles from './WeatherCard.module.scss';
import { div } from 'motion/react-client';

interface CardInfo {
  value?: number;
  units?: string;
  label: string;
  image?: {
    windDirection?: number;
    src: string;
    alt: string;
  };
  windDirectionLabel?: string;
}

const WeatherCard = (cardInfo: CardInfo) => {
  return (
    <div className={styles.weatherCard}>
      <div className={styles.weatherCard__main}>
        <div>
          <span className={styles.weatherCard__value}>{cardInfo.value}</span>
          <span className={styles.weatherCard__unit}>{cardInfo.units}</span>
        </div>
        <span className={styles.weatherCard__label}>{cardInfo.label}</span>
      </div>

      {cardInfo.image && (
        <div>
          {cardInfo.windDirectionLabel && (
            <p className={styles.weatherCard__windDirectionLabel}>
              {cardInfo.windDirectionLabel}
            </p>
          )}
          <div className={styles.weatherCard__image}>
            <Image
              style={{ transform: `rotate(${cardInfo.image.windDirection}deg` }}
              src={cardInfo.image.src}
              alt={cardInfo.image.alt}
              width={60}
              height={60}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
