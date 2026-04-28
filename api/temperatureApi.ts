import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Temperature, TemperatureInput } from "@/interfaces/Temperature";
import supabase from "@/utils/supabaseClientBrowser";

export const temperatureApi = createApi({
  reducerPath: "temperatureApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Temperature"],
  endpoints: (builder) => ({
    getTemperatureReadings: builder.query<Temperature[], string>({
      queryFn: async (userId) => {
        const { data, error } = await supabase
          .from("temperature_readings")
          .select("*")
          .eq("user_id", userId)
          .order("recorded_at", { ascending: false });
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: data ?? [] };
      },
      providesTags: ["Temperature"],
    }),
    addTemperatureReading: builder.mutation<Temperature, { reading: TemperatureInput; userId: string }>({
      queryFn: async ({ reading, userId }) => {
        const { data, error } = await supabase
          .from("temperature_readings")
          .insert([{
            temperature: reading.temperature,
            notes: reading.notes ?? null,
            user_id: userId,
            recorded_at: reading.recorded_at ?? new Date().toISOString(),
          }])
          .select()
          .single();
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data };
      },
      invalidatesTags: ["Temperature"],
    }),
    updateTemperatureReading: builder.mutation<Temperature, { id: string; reading: Partial<TemperatureInput>; userId: string }>({
      queryFn: async ({ id, reading, userId }) => {
        const { data, error } = await supabase
          .from("temperature_readings")
          .update(reading)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data };
      },
      invalidatesTags: ["Temperature"],
    }),
    deleteTemperatureReading: builder.mutation<void, { id: string; userId: string }>({
      queryFn: async ({ id, userId }) => {
        const { error } = await supabase
          .from("temperature_readings")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
      invalidatesTags: ["Temperature"],
    }),
  }),
});

export const {
  useGetTemperatureReadingsQuery,
  useAddTemperatureReadingMutation,
  useUpdateTemperatureReadingMutation,
  useDeleteTemperatureReadingMutation,
} = temperatureApi;
