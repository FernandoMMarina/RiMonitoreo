import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

const RegisterPushToken = () => {
  // Función para obtener el perfil del usuario y registrar el push token
  const registerPushToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado en AsyncStorage');
        return;
      }

      // Obtener perfil del usuario
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = response.data.id;

      // Registrar push token
      let pushToken = await AsyncStorage.getItem('pushToken');
      if (!pushToken) {
        pushToken = await getPushToken();
        await AsyncStorage.setItem('pushToken', pushToken);
      }

      // Enviar token al backend solo si cambia
      const responseBackend = await axios.post(`${API_URL}/users/register-token`, {
        userId,
        token: pushToken,
      });
      console.log('Push token registrado:', responseBackend.data);
    } catch (error) {
      console.error('Error durante el registro del push token:', error);
    }
  };

  // Función para obtener el push token
  const getPushToken = async () => {
    if (!Constants.isDevice) {
      Alert.alert('Debes usar un dispositivo físico para las notificaciones push.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('No se obtuvieron permisos para las notificaciones push.');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push Token obtenido:', token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  };

  useEffect(() => {
    registerPushToken();
  }, []);

  return null; // No renderiza nada
};

export default RegisterPushToken;
