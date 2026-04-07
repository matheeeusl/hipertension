import { configureStore } from "@reduxjs/toolkit";
import { bloodPressureApi } from "@/api/bloodPressureApi";

export const store = configureStore({
  reducer: {
    [bloodPressureApi.reducerPath]: bloodPressureApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(bloodPressureApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
