export interface Weight {
  id: string;
  user_id: string;
  weight: number;
  notes?: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface WeightInput {
  weight: number;
  notes?: string;
}

export interface WeightChartData {
  date: string;
  datetime: string;
  weight: number;
}
