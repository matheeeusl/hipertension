import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BloodPressure } from "@/interfaces/BloodPressure";

interface BloodPressureState {
  readings: BloodPressure[];
  selectedReading: BloodPressure | null;
  filters: {
    dateRange: {
      start: string | null;
      end: string | null;
    };
    category: string | null;
  };
  preferences: {
    chartType: "line" | "bar";
    showCategory: boolean;
    timeFormat: "12h" | "24h";
  };
}

const initialState: BloodPressureState = {
  readings: [],
  selectedReading: null,
  filters: {
    dateRange: {
      start: null,
      end: null,
    },
    category: null,
  },
  preferences: {
    chartType: "line",
    showCategory: true,
    timeFormat: "24h",
  },
};

const bloodPressureSlice = createSlice({
  name: "bloodPressure",
  initialState,
  reducers: {
    setSelectedReading: (
      state,
      action: PayloadAction<BloodPressure | null>
    ) => {
      state.selectedReading = action.payload;
    },
    setDateRangeFilter: (
      state,
      action: PayloadAction<{ start: string | null; end: string | null }>
    ) => {
      state.filters.dateRange = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<BloodPressureState["preferences"]>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    resetState: () => initialState,
  },
});

export const {
  setSelectedReading,
  setDateRangeFilter,
  setCategoryFilter,
  clearFilters,
  updatePreferences,
  resetState,
} = bloodPressureSlice.actions;

export default bloodPressureSlice.reducer;
