import React from 'react';
import styles from './InsightCard.module.scss';
import type { InsightLevel } from '@/app/utilities/weatherTypes';

type InsightCardProps = {
  title: string;
  headline: string;
  detail?: string;
  level: InsightLevel;
  icon?: React.ReactNode;
};

const InsightCard = ({
  title,
  headline,
  detail,
  level,
  icon,
}: InsightCardProps) => {
  return (
    <div className={`${styles.insightCard} ${styles[`insightCard--${level}`]}`}>
      <p className={styles.insightCard__title}>{title}</p>
      <div className={styles.insightCard__body}>
        <p className={styles.insightCard__headline}>{headline}</p>
        {icon}
      </div>
      {detail && <p className={styles.insightCard__detail}>{detail}</p>}
    </div>
  );
};

export default InsightCard;
