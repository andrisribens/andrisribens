

import { configureStore } from '@reduxjs/toolkit';
import numbersReducer from './numbersSlice';
import darkModeReducer from './darkModeSlice';

const isClient = typeof window !== 'undefined';

const loadState = (): Partial<RootState> | undefined => {
  if (!isClient) return undefined;

  try {
    const serializedState = localStorage.getItem('reduxState');
    if (!serializedState) return undefined;
    const parsedState = JSON.parse(serializedState);
    return {
      ...parsedState,
      darkMode: parsedState.darkMode ?? { isDarkMode: false }, // Default state
      numbers: parsedState.numbers ?? { number: 2, bird: "" }, // Default state

    };
  } catch (err) {
    console.error("Could not load state:", err);
    return undefined;
  }
};

const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify({
      darkMode: state.darkMode, // Persist only darkMode
      numbers: state.numbers,
    });
    localStorage.setItem('reduxState', serializedState);
  } catch (err) {
    console.error("Could not save state:", err);
  }
};

// Throttle function to optimize saveState
const throttle = (func: Function, limit: number) => {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  return (...args: any[]) => {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

const store = configureStore({
  reducer: {
    numbers: numbersReducer,
    darkMode: darkModeReducer,
  },
  preloadedState: loadState(),
});

const throttledSaveState = throttle(() => saveState(store.getState()), 1000);

store.subscribe(throttledSaveState);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
