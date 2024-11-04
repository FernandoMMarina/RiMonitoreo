import React from 'react';
import { Text, View, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from './styles';
import Constants from 'expo-constants';

const API_URL = 'http://ec2-44-211-67-52.compute-1.amazonaws.com:5000/api';

import * as Notifications from 'expo-notifications';

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Nueva función para registrar el token de notificación
  const registerForPushNotificationsAsync = async () => {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notifications!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  };

  // Modificación del handleLogin para incluir el envío del pushToken
  const handleLogin = async (data) => {
    try {
      const url = `${API_URL}/users/login`;
      console.log("url completa : " + url)
      const response = await axios.post(url, {
        email: data.email,
        password: data.password
      }, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        const pushToken = await registerForPushNotificationsAsync(); // Obtén el pushToken

        // Enviar pushToken al backend
        if (pushToken) {
          await axios.put(`${API_URL}/users/push-token`, {
            pushToken: pushToken
          }, {
            headers: {
              Authorization: `Bearer ${response.data.accessToken}` // Agrega el token de autenticación
            }
          });
        }

        navigation.navigate('HomeScreen');
        await AsyncStorage.setItem('token', response.data.accessToken);
        console.log("Login successful");
      } 
      else {
        console.log("Login failed");
        alert("Error en el inicio de sesión. Por favor, verifica tus credenciales.");
      }
    } catch (error) {
      console.error("Login error", error);
      alert("Hubo un error al intentar iniciar sesión. Por favor, intenta de nuevo más tarde.");
    }
  };

  const onSubmit = (data) => {
    handleLogin(data);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image style={styles.tinyLogo} source={require('../Login/logo.png')} />
        <Text style={{ color: "#FFF", fontSize: 28, margin: 10 }}>Rosenstein Instalaciones</Text>

        <Controller
          control={control}
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
          name="email"
          rules={{ required: true }}
        />
        {errors.username && <Text style={styles.errorText}>Username is required</Text>}

        <Controller
          control={control}
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
          name="password"
          rules={{ required: true }}
        />
        {errors.password && <Text style={styles.errorText}>Password is required</Text>}

        <TouchableOpacity
          style={styles.loginScreenButton}
          onPress={handleSubmit(onSubmit)}
          underlayColor='#fff'>
          <Text style={styles.loginText}>Ingresar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

