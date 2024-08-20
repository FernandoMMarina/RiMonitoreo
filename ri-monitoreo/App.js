import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnimatedSplash from "react-native-animated-splash-screen";
import HomeScreen from "./views/HomeScreen";
import LoginScreen from './views/LoginScreen';
import NewUserScreen from './views/NewUserScreen'
import NewAirScreen from './views/NewAirScreen'
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlusButtonWithMenu from './views/PlusButtonWithMenu';
import { MenuProvider } from 'react-native-popup-menu';


const Stack = createNativeStackNavigator();



export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        console.log('Token:', token); // Verificar si el token está presente
        if (token) {
          console.log(useState(isLoaded))
          setIsAuthenticated(true); // Si existe un token, el usuario está autenticado
        } else {
          setIsAuthenticated(false); // Si no existe, no está autenticado
        }
      } catch (error) {
        console.error("Error checking auth token", error);
        setIsAuthenticated(false);
      } finally {
        setTimeout(() => setIsLoaded(true), 3000); // Tiempo de espera para el splash screen
      }
    };

    checkAuth();
  }, []);

  const LoadingScreen = () => {
    return null;
  };
  
  return (
    <MenuProvider>
          <AnimatedSplash
          isLoaded={isLoaded}
          logoImage={require('./logo.png')}
          backgroundColor={"#1D1936"}
          logoHeight={150}
          logoWidth={150}
        >
          <NavigationContainer>
            <Stack.Navigator>
              {isAuthenticated === null ? (
                // Mientras se verifica la autenticación, no se muestra ninguna pantalla
                <Stack.Screen
                name="Loading"
                component={LoadingScreen}
                options={{ headerShown: false }}
              />
              ) : isAuthenticated ? (
                // Si está autenticado, mostrar HomeScreen
                <Stack.Screen
                  name="HomeScreen"
                  component={HomeScreen}
                  options={{ 
                    headerBackTitle:"Inicio",
                    headerShown: true,
                    headerTitle:"Rosenstein Instalaciones",
                    headerRight: () => <PlusButtonWithMenu />,
                    headerSearchBarOptions: {
                      placeholder: "Clientes",
                      color: "#161616",
                      onChangeText: (event) => {
              
                      },
                    },
                  }}
                />
              ) : (
                // Si no está autenticado, mostrar LoginScreen
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
                  headerTitle:"Nuevo Cliente",
                }}
              />
              <Stack.Screen
                name="NewAirScreen"
                component={NewAirScreen}
                options={{ 
                  headerTitle:"Nuevo Aire",
                  headerShown: true,
                }}
              />
               <Stack.Screen
                  name="HomeScreen"
                  component={HomeScreen}
                  options={{ 
                    headerBackTitle:"Inicio",
                    headerShown: true,
                    headerTitle:"Rosenstein Instalaciones",
                    headerRight: () => <PlusButtonWithMenu />,
                    headerSearchBarOptions: {
                      placeholder: "Clientes",
                      color: "#161616",
                      onChangeText: (event) => {
              
                      },
                    },
                  }}
                />


            </Stack.Navigator>
          </NavigationContainer>
        </AnimatedSplash>
    </MenuProvider>
  );
}

export const styles = StyleSheet.create({
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
  }, container: {
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
