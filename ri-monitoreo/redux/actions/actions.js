import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(token, 'Actions');
      if (!token) {
        throw new Error('Token no encontrado');
      }
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data, 'Actions Data');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMachines = createAsyncThunk(
  'machines/fetchMachines',
  async (idCliente, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token no encontrado');
      }
      const response = await axios.get(`${API_URL}/machines/user/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching machines:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchLastMaintenances = createAsyncThunk(
  'maintenances/fetchLastMaintenances',
  async (idCliente, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token no encontrado');
      }
      const response = await axios.get(`${API_URL}/trabajos/clientes/${idCliente}/servicios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Maintenances",response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching last maintenances:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
