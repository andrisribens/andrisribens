'use client';

import React from 'react';
import styles from './Buttons.module.scss';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setBird } from '@/store/numbersSlice';

const Buttons: React.FC = () => {
  const dispatch = useDispatch();

  const btn1 = 'stork';
  const btn2 = 'Emu';

  const handleBtn1Click = () => {
    dispatch(setBird(btn1));
  };

  const handleBtn2Click = () => {
    dispatch(setBird(btn2));
  };

  return (
    <div className={styles.buttons}>
      <button onClick={handleBtn1Click}>{btn1}</button>
      <button onClick={handleBtn2Click}>{btn2}</button>
    </div>
  );
};

export default Buttons;
