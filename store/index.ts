import { configureStore } from "@reduxjs/toolkit";
import { bloodPressureApi } from "@/api/bloodPressureApi";
import { weightApi } from "@/api/weightApi";
import { temperatureApi } from "@/api/temperatureApi";

export const store = configureStore({
  reducer: {
    [bloodPressureApi.reducerPath]: bloodPressureApi.reducer,
    [weightApi.reducerPath]: weightApi.reducer,
    [temperatureApi.reducerPath]: temperatureApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(bloodPressureApi.middleware)
      .concat(weightApi.middleware)
      .concat(temperatureApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
