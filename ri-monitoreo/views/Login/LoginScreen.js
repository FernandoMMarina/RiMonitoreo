import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import styles from './styles';

import { loginUser } from '../../utils/authService'; // 👈 importación del servicio

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      await loginUser(data, dispatch); // 👈 usa el servicio centralizado
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Credenciales incorrectas. Inténtalo nuevamente.');
      } else if (error.response?.status === 403) {
        alert('Acceso denegado. Verifica tu cuenta.');
      } else {
        alert('Error al iniciar sesión. Intenta más tarde.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image source={require('./logo.png')} style={styles.tinyLogo} />
        <Text style={{ color: "#FFF", fontSize: 28, margin: 10 }}>
          Rosenstein Instalaciones
        </Text>

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
              keyboardType="email-address"
              autoCapitalize="none"
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
          <TouchableOpacity
            style={styles.loginScreenButton}
            onPress={handleSubmit(handleLogin)}
          >
            <Text style={styles.loginText}>Ingresar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
