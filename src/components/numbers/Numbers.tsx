'use client';

import React from 'react';
import styles from './Numbers.module.scss';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setNumber } from '@/store/numbersSlice';

const Numbers: React.FC = () => {
  const dispatch = useDispatch();
  const number = useSelector((state: RootState) => state.numbers.number);

  const increaseNumber = () => {
    dispatch(setNumber(number + 1));
  };

  const decreaseNumber = () => {
    dispatch(setNumber(number - 1));
  };

  return (
    <div className={styles.numbers}>
      <button onClick={increaseNumber}>+</button>
      <button onClick={decreaseNumber}>-</button>
    </div>
  );
};

export default Numbers;
