import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useForm, Controller } from 'react-hook-form';
import { useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from "@react-native-picker/picker";
import styles from './styles';

export default function NewUserScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [resumenErrores, setResumenErrores] = useState([]);

  const [routes] = useState([
    { key: 'access', title: 'Datos de Acceso' },
    { key: 'info', title: 'Información Adicional' },
    { key: 'summary', title: 'Resumen' },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: '',
      email: '',
      role: 'user',
      gender: 'male',
      team: '',
      empresa: '',
      cuit: '',
      razonSocial: ''
    }
  });

  const role = watch('role');

  useEffect(() => {
    const subscription = watch((data) => {
      const errores = getResumenErrores(data);
      setResumenErrores(errores);
    });
  
    return () => subscription.unsubscribe();
  }, [watch]);
  

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'https://rosensteininstalaciones.com.ar/api/users/register',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert("Éxito", "Usuario creado correctamente");
      setIndex(0);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert("Error", "No se pudo crear el usuario. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const AccessTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.label}>Nombre de Usuario*</Text>
      <Controller
        control={control}
        name="username"
        rules={{ required: true }}
        render={({ field }) => (
          <TextInput style={styles.input} placeholder="Username" {...field} />
        )}
      />
      {errors.username && <Text style={styles.error}>Username requerido</Text>}
        <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        rules={{ required: true }}
        render={({ field }) => (
          <TextInput style={styles.input} placeholder="Email" {...field} />
        )}
      />
      {errors.email && <Text style={styles.error}>Email requerido</Text>}
        <Text style={styles.label}>Contraseña</Text>
      <Controller
        control={control}
        name="password"
        rules={{ required: true, minLength: 8 }}
        render={({ field }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            {...field}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>Password mínimo 8 caracteres</Text>}
       
      <Text style={styles.label}>Genero</Text>
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.input}
              dropdownIconColor="#1D1936"
            >
              <Picker.Item label="Masculino" value="male" />
              <Picker.Item label="Femenino" value="female" />
            </Picker>
          )}
        />
    </ScrollView>
  );

  const InfoTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
     
      {role === 'user' && (
        <>
        <Text style={styles.label}>Empresa*</Text>
          <Controller
            control={control}
            name="empresa"
            render={({ field }) => (
              <TextInput style={styles.input} placeholder="Empresa" {...field} />
            )}
          />
          <Text style={styles.label}>Cuit*</Text>
          <Controller
            control={control}
            name="cuit"
            render={({ field }) => (
              <TextInput style={styles.input} placeholder="CUIT" {...field} />
            )}
          />
          <Text style={styles.label}>Razón Social*</Text>
          <Controller
            control={control}
            name="razonSocial"
            render={({ field }) => (
              <TextInput style={styles.input} placeholder="Razón Social" {...field} />
            )}
          />
        </>
      )}
    </ScrollView>
  );

  const getResumenErrores = (data) => {
    const errores = [];
  
    if (!data.username) errores.push("Falta el nombre de usuario");
    if (!data.email) errores.push("Falta el email");
    if (!data.password || data.password.length < 8) errores.push("La contraseña es muy corta");
    if (!data.gender) errores.push("Falta el género");
  
    if (data.role === 'user') {
      if (!data.empresa) errores.push("Falta la empresa");
      if (!data.cuit) errores.push("Falta el CUIT");
      if (!data.razonSocial) errores.push("Falta la razón social");
    }
  
    if (data.role === 'technical') {
      if (!data.team) errores.push("Falta el equipo asignado");
    }
  
    return errores;
  };
  

  const ResumenTab = () => {
    const data = watch(); // datos actuales
    const errores = getResumenErrores(data);
  
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        {errores.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "red", fontWeight: "bold" }}>⚠️ Faltan datos:</Text>
            {errores.map((err, index) => (
              <Text key={index} style={{ color: "red" }}>• {err}</Text>
            ))}
          </View>
        )}
  
        <Text style={styles.label}>Resumen del Usuario</Text>
        <Text><Text style={styles.label}>Usuario:</Text> {data.username}</Text>
        <Text><Text style={styles.label}>Email:</Text> {data.email}</Text>
        <Text><Text style={styles.label}>Contraseña:</Text> {data.password ? '********' : ''}</Text>
        <Text><Text style={styles.label}>Género:</Text> {data.gender}</Text>
        <Text><Text style={styles.label}>Rol:</Text> {data.role}</Text>
  
        {data.role === 'user' && (
          <>
            <Text><Text style={styles.label}>Empresa:</Text> {data.empresa}</Text>
            <Text><Text style={styles.label}>CUIT:</Text> {data.cuit}</Text>
            <Text><Text style={styles.label}>Razón Social:</Text> {data.razonSocial}</Text>
          </>
        )}
  
        {data.role === 'technical' && (
          <Text><Text style={styles.label}>Team:</Text> {data.team}</Text>
        )}
      </ScrollView>
    );
  };
  
  const renderScene = SceneMap({
    access: AccessTab,
    info: InfoTab,
    summary: ResumenTab,
  });
  
  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width  }}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#fff' }}
            style={{ backgroundColor: '#1D1936'}}
            labelStyle={{ color: '#1D1936', fontWeight: 'bold' }}
          />
        )}
      />

{index === 2 && (
  <TouchableOpacity
    style={[styles.button, resumenErrores.length > 0 && { opacity: 0.5 }]}
    onPress={handleSubmit(onSubmit)}
    disabled={resumenErrores.length > 0 || isSubmitting}
  >
    {isSubmitting ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.buttonText}>Crear Usuario</Text>
    )}
  </TouchableOpacity>
)}

    </View>
  );
}