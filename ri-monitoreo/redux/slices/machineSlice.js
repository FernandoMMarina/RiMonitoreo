import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const API_URL = 'https://rosensteininstalaciones.com.ar/api';

// Thunk para obtener máquinas
export const fetchMachines = createAsyncThunk(
  'machine/fetchMachines',
  async (userId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/machines/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const machines = response.data || [];
     
      // Calcular el estado de mantenimiento para cada máquina
      const calculateMachineStatus = (machines) => {
        const getMaintenanceStatus = (lastMaintenanceDate, maintenanceHistory = []) => {
          const dateToCheck = lastMaintenanceDate || (maintenanceHistory.length > 0 ? maintenanceHistory[0].date : null);
          if (!dateToCheck) {
            return { status: 'Sin registro', color: 'red' };
          }

          const now = new Date();
          const lastMaintenance = new Date(dateToCheck);
          const diffMonths =
            (now.getFullYear() - lastMaintenance.getFullYear()) * 12 +
            now.getMonth() - lastMaintenance.getMonth();

          return diffMonths > 3
            ? { status: 'Revisar Mantenimiento', color: 'red' }
            : { status: 'Mantenimiento al día', color: 'green' };
        };

        return machines.map((machine) => {
          const { status, color } = getMaintenanceStatus(
            machine.lastMaintenance,
            machine.maintenanceHistory || []
          );
          return { ...machine, status, color }; // Incluye el nombre y el ID ya mapeados
        });
      };


      return calculateMachineStatus(machines);
    } catch (error) {
      console.error('Error en fetchMachines:', error.message);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const machineSlice = createSlice({
  name: 'machine',
  initialState: {
    machines: [],
    loading: null,
    error: null,
  },
  reducers: {
    setMachines: (state, action) => {
      state.machines = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.machines = action.payload;
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al obtener máquinas';
      });
  },
});

export const { setMachines } = machineSlice.actions;
export default machineSlice.reducer;



