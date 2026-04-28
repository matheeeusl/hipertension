export interface Temperature {
  id: string;
  user_id: string;
  temperature: number;
  notes?: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface TemperatureInput {
  temperature: number;
  notes?: string;
  recorded_at?: string;
}

export interface TemperatureChartData {
  date: string;
  datetime: string;
  temperature: number;
}
