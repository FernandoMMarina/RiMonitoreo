import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from './styles';
import * as Notifications from 'expo-notifications';
import { Asset } from 'expo-asset';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';
const logo = Asset.fromModule(require('./logo.png')).uri;

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [loading, setLoading] = useState(false);

  const registerForPushNotificationsAsync = async () => {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('No se obtuvieron permisos para notificaciones push.');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Push Token:", token);
    return token;
  };

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: data.email.toLowerCase(),
        password: data.password,
      });

      if (response.status === 200) {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await axios.put(`${API_URL}/users/push-token`, {
            pushToken,
          }, {
            headers: { Authorization: `Bearer ${response.data.accessToken}` },
          });
          await AsyncStorage.setItem('pushToken', pushToken);
        }

        await AsyncStorage.setItem('token', response.data.accessToken);
        navigation.navigate('HomeScreen');
      }
    } catch (error) {
      alert('Error al iniciar sesión. Verifica tus credenciales.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
      <Image source={{ uri: logo }} style={styles.tinyLogo} />
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
