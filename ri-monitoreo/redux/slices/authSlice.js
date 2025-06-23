import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode'; // ✅ forma correcta

console.log("jwt_decode:", typeof jwt_decode); // debería imprimir 'function'

const initialState = {
  isAuthenticated: null,
  user: null,
};

// Thunk para verificar si hay token almacenado y válido
export const checkStoredToken = createAsyncThunk(
  'auth/checkStoredToken',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log("jwt_decode:", typeof jwt_decode); 

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return false;

      const decoded = jwt_decode(token); // ✅ sin .default
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        console.log("[TOKEN EXPIRADO]");
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        dispatch(logoutSuccess());
        return false;
      }

      dispatch(loginSuccess(decoded));
      return true;
    } catch (error) {
      console.error("[CHECK TOKEN ERROR]", error);
      return rejectWithValue(error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkStoredToken.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload;
      })
      .addCase(checkStoredToken.rejected, (state) => {
        state.isAuthenticated = false;
      });
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
