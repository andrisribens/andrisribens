import React from 'react';
import Image from 'next/image';
import styles from './DaylightCard.module.scss';

type DaylightCardVariant = 'sun' | 'moon';

type DaylightCardProps = {
  title: string;
  headline: string;
  details?: string[];
  iconSrc: string;
  iconAlt?: string;
  variant?: DaylightCardVariant;
};

const DaylightCard = ({
  title,
  headline,
  details,
  iconSrc,
  iconAlt = '',
  variant = 'sun',
}: DaylightCardProps) => {
  return (
    <div
      className={`${styles.daylightCard} ${styles[`daylightCard--${variant}`]}`}
    >
      <p className={styles.daylightCard__title}>{title}</p>
      <div className={styles.daylightCard__body}>
        <p className={styles.daylightCard__headline}>{headline}</p>
        <Image
          className={styles.daylightCard__icon}
          src={iconSrc}
          alt={iconAlt}
          width={56}
          height={56}
        />
      </div>
      {details && details.length > 0 && (
        <div className={styles.daylightCard__details}>
          {details.map((line) => (
            <p key={line} className={styles.daylightCard__detail}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default DaylightCard;
