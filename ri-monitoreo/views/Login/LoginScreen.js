import React from 'react';
import { Text, View, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import styles from './styles';

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const handleLogin = async (data) => {
    try {
      const url = "http://ec2-50-16-74-81.compute-1.amazonaws.com:5000/api/users/login";
  
      const response = await axios.post(url, {
        username: data.username,
        password: data.password
      }, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      });
  
      if (response.status === 200) {
        console.log("Response data:", response.data.accessToken); // Para ver el contenido completo de la respuesta
        await AsyncStorage.setItem('token', response.data.accessToken);
        console.log("Token guardado:", response.data.accessToken);
        navigation.navigate('HomeScreen');
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
      behavior={Platform.OS === "ios" ? "padding" : "height"} // "padding" para iOS, "height" para Android
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Ajusta según sea necesario
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image
          style={styles.tinyLogo}
          source={require('../Login/logo.png')}
        />
        <Text style={{ color: "#FFF", fontSize: 18, margin: 10 }}>Rosenstein Instalaciones</Text>

        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Username"
              placeholderTextColor="#666"
            />
          )}
          name="username"
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
