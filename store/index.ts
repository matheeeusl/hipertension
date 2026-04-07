import { configureStore } from "@reduxjs/toolkit";
import { bloodPressureApi } from "@/api/bloodPressureApi";
import { weightApi } from "@/api/weightApi";

export const store = configureStore({
  reducer: {
    [bloodPressureApi.reducerPath]: bloodPressureApi.reducer,
    [weightApi.reducerPath]: weightApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(bloodPressureApi.middleware)
      .concat(weightApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
