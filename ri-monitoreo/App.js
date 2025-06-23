import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import AnimatedSplash from "react-native-animated-splash-screen";
import store from './redux/store';
import AppNavigator from './AppNavigator';
import { checkAuthToken } from './utils/authService';


export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Mostrar contenido del AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      console.log("📦 AsyncStorage:");
      stores.forEach(([key, value]) => {
        console.log(`- ${key}: ${value}`);
      });

      // Verificar token
      await checkAuthToken(store.dispatch);

      // Simular carga con Splash
      setTimeout(() => setIsLoaded(true), 2000);
    };

    init();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos denegados', 'No se pueden mostrar notificaciones sin permisos.');
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    };

    setupNotifications();
  }, []);

  return (
    <Provider store={store}>
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
              <AppNavigator />
            </AnimatedSplash>
          </PaperProvider>
        </MenuProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
