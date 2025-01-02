import { createSlice } from '@reduxjs/toolkit';

interface DarkModeState {
  isDarkMode: boolean;
}

// Helper functions
const isClient = () => typeof window !== 'undefined';

const loadDarkMode = (): boolean => {
  if (!isClient()) return false;
  const storedMode = localStorage.getItem('darkMode');
  return storedMode === 'true';
};

const saveDarkMode = (isDarkMode: boolean) => {
  if (!isClient()) return;
  localStorage.setItem('darkMode', isDarkMode.toString());
};

// Initial state
const initialState: DarkModeState = {
  isDarkMode: loadDarkMode(), // Load from localStorage
};

// Slice
const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      saveDarkMode(state.isDarkMode);
    },
    setDarkMode: (state, action: { payload: boolean }) => {
      state.isDarkMode = action.payload;
      saveDarkMode(state.isDarkMode);
    },
  },
});

export const { toggleDarkMode, setDarkMode } = darkModeSlice.actions;

export default darkModeSlice.reducer;




