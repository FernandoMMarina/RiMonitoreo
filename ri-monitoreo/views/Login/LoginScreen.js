import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from './styles';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [loading, setLoading] = useState(false);

  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      alert('Debe usar un dispositivo físico para las notificaciones push.');
      return null;
    }
  
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
  
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  
    if (finalStatus !== 'granted') {
      alert('No se otorgaron permisos para recibir notificaciones push.');
      return null;
    }
  
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);

      return token;
    } catch (error) {
      console.error('Error obteniendo el token de Expo:', error);
      return null;
    }
  };

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      // Solicitud al servidor
      const response = await axios.post(`${API_URL}/users/login`, {
        email: data.email.toLowerCase(),
        password: data.password,
      });
  
      if (response.status === 200) {
        const { accessToken } = response.data;
  
        // Registrar token de notificaciones
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          try {
            await axios.put(
              `${API_URL}/users/push-token`,
              { pushToken },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            await AsyncStorage.setItem('pushToken', pushToken);
          } catch (pushError) {
            console.error('Error al registrar el token de notificaciones:', pushError);
          }
        }
        await AsyncStorage.setItem('token2', response.data.accessToken);
        console.log('Token almacenado2:', response.data.accessToken);

        // Guardar el token en AsyncStorage y navegar a la pantalla principal
        await AsyncStorage.setItem('token', accessToken);
        console.log('Token actual:', await AsyncStorage.getItem('token'));

        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeScreen' }],
        });
      }
    } catch (error) {
      // Mostrar diferentes mensajes dependiendo del error
      if (error.response?.status === 401) {
        alert('Credenciales incorrectas. Inténtalo nuevamente.');
      } else if (error.response?.status === 403) {
        alert('Acceso denegado. Por favor, verifica tu cuenta.');
      } else {
        alert('Error al iniciar sesión. Por favor, intenta más tarde.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Cambiado: El logo ahora se maneja con require directamente */}
        <Image source={require('./logo.png')} style={styles.tinyLogo} />
        <Text style={{ color: "#FFF", fontSize: 28, margin: 10 }}>Rosenstein Instalaciones</Text>

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'El email es obligatorio',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Introduce un email válido',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Email"
              placeholderTextColor="#666"
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Controller
          control={control}
          name="password"
          rules={{ required: 'La contraseña es obligatoria' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
            />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        {loading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : (
          <TouchableOpacity style={styles.loginScreenButton} onPress={handleSubmit(handleLogin)}>
            <Text style={styles.loginText}>Ingresar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
