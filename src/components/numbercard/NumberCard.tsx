'use client';

import React from 'react';
import styles from './NumberCard.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const NumberCard: React.FC = () => {
  const { number, bird } = useSelector((state: RootState) => state.numbers);

  return (
    <div className={styles.numberCard}>
      <h2>{number}</h2>
      <h2>{bird}</h2>
    </div>
  );
};

export default NumberCard;
