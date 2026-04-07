import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { BloodPressure, BloodPressureInput } from "@/interfaces/BloodPressure";
import supabase from "@/utils/supabaseClientBrowser";

export const bloodPressureApi = createApi({
  reducerPath: "bloodPressureApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["BloodPressure"],
  endpoints: (builder) => ({
    getBloodPressureReadings: builder.query<BloodPressure[], string>({
      queryFn: async (userId) => {
        const { data, error } = await supabase
          .from("blood_pressure_readings")
          .select("*")
          .eq("user_id", userId)
          .order("recorded_at", { ascending: false });
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: data ?? [] };
      },
      providesTags: ["BloodPressure"],
    }),
    addBloodPressureReading: builder.mutation<
      BloodPressure,
      { reading: BloodPressureInput; userId: string }
    >({
      queryFn: async ({ reading, userId }) => {
        const { data, error } = await supabase
          .from("blood_pressure_readings")
          .insert([{
            systolic_pressure: reading.systolic_pressure,
            diastolic_pressure: reading.diastolic_pressure,
            notes: reading.notes ?? null,
            tags: reading.tags ?? null,
            user_id: userId,
            recorded_at: new Date().toISOString(),
          }])
          .select()
          .single();
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data };
      },
      invalidatesTags: ["BloodPressure"],
    }),
    updateBloodPressureReading: builder.mutation<
      BloodPressure,
      { id: string; reading: Partial<BloodPressureInput>; userId: string }
    >({
      queryFn: async ({ id, reading, userId }) => {
        const { data, error } = await supabase
          .from("blood_pressure_readings")
          .update(reading)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data };
      },
      invalidatesTags: ["BloodPressure"],
    }),
    deleteBloodPressureReading: builder.mutation<void, { id: string; userId: string }>({
      queryFn: async ({ id, userId }) => {
        const { error } = await supabase
          .from("blood_pressure_readings")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
      invalidatesTags: ["BloodPressure"],
    }),
  }),
});

export const {
  useGetBloodPressureReadingsQuery,
  useAddBloodPressureReadingMutation,
  useUpdateBloodPressureReadingMutation,
  useDeleteBloodPressureReadingMutation,
} = bloodPressureApi;
