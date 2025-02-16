import React, { useState, useEffect } from 'react';
import {
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
import ClientMachines from './views/ClientMachines/ClientMachines.js';
import MachineListScreen from './views/MachineListScreen/MachineListScreen';

import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import MachineSearchComponent from './views/MachineSearchComponent/machineSearchComponent.js';



const Stack = createNativeStackNavigator();
const API_URL = 'https://rosensteininstalaciones.com.ar/api';

// Configuración de linking
const linking = {
  prefixes: ["rosenstein://"], // Prefijos de deep link
  config: {
    screens: {
      HomeScreen: "",
      MachineDetails: "machine/:id", // Ruta dinámica con serialNumber
    },
  },
};

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
    try {
      const storedToken = await AsyncStorage.getItem('pushToken');
      if (storedToken === tokenNoti) {
        console.log('El token ya está registrado en el backend.');
        return;
      }
  
      const response = await fetch(`${API_URL}/users/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenNoti, userId }),
      });
  
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
  
      await AsyncStorage.setItem('pushToken', tokenNoti); // Guarda el token para evitar redundancia
      console.log('Token enviado al backend:', await response.json());
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
      <Provider store={store}>
        <AnimatedSplash
          isLoaded={isLoaded}
          logoImage={require('./assets/logo.png')}
          backgroundColor={"#1D1936"}
          logoHeight={150}
          logoWidth={150}
        >
          <NavigationContainer linking={linking}>
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
                    headerRight: () => <PlusButtonWithMenu/>,
                    headerRightContainerStyle: {
                      paddingRight: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                    headerShown: false,
                    headerBackVisible: false,
                    headerBackTitleVisible: false,
                    headerTitle: "Rosenstein Instalaciones",
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
                  headerTitle: "Nuevo Maquina",
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
                  headerTitle: "Nuevo Mantenimiento ",
                  headerShown: true,
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{
                  headerBackTitle: "Inicio",
                  headerStyle: {
                    backgroundColor: '#ffffff', // Color de fondo del encabezado
                    alignItems: 'flex-start', // Evita centrar elementos del header
                  },
                  headerTitleStyle: {
                    alignSelf: 'flex-start', // Alinea el título hacia la izquierda
                  },
                  headerRight: () => <PlusButtonWithMenu/>,
                  headerRightContainerStyle: {
                    paddingRight: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  headerRightContainerStyle: {
                    paddingRight: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  headerShown: true,
                  headerBackVisible: false,
                  headerBackTitleVisible: false,
                  headerTitle: "Rosenstein Instalaciones",
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
              <Stack.Screen 
              name="ClientMachines" 
              component={ClientMachines}
              options={{ title: 'Máquinas del Cliente' }}
               />
               <Stack.Screen
                name="MachineListScreen"
                component={MachineListScreen}
                options={{ headerTitle: "Lista de Máquinas" }}
              />
              <Stack.Screen
                name="AsignarQR"
                component={MachineSearchComponent}
                options={{ headerTitle: "Asignar QR" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AnimatedSplash>
        </Provider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}

