import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = 'https://rosensteininstalaciones.com.ar/api';

// Crear el thunk para obtener los mantenimientos
export const fetchLastMaintenances = createAsyncThunk(
  'maintenances/fetchLastMaintenances',
  async (userId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/machines/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const maintenances = response.data || [];
      const now = new Date();
      
      // Calcular el estado de mantenimiento
      const enrichedMaintenances = maintenances.map((maintenance) => {
        const lastMaintenanceDate = new Date(maintenance.date);
        const diffMonths =
          (now.getFullYear() - lastMaintenanceDate.getFullYear()) * 12 +
          now.getMonth() - lastMaintenanceDate.getMonth();

        return {
          ...maintenance,
          status: diffMonths > 3 ? 'Revisar Mantenimiento' : 'Mantenimiento al día',
          color: diffMonths > 3 ? 'red' : 'green',
        };
      });

      return enrichedMaintenances;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const maintenanceSlice = createSlice({
  name: 'maintenances',
  initialState: {
    lastMaintenances: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Aquí puedes agregar otros reducers si necesitas manejar estados de mantenimiento
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLastMaintenances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLastMaintenances.fulfilled, (state, action) => {
        state.loading = false;
        state.lastMaintenances = action.payload;
      })
      .addCase(fetchLastMaintenances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al obtener mantenimientos';
      });
  },
});

export const { setLastMaintenances, setLoading, setError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
