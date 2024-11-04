import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://ec2-34-230-81-174.compute-1.amazonaws.com:5000/api'; // Cambia la URL según sea necesario

const RegisterPushToken = () => {
  const [userId, setUserId] = useState("");

  // Función para obtener los datos del perfil de usuario
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserId(response.data.userId);  // Establecer el userId en el estado
        
      } else {
        console.log('Token no encontrado en AsyncStorage');
      }
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  };

  // Función para registrar el token de notificaciones push
  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Push Token: ", token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

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

  // Función para guardar el token en el backend
  const savePushToken = async (userId, pushToken) => {
    try {
      const response = await axios.post(`${API_URL}/users/register-token`, {
        userId,
        token: pushToken,
      });
      console.log('Token registrado:', response.data);
    } catch (error) {
      console.error('Error al registrar el push token:', error);
    }
  };

  // Efecto para obtener el userId y luego registrar el push token
  useEffect(() => {
    const getPushTokenAndRegister = async () => {
      try {
        // Primero obtenemos el userId
        await fetchUser();
        
        // Solo intentamos registrar el token si tenemos el userId
        if (userId) {
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
            await savePushToken(userId, pushToken);
          }
        } else {
          console.error('No se encontró el userId. No se puede registrar el token.');
        }
      } catch (error) {
        console.error('Error al obtener el push token o al registrar:', error);
      }
    };

    getPushTokenAndRegister();
  }, [userId]);  // El efecto se vuelve a ejecutar cuando userId cambia

  return null;  // No renderiza nada en la interfaz, solo ejecuta el efecto
};

export default RegisterPushToken;
