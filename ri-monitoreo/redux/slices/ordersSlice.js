import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

// Thunk para obtener las órdenes
export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (tecnicoId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/trabajos/tecnicos/${tecnicoId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.data;
      });
  },
});

// Selector para obtener todas las órdenes
export const selectOrders = (state) => state.orders.data;

// Selector memoizado para filtrar órdenes por estado
export const selectFilteredOrders = createSelector(
    [selectOrders, (_, filter) => filter],
    (orders, filter) => {
      console.log('Orders:', orders);
      console.log('Filter:', filter);
      if (!Array.isArray(orders)) return [];
      return filter === 'all' ? orders : orders.filter((order) => order.estado === filter);
    }
  );

export default ordersSlice.reducer;
