import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state type
export type Env = {
    auth: string
    envId: string
    projectId: string
    authError?: boolean
}

interface EnvState {
  value: Env
}

// Initial state
const initialState: EnvState = {
  value: {
    auth: "",
    envId: "",
    projectId: "",
    authError: false,
  }
};

// Creating the slice
const envSlice = createSlice({
  name: 'Environment',
  initialState,
  reducers: {
    // Action to set the value of the string
    setEnv: (state, action: PayloadAction<Env>) => {
      state.value = action.payload;
    },
  },
});

// Exporting the actions and the reducer
export const { setEnv } = envSlice.actions;
export default envSlice.reducer;