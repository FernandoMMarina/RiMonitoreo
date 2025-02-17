import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const API_URL = 'https://rosensteininstalaciones.com.ar/api';

// Utilidad para obtener y validar el token
const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró un token válido en AsyncStorage');
        }
        return token;
    } catch (error) {
        console.error('[getToken] Error:', error.message);
        throw error;
    }
};

// Thunk para obtener el perfil del usuario
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
        const token = await getToken();
        console.log('[fetchUserProfile] Token obtenido:', token);

      if (!token) {
        throw new Error('Token no encontrado');
      }

      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error('[fetchUserProfile] Error:', error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Thunk para actualizar el token en el backend
export const updatePushToken = createAsyncThunk(
  'user/updatePushToken',
  async (pushToken, { getState, rejectWithValue }) => {
    try {
        const token = await getToken();
      console.log("Pushhhhh- ",token);
      const { id: userId } = getState().user.profile;

      if (!token || !userId) {
        throw new Error('Token o ID de usuario no disponible');
      }

      const response = await axios.post(
        `${API_URL}/users/register-token`,
        { token: pushToken, userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[updatePushToken] Error:', error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Acción para actualizar la información del usuario
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (updatedData, { rejectWithValue }) => {
    try {
      const token = await getToken(); // Obtener token de AsyncStorage
      if (!token) {
        throw new Error('Token no encontrado');
      }

      const response = await axios.put(`${API_URL}/users/update`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }, // Incluir el token en los encabezados
      });

      return response.data;
    } catch (error) {
      console.error('[updateUserProfile] Error:', error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);


// Slice de usuario
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
        state.error = null;
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
        // Fetch User Profile
        .addCase(fetchUserProfile.pending, (state) => {
          state.loadingProfile = true;
          state.error = null;
        })
        .addCase(fetchUserProfile.fulfilled, (state, action) => {
          state.loadingProfile = false;
          state.profile = action.payload;
        })
        .addCase(fetchUserProfile.rejected, (state, action) => {
          state.loadingProfile = false;
          state.error = action.payload || 'Error al obtener el perfil del usuario';
        })
    
        // Update Push Token
        .addCase(updatePushToken.pending, (state) => {
          state.loadingPushToken = true;
          state.error = null;
        })
        .addCase(updatePushToken.fulfilled, (state) => {
          state.loadingPushToken = false;
        })
        .addCase(updatePushToken.rejected, (state, action) => {
          state.loadingPushToken = false;
          state.error = action.payload || 'Error al actualizar el token de notificaciones';
        })
    
        // Update User Profile
        .addCase(updateUserProfile.pending, (state) => {
          state.loadingProfile = true;
          state.error = null;
        })
        .addCase(updateUserProfile.fulfilled, (state, action) => {
          state.loadingProfile = false;
          state.profile = { ...state.profile, ...action.payload }; // Actualizar los datos del perfil
        })
        .addCase(updateUserProfile.rejected, (state, action) => {
          state.loadingProfile = false;
          state.error = action.payload || 'Error al actualizar el perfil del usuario';
        });
    },    
  });
  
  export const { logout,setSelectedUser, clearSelectedUser  } = userSlice.actions;
  
  export default userSlice.reducer;