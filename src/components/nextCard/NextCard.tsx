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
  precipitationMin?: number;
  precipitationMax?: number;
  probabilityOfPrecipitation?: number;
  probabilityOfThunder?: number;
  temperatureMin?: number;
  temperatureMax?: number;
  units: string;
  temperatureUnits?: string;
}

function hasPrecipitationValue(card: CardInfo): boolean {
  const { precipitation, precipitationMin, precipitationMax } = card;

  if (typeof precipitation === 'number') {
    return true;
  }

  if (precipitationMin != null || precipitationMax != null) {
    return true;
  }

  return precipitation != null && precipitation !== '';
}

function formatPrecipitation(card: CardInfo): string {
  const { precipitation, precipitationMin, precipitationMax, units } = card;

  if (
    precipitationMin != null &&
    precipitationMax != null &&
    precipitationMin !== precipitationMax
  ) {
    return `${precipitationMin}–${precipitationMax} ${units}`;
  }

  if (
    precipitationMin != null &&
    precipitationMax != null &&
    precipitationMin === precipitationMax
  ) {
    return `${precipitationMin} ${units}`;
  }

  if (typeof precipitation === 'number') {
    return `${precipitation} ${units}`;
  }

  return precipitation != null ? String(precipitation) : '';
}

const NextCard = (cardInfo: CardInfo) => {
  const precipValue = cardInfo.precipitation;
  const hasPrecip =
    (typeof precipValue === 'number' && precipValue > 0) ||
    (cardInfo.precipitationMax != null && cardInfo.precipitationMax > 0);

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
          {hasPrecipitationValue(cardInfo) && (
            <p
              className={
                hasPrecip
                  ? `${styles.nextCard__precipitationvalue} ${styles.blue}`
                  : styles.nextCard__precipitationvalue
              }
            >
              {formatPrecipitation(cardInfo)}
            </p>
          )}
        </div>
      </div>

      <ul className={styles.nextCard__stats}>
        {cardInfo.probabilityOfPrecipitation != null && (
          <li>Rain chance: {Math.round(cardInfo.probabilityOfPrecipitation)}%</li>
        )}
        {cardInfo.probabilityOfThunder != null &&
          cardInfo.probabilityOfThunder > 0 && (
            <li>Thunder: {Math.round(cardInfo.probabilityOfThunder)}%</li>
          )}
        {cardInfo.temperatureMin != null && cardInfo.temperatureMax != null && (
          <li>
            Temp: {cardInfo.temperatureMin}–{cardInfo.temperatureMax}
            {cardInfo.temperatureUnits ? ` ${cardInfo.temperatureUnits}` : '°'}
          </li>
        )}
      </ul>
    </div>
  );
};

export default NextCard;
export type { CardInfo };
