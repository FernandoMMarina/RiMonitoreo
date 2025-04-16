import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

// Función utilitaria para obtener el token
const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado');
  }
  return token;
};

// Thunk: Obtener perfil del usuario
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Profile ----", response.data);
      return response.data; // Perfil completo
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk: Registrar push token
export const updatePushToken = createAsyncThunk(
  'user/updatePushToken',
  async (pushToken, { getState, rejectWithValue }) => {
    try {
      const token = await getToken();
      const { profile } = getState().user;
      if (!profile?._id) throw new Error('ID de usuario no disponible');

      const response = await axios.post(
        `${API_URL}/users/register-token`,
        { token: pushToken, userId: profile._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk: Actualizar perfil del usuario
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (updatedData, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axios.put(`${API_URL}/users/update`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    selectedUser: null,
    loadingProfile: false,
    loadingPushToken: false,
    profileError: null,
    pushTokenError: null,
  },
  reducers: {
    logout: (state) => {
      state.profile = null;
      state.selectedUser = null;
      state.profileError = null;
      state.loadingProfile = false;
      state.loadingPushToken = false;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loadingProfile = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        state.profileError = action.payload;
      })

      .addCase(updatePushToken.pending, (state) => {
        state.loadingPushToken = true;
        state.pushTokenError = null;
      })
      .addCase(updatePushToken.fulfilled, (state) => {
        state.loadingPushToken = false;
      })
      .addCase(updatePushToken.rejected, (state, action) => {
        state.loadingPushToken = false;
        state.pushTokenError = action.payload;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loadingProfile = true;
        state.profileError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.profile = {
          ...state.profile,
          ...action.payload,
        };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        state.profileError = action.payload;
      });
  },
});

export const { logout, setSelectedUser, clearSelectedUser } = userSlice.actions;
export const selectUser = (state) => state.user.profile;
export const selectSucursales = (state) => state.user.profile?.sucursales || [];
export const selectSectores = (state) => state.user.profile?.sectores || [];

export default userSlice.reducer;
