import React, { useState, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
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
import NotificationView2 from './views/NotificationView2/NotificationView2.js';
import WorkDetailsScreen from './views/WorkDetails/WorkDetailsScreen.js';
import ClientMachines from './views/ClientMachines/ClientMachines.js';
import MachineListScreen from './views/MachineListScreen/MachineListScreen';
import CotizationForm from './views/CotizationForm/CotizationForm.js';

import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { Provider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
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
      MachineDetails: "machine/:serialNumber", // Ruta dinámica con serialNumber
    },
  },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState("");


  // Manejo del deep linking
  const handleDeepLink = async (url, navigation) => {
    if (!url) {
      Alert.alert('Error', 'No se recibió una URL de deep linking.');
      return;
    }
  
    // Verifica que la URL tenga el formato correcto
    if (!url.startsWith('rosenstein://')) {
      Alert.alert('Error', 'URL de deep linking no válida.');
      return;
    }
  
    // Elimina el prefijo "rosenstein://"
    const route = url.replace('rosenstein://', '');
  
    // Divide la ruta en partes
    const routeParts = route.split('/');
  
    // Verifica que la ruta tenga el formato correcto: "machine/<serialNumber>"
    if (routeParts.length !== 2 || routeParts[0] !== 'machine' || !routeParts[1]) {
      Alert.alert('Error', 'URL de deep linking no válida.');
      return;
    }
  
    const serialNumber = routeParts[1]; // Obtiene el número de serie
  
    // Navega a la pantalla de detalles de la máquina con el número de serie
    navigation.navigate('MachineDetails', { serialNumber });
  };

    // Solicitar permisos de notificaciones
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos denegados', 'No se pueden mostrar notificaciones sin permisos.');
      }
    };
  
    // Configurar el manejador de notificaciones
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  
    // Escuchar notificaciones
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
  // Cargar notificaciones al iniciar
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem('notifications');
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    loadNotifications();
  }, []);

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
      <PaperProvider>
        <Provider store={store}>
          <AnimatedSplash
            isLoaded={isLoaded}
            logoImage={require('./assets/logo.png')}
            backgroundColor={"#1D1936"}
            logoHeight={150}
            logoWidth={150}
          >
            <NavigationContainer
                  linking={linking}
                  onReady={() => {
                    // Maneja el deep linking cuando la navegación está lista
                    Linking.getInitialURL().then((url) => {
                      if (url) {
                        handleDeepLink(url, navigation);
                      }
                    });
                  }}
                  onStateChange={(state) => {
                    // Maneja el deep linking cuando cambia el estado de la navegación
                    const route = state?.routes[state.index];
                    if (route?.params?.url) {
                      handleDeepLink(route.params.url, navigation);
                    }
                  }}
                >
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
                      headerRight: () => <PlusButtonWithMenu />,
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
                    headerRight: () => <PlusButtonWithMenu />,
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
                  name="NotificationView2"
                  component={NotificationView2}
                  initialParams={{ userId }} // Pasa el userId como prop
                  options={{
                    headerTitle: "Notificaciones",
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
                <Stack.Screen
                  name="CotizationForm"
                  component={CotizationForm}
                  options={{ headerTitle: "Cotizacion" }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </AnimatedSplash>
        </Provider>
        </PaperProvider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}