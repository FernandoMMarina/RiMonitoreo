import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://rosensteininstalaciones.com.ar/api/trabajos';

export const updateTrabajo = createAsyncThunk(
  'trabajos/updateTrabajo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const trabajoSlice = createSlice({
  name: 'trabajos',
  initialState: {
    items: [], // lista de trabajos
    loading: false,
    error: null,
  },
  reducers: {
    setTrabajos(state, action) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateTrabajo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrabajo.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (trabajo) => trabajo._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTrabajo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al actualizar trabajo';
      });
  },
});

export const { setTrabajos } = trabajoSlice.actions;
export default trabajoSlice.reducer;
