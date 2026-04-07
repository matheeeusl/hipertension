"use client";

import { useState, useEffect } from "react";
import { BloodPressure, BloodPressureInput } from "@/interfaces/BloodPressure";

export const STORAGE_KEY = "bp_session_readings";

export const useLocalReadings = () => {
  const [readings, setReadings] = useState<BloodPressure[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setReadings(JSON.parse(stored));
  }, []);

  const persist = (updated: BloodPressure[]) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setReadings(updated);
  };

  const addReading = async (input: BloodPressureInput) => {
    const reading: BloodPressure = {
      id: crypto.randomUUID(),
      user_id: "local",
      systolic_pressure: input.systolic_pressure,
      diastolic_pressure: input.diastolic_pressure,
      notes: input.notes,
      tags: input.tags,
      recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    persist([reading, ...readings]);
  };

  const deleteReading = (id: string) => {
    persist(readings.filter((r) => r.id !== id));
  };

  return { readings, addReading, deleteReading };
};
