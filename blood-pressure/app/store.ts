"use client"

import { configureStore } from '@reduxjs/toolkit';
import { registrosApi } from '@/api/registrosApi';
import registrosReducer from '@/features/registrosSlice';

const store = configureStore({
  reducer: {
    registros: registrosReducer,
    [registrosApi.reducerPath]: registrosApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(registrosApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
