import axios from 'axios';
import axiosAuth from './axiosAuth'; // ruta según ubicación real

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosAuth.get('/users/profile');
      console.log(response.data)
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
      const response = await axiosAuth.get(`/machines/user/${idCliente}`);
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
      const response = await axiosAuth.get(`/trabajos/clientes/${idCliente}/servicios`);
      return response.data;
    } catch (error) {
      console.error('Error fetching last maintenances:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
