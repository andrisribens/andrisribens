import React from 'react';
import styles from './NextCard.module.scss';
import Image from 'next/image';

interface CardInfo {
  title: string;
  image: {
    src: string;
    alt: string;
  };
  precipitation?: number | string;
  units: string;
}

const NextCard = (cardInfo: CardInfo) => {
  return (
    <div className={styles.nextCard}>
      <h3 className={styles.nextCard__title}>{cardInfo.title}</h3>
      <div className={styles.nextCard__main}>
        <Image
          src={cardInfo.image.src}
          alt={cardInfo.image.alt}
          width={100}
          height={100}
          className={styles.nextCard__image}
        />
        <div>
          <p
            className={
              typeof cardInfo.precipitation === 'number' &&
              cardInfo.precipitation > 0
                ? `${styles.nextCard__precipitationvalue} ${styles.blue}`
                : styles.nextCard__precipitationvalue
            }
          >
            {cardInfo.precipitation}
          </p>
          {typeof cardInfo.precipitation === 'number' && (
            <p className={styles.nextCard__precipitationvaluelabel}>
              {cardInfo.units}
            </p>
          )}
        </div>
      </div>

      <p className={styles.nextCard__precipitationlabel}>Precipitation</p>
    </div>
  );
};

export default NextCard;
export type { CardInfo };
