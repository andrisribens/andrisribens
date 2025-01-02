import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the NumbersState interface
interface NumbersState {
  number: number;
  bird: string;
}

// Helper function to load state from localStorage
const loadNumbersState = (): NumbersState => {
  if (typeof window === 'undefined') {
    return { number: 0, bird: '' }; // Default state for server-side rendering
  }

  try {
    const serializedState = localStorage.getItem('numbersState');
    if (serializedState) {
      return JSON.parse(serializedState) as NumbersState;
    }
  } catch (err) {
    console.error('Could not load numbers state:', err);
  }

  return { number: 0, bird: '' }; // Default state if no saved state exists
};

// Helper function to save state to localStorage
const saveNumbersState = (state: NumbersState) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('numbersState', JSON.stringify(state));
    } catch (err) {
      console.error('Could not save numbers state:', err);
    }
  }
};

// Load initial state from localStorage
const initialState: NumbersState = loadNumbersState();

const numbersSlice = createSlice({
  name: 'numbers',
  initialState,
  reducers: {
    setNumber: (state, action: PayloadAction<number>) => {
      state.number = action.payload;
      saveNumbersState(state); // Save updated state to localStorage
    },
    setBird: (state, action: PayloadAction<string>) => {
      state.bird = action.payload;
      saveNumbersState(state); // Save updated state to localStorage
    },
  },
});

export const { setNumber, setBird } = numbersSlice.actions;
export default numbersSlice.reducer;
