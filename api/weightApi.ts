import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Weight, WeightInput } from "@/interfaces/Weight";
import supabase from "@/utils/supabaseClientBrowser";

export const weightApi = createApi({
  reducerPath: "weightApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Weight"],
  endpoints: (builder) => ({
    getWeightReadings: builder.query<Weight[], string>({
      queryFn: async (userId) => {
        const { data, error } = await supabase
          .from("weight_readings")
          .select("*")
          .eq("user_id", userId)
          .order("recorded_at", { ascending: false });
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: data ?? [] };
      },
      providesTags: ["Weight"],
    }),
    addWeightReading: builder.mutation<Weight, { reading: WeightInput; userId: string }>({
      queryFn: async ({ reading, userId }) => {
        const { data, error } = await supabase
          .from("weight_readings")
          .insert([{
            weight: reading.weight,
            notes: reading.notes ?? null,
            user_id: userId,
            recorded_at: new Date().toISOString(),
          }])
          .select()
          .single();
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data };
      },
      invalidatesTags: ["Weight"],
    }),
    updateWeightReading: builder.mutation<Weight, { id: string; reading: Partial<WeightInput>; userId: string }>({
      queryFn: async ({ id, reading, userId }) => {
        const { data, error } = await supabase
          .from("weight_readings")
          .update(reading)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data };
      },
      invalidatesTags: ["Weight"],
    }),
    deleteWeightReading: builder.mutation<void, { id: string; userId: string }>({
      queryFn: async ({ id, userId }) => {
        const { error } = await supabase
          .from("weight_readings")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
      invalidatesTags: ["Weight"],
    }),
  }),
});

export const {
  useGetWeightReadingsQuery,
  useAddWeightReadingMutation,
  useUpdateWeightReadingMutation,
  useDeleteWeightReadingMutation,
} = weightApi;
