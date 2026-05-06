import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import buildReducer from '../features/builds/buildSlice'; // <-- ADD THIS

export const store = configureStore({
  reducer: {
    auth: authReducer,
    builds: buildReducer, 
  },
});