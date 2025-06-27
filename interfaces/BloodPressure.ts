export interface BloodPressure {
  id: string;
  systolic_pressure: number;
  diastolic_pressure: number;
  recorded_at: string;
  notes?: string;
  tags?: string[] | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// For form data (without auto-generated fields)
export interface BloodPressureInput {
  systolic_pressure: number;
  diastolic_pressure: number;
  notes?: string;
  tags?: string[];
}

// For API responses
export interface BloodPressureResponse {
  data: BloodPressure[];
  error?: string;
}

// For chart data transformation
export interface BloodPressureChartData {
  date: string;
  datetime: string;
  systolic: number;
  diastolic: number;
  note?: string;
}
