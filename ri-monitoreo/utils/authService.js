import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { navigationRef } from '../utils/navigationRef';
import jwtDecode from 'jwt-decode';
import { loginSuccess, logoutSuccess } from '../redux/slices/authSlice'; // 👈

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

export const loginUser = async (credentials, dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    const { accessToken, refreshToken, user } = response.data;

    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);

    dispatch(loginSuccess(user)); // 👈 usar acción del slice

    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    }
  } catch (error) {
    console.error('[LOGIN ERROR]', error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = async (dispatch) => {
  try {
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'token',
      'pushToken',
    ]);
    console.log('[LOGOUT] Tokens eliminados');

    dispatch(logoutSuccess()); // 👈 usar acción del slice

    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    }
  } catch (error) {
    console.error('Error en logout:', error);
  }
};

export const checkAuthToken = async (dispatch) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      dispatch(logoutSuccess());
      return false;
    }

    const decoded = jwtDecode(accessToken);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      console.log('[AUTH] Token expirado');
      await logoutUser(dispatch);
      return false;
    }

    dispatch(loginSuccess(decoded)); // 👈 usar acción del slice
    return true;
  } catch (error) {
    console.error('[CHECK TOKEN ERROR]', error);
    await logoutUser(dispatch);
    return false;
  }
};
