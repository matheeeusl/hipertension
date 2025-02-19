import { createSlice } from '@reduxjs/toolkit';
import { Registro } from '@/interfaces/Registro';

const initialState = {
  registros: [] as Registro[],
};

const registrosSlice = createSlice({
  name: 'registros',
  initialState,
  reducers: {},
});

export default registrosSlice.reducer;