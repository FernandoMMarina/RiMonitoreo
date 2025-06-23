import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AnimatedSplash from "react-native-animated-splash-screen";
import { MenuProvider } from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import * as Notifications from 'expo-notifications';
import { Provider as PaperProvider } from 'react-native-paper';
import axios from 'axios';
import { checkStoredToken } from './redux/slices/authSlice';

import AppNavigator from './AppNavigator';
import { setAuthenticated } from './redux/slices/userSlice'; // o authSlice si usás uno separado

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

export default function MainApp() {
  const [isLoaded, setIsLoaded] = useState(true);
  const [userId, setUserId] = useState("");
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated); // o auth si usás authSlice

  // Configuración de notificaciones
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const handleNotification = (notification) => {
    const newNotification = {
      id: notification.request.identifier || Date.now().toString(),
      title: notification.request.content.title,
      body: notification.request.content.body,
      read: false,
    };
    saveNotification(newNotification);
  };

  const saveNotification = async (notification) => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      const notificationsArray = storedNotifications ? JSON.parse(storedNotifications) : [];
      notificationsArray.unshift(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notificationsArray));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  useEffect(() => {
    const foregroundSubscription = Notifications.addNotificationReceivedListener(handleNotification);
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const notification = response.notification.request.content;
      handleNotification({ request: { content: notification } });
    });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const debugAsyncStorage = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      console.log("📦 AsyncStorage:");
      stores.forEach(([key, value]) => {
        console.log(`- ${key}: ${value}`);
      });
    };
    debugAsyncStorage();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          const response = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("📋 ID usuario:", response.data.id);
          setUserId(response.data.id);
        } else {
          console.log('❌ Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('⚠️ Error al obtener el perfil:', error);
      }
    };
    fetchUser();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permisos de notificaciones denegados');
      return;
    }

    const tokenNoti = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("📲 Push token:", tokenNoti);
    await sendTokenToBackend(tokenNoti);
    return tokenNoti;
  };

  const sendTokenToBackend = async (tokenNoti) => {
    try {
      const storedToken = await AsyncStorage.getItem('pushToken');
      if (storedToken === tokenNoti) {
        console.log('🔁 Token ya registrado.');
        return;
      }

      const response = await fetch(`${API_URL}/users/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenNoti, userId }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      await AsyncStorage.setItem('pushToken', tokenNoti);
      console.log('✅ Token enviado al backend:', await response.json());
    } catch (error) {
      console.error('❌ Error enviando el token:', error);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        console.log("✅ Token encontrado");
        dispatch(setAuthenticated(true));
      } else {
        console.log("🚫 No hay token");
        dispatch(setAuthenticated(false));
      }
    };

    checkToken();
  }, [dispatch]);

  useEffect(() => {
  dispatch(checkStoredToken());
}, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      registerForPushNotificationsAsync();
    }
  }, [isAuthenticated, userId]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <PaperProvider>
          <AnimatedSplash
            isLoaded={isLoaded}
            logoImage={require('./assets/logo.png')}
            backgroundColor={"#1D1936"}
            logoHeight={150}
            logoWidth={150}
          >
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AnimatedSplash>
        </PaperProvider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}
