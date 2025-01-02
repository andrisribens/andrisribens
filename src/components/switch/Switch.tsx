'use client';

import React from 'react';
import styles from './Switch.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode } from '@/store/darkModeSlice';
import { RootState } from '@/store/store';

const Switch: React.FC = () => {
  const isDarkMode = useSelector(
    (state: RootState) => state.darkMode?.isDarkMode ?? false
  );
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div
      className={
        isDarkMode ? `${styles.switch} ${styles.active}` : styles.switch
      }
      onClick={handleClick}
    >
      <div className={styles.switch__ball}></div>
    </div>
  );
};

export default Switch;
