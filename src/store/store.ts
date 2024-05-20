// Importing necessary functions and middlewares from Redux Toolkit
import { configureStore } from '@reduxjs/toolkit';
import EnvReducer from '../reducers/env-reducer';

// If you have reducers, import them here
// import someReducer from './features/someFeatureSlice';

export const store = configureStore({
    reducer: {
        env: EnvReducer,
    },
    middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Type definitions for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
