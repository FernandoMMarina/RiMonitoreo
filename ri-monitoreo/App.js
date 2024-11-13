import React, { useState, useEffect } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnimatedSplash from "react-native-animated-splash-screen";
import { MenuProvider } from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from "./views/Home/HomeScreen";
import LoginScreen from './views/Login/LoginScreen';
import NewUserScreen from './views/NewUser/NewUserScreen';
import NewAirScreen from './views/NewAir/NewAirScreen';
import PlusButtonWithMenu from './views/PlusButtonWithMenu';
import MachineDetailsScreen from './views/MachineDetails/MachineDetailsScreen';
import NewMaintence from './views/NewMaintence/NewMaintence';
import MachinesList from './views/MachineList/MachineList';
import OrdersList from './views/OrdersList/OrdersList.js';
import NotificationView from './views/NotificationView/NotificationView.js';
import WorkDetailsScreen from './views/WorkDetails/WorkDetailsScreen.js';


import axios from 'axios';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const Stack = createNativeStackNavigator();
const API_URL = 'http://ec2-44-211-67-52.compute-1.amazonaws.com:5000/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("Respuesta App" + JSON.stringify(response.data.id));
          setUserId(response.data.id);
        } else {
          console.log('Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
      }
    };
    fetchUser();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('Permisos de notificaciones:', status);
    if (status !== 'granted') {
      alert('Failed to get push token for push notifications!');
      return;
    }
    const tokenNoti = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Notification push token:", tokenNoti);
    await sendTokenToBackend(tokenNoti);
    return tokenNoti;
  };

  const sendTokenToBackend = async (tokenNoti) => {
    if (!userId) {
      console.error('El ID del usuario no está definido.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenNoti, userId }),
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }

      const data = await response.json();
      console.log('Token enviado al backend:', data);
    } catch (error) {
      console.error('Error enviando el token al backend:', error);
    }
  };

  // Verifica autenticación y ejecuta la notificación push solo si está autenticado y userId está definido
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        console.log('Token:', token);
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("Error checking auth token", error);
        setIsAuthenticated(false);
      } finally {
        setTimeout(() => setIsLoaded(true), 3000);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      registerForPushNotificationsAsync();
    }
  }, [isAuthenticated, userId]);

  const LoadingScreen = () => null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <AnimatedSplash
          isLoaded={isLoaded}
          logoImage={require('./views/Login/logo.png')}
          backgroundColor={"#1D1936"}
          logoHeight={150}
          logoWidth={150}
        >
          <NavigationContainer>
            <Stack.Navigator>
              {isAuthenticated === null ? (
                <Stack.Screen
                  name="Loading"
                  component={LoadingScreen}
                  options={{ headerShown: false }}
                />
              ) : isAuthenticated ? (
                <Stack.Screen
                  name="HomeScreen"
                  component={HomeScreen}
                  options={{
                    headerBackTitle: "Inicio",
                    headerShown: true,
                    headerBackVisible: false,
                    headerBackTitleVisible: false,
                    headerTitle: "Rosenstein Instalaciones",
                    headerRight: () => <PlusButtonWithMenu />,
                  }}
                />
              ) : (
                <Stack.Screen
                  name="LoginScreen"
                  component={LoginScreen}
                  options={{ headerShown: false }}
                />
              )}
              <Stack.Screen
                name="NewUserScreen"
                component={NewUserScreen}
                options={{
                  headerShown: true,
                  headerTitle: "Nuevo Cliente",
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen
                name="NewAirScreen"
                component={NewAirScreen}
                options={{
                  headerTitle: "Nuevo Aire",
                  headerShown: true,
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen
                name="MachineDetails"
                component={MachineDetailsScreen}
                options={{
                  headerTitle: "Detalles del Equipo",
                  headerShown: true,
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen
                name="NewMaintence"
                component={NewMaintence}
                options={{
                  headerTitle: "Nuevo Mantenimiento de Aire",
                  headerShown: true,
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{
                  headerBackTitle: "Inicio",
                  headerShown: true,
                  headerBackVisible: false,
                  headerBackTitleVisible: false,
                  headerTitle: "Rosenstein Instalaciones",
                  headerRight: () => <PlusButtonWithMenu />,
                }}
              />
              <Stack.Screen
                name="MachinesList"
                component={MachinesList}
                options={{
                  headerTitle: "Todas mis maquinas",
                  headerShown: true,
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen
                name="NotificationView"
                component={NotificationView}
                options={{
                  headerTitle: "Menu Notificaciones",
                  headerShown: true,
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen
                name="OrdersList"
                component={OrdersList}
                options={{
                  headerTitle: "Hoja de Trabajo",
                  headerShown: true,
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen
                name="DetallesTrabajo"
                component={WorkDetailsScreen} // Vista detallada del trabajo
                options={{ headerTitle: "Detalles del Trabajo" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AnimatedSplash>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  shawdow: {
    shadowColor: '#DDDDDD',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomBar: {},
  btnCircleUp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },
  imgCircle: {
    width: 30,
    height: 30,
    tintColor: 'gray',
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: 30,
    height: 30,
  },
  screen1: {
    flex: 1,
    backgroundColor: '#BFEFFF',
  },
  screen2: {
    flex: 1,
    backgroundColor: '#FFEBCD',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#10232A',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#3D4D55',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#fff',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
