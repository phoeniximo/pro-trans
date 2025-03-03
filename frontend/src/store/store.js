import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import annoncesReducer from './slices/annoncesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    annonces: annoncesReducer
  }
});