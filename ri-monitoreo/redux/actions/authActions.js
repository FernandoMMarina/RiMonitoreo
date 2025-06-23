import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { navigationRef } from '../../utils/navigationRef'; 
import jwtDecode from 'jwt-decode';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

export const loginUser = async (credentials, dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { accessToken, refreshToken, user } = response.data;

    // Guardar tokens
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);

    dispatch({ type: 'LOGIN_SUCCESS', payload: user });

    // Redirigir a Home
    if (navigationRef.isReady()) {
        console.log(navigationRef.getRootState());
      navigationRef.reset({
  index: 0,
  routes: [{ 
    name: 'HomeScreen', 
    params: { initialTab: 'Rosenisten Instalaciones - Inicio' } 
  }],
});

    }

  } catch (error) {
    console.error('[LOGIN ERROR]', error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = async (dispatch) => {
  try {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'token', 'pushToken']);
    console.log('[LOGOUT] Tokens eliminados');

    dispatch({ type: 'LOGOUT_SUCCESS' });

    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } else {
      console.warn('navigationRef no está listo');
    }
  } catch (error) {
    console.error('Error en logout:', error);
  }
};

// ✅ Verifica si el accessToken es válido al iniciar la app
export const checkAuthToken = async (dispatch) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      dispatch({ type: 'LOGOUT_SUCCESS' });
      return false;
    }

    const decoded = jwtDecode(accessToken);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      console.log('[AUTH] Token expirado');
      await logoutUser(dispatch);
      return false;
    }

    // Token válido
    dispatch({ type: 'LOGIN_SUCCESS', payload: decoded }); // opcional
    return true;

  } catch (error) {
    console.error('[CHECK TOKEN ERROR]', error);
    await logoutUser(dispatch);
    return false;
  }
};
