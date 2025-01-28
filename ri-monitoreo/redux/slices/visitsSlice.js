import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

// Thunk para obtener las visitas
export const fetchVisits = createAsyncThunk(
  'visits/fetchVisits',
  async (clienteId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/trabajos/upcoming/${clienteId}`);
      const visits = response.data.map((visit) => ({
        ...visit,
        date: new Date(visit.fechaInicio),
      }));
      return visits;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const visitsSlice = createSlice({
  name: 'visits',
  initialState: {
    visits: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Reducer para marcar una visita como completada
    markVisitAsCompleted: (state, action) => {
      const visitId = action.payload;
      const visit = state.visits.find((v) => v._id === visitId);
      if (visit) {
        visit.estado = 'completado';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = action.payload;
      })
      .addCase(fetchVisits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar las visitas';
      });
  },
});

export const { markVisitAsCompleted } = visitsSlice.actions;
export default visitsSlice.reducer;
