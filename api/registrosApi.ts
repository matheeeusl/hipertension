import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const registrosApi = createApi({
  reducerPath: 'registrosApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Registros'],
  endpoints: (builder) => ({
    getRegistros: builder.query({
      query: (userId) => `/registros?userId=${userId}`,
      providesTags: ['Registros'],
    }),
    addRegistro: builder.mutation({
      query: ({registro, userId}) => ({
        url: `/registros?userId=${userId}`,
        method: 'POST',
        body: registro,
      }),
      invalidatesTags: ['Registros'],
    }),
  }),
});

export const { useGetRegistrosQuery, useAddRegistroMutation } = registrosApi;