import React from 'react';
import { Text, View, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
          source={require('../logo.png')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D1936',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight,
    paddingHorizontal: 20,
    padding: 8,
    backgroundColor: '#1D1936',
  },
  errorText: {
    color: 'red',
    marginLeft: 20,
  },
  input: {
    width: "80%",
    backgroundColor: 'white',
    height: 40,
    padding: 8,
    borderRadius: 4,
    margin: 15,
  },
  tinyLogo: {
    marginTop: 0,
    width: 200,
    height: 200,
  },
  loginScreenButton: {
    width: "40%",
    marginRight: 40,
    marginLeft: 40,
    marginTop: 30,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#161616',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#161616',
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  }
});
