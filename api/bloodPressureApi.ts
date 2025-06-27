import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BloodPressure, BloodPressureInput } from "@/interfaces/BloodPressure";

export const bloodPressureApi = createApi({
  reducerPath: "bloodPressureApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/",
  }),
  tagTypes: ["BloodPressure"],
  endpoints: (builder) => ({
    getBloodPressureReadings: builder.query<BloodPressure[], string>({
      query: (userId) => `blood-pressure/${userId}`,
      providesTags: ["BloodPressure"],
    }),
    addBloodPressureReading: builder.mutation<
      BloodPressure,
      { reading: BloodPressureInput; userId: string }
    >({
      query: ({ reading, userId }) => ({
        url: `blood-pressure/${userId}`,
        method: "POST",
        body: reading,
      }),
      invalidatesTags: ["BloodPressure"],
    }),
    updateBloodPressureReading: builder.mutation<
      BloodPressure,
      { id: string; reading: Partial<BloodPressureInput>; userId: string }
    >({
      query: ({ id, reading, userId }) => ({
        url: `blood-pressure/${userId}/${id}`,
        method: "PUT",
        body: reading,
      }),
      invalidatesTags: ["BloodPressure"],
    }),
    deleteBloodPressureReading: builder.mutation<
      void,
      { id: string; userId: string }
    >({
      query: ({ id, userId }) => ({
        url: `blood-pressure/${userId}/${id}`,
        method: "DELETE",
      }),
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
