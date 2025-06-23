import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useForm, Controller } from 'react-hook-form';
import { useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import styles from './styles';

export default function NewUserScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [routes] = useState([
    { key: 'access', title: 'Datos de Acceso' },
    { key: 'info', title: 'Información Adicional' },
    { key: 'summary', title: 'Resumen' },
  ]);

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
      email: '',
      role: 'user',
      gender: 'male',
      team: '',
      empresa: '',
      cuit: '',
      razonSocial: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
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
      Alert.alert('Éxito', 'Usuario creado correctamente');
      reset();
      setIndex(0);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo crear el usuario. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResumenErrores = (data) => {
    const errores = [];
    if (!data.username) errores.push('Falta el nombre de usuario');
    if (!data.email) errores.push('Falta el email');
    if (!data.password || data.password.length < 8)
      errores.push('La contraseña es muy corta');
    if (!data.gender) errores.push('Falta el género');

    if (data.role === 'user') {
      if (!data.empresa) errores.push('Falta la empresa');
      if (!data.cuit) errores.push('Falta el CUIT');
      if (!data.razonSocial) errores.push('Falta la razón social');
    }

    if (data.role === 'technical') {
      if (!data.team) errores.push('Falta el equipo asignado');
    }

    return errores;
  };

  const AccessTab = () => (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: 100 }]}>
      <Text style={styles.label}>Nombre de Usuario*</Text>
      <Controller
        control={control}
        name="username"
        rules={{ required: 'Nombre de usuario requerido' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

      <Text style={styles.label}>Email*</Text>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email requerido',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Formato de email inválido',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Text style={styles.label}>Contraseña*</Text>
      <Controller
        control={control}
        name="password"
        rules={{
          required: 'Contraseña requerida',
          minLength: { value: 8, message: 'Mínimo 8 caracteres' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Text style={styles.label}>Género</Text>
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

  const InfoTab = () => {
    const { role } = getValues();
    return (
      <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: 100 }]}>
        {role === 'user' && (
          <>
            <Text style={styles.label}>Empresa*</Text>
            <Controller
              control={control}
              name="empresa"
              rules={{ required: 'Empresa requerida' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Empresa"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.empresa && <Text style={styles.error}>{errors.empresa.message}</Text>}

            <Text style={styles.label}>CUIT*</Text>
            <Controller
              control={control}
              name="cuit"
              rules={{
                required: 'CUIT requerido',
                minLength: { value: 11, message: 'CUIT inválido' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="CUIT"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.cuit && <Text style={styles.error}>{errors.cuit.message}</Text>}

            <Text style={styles.label}>Razón Social*</Text>
            <Controller
              control={control}
              name="razonSocial"
              rules={{ required: 'Razón Social requerida' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Razón Social"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.razonSocial && <Text style={styles.error}>{errors.razonSocial.message}</Text>}
          </>
        )}

        {role === 'technical' && (
          <>
            <Text style={styles.label}>Equipo*</Text>
            <Controller
              control={control}
              name="team"
              rules={{ required: 'Equipo requerido' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Equipo"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.team && <Text style={styles.error}>{errors.team.message}</Text>}
          </>
        )}
      </ScrollView>
    );
  };

  const ResumenTab = () => {
    const data = getValues();
    const errores = getResumenErrores(data);

    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        {errores.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Faltan datos:</Text>
            {errores.map((err, index) => (
              <Text key={index} style={{ color: 'red' }}>• {err}</Text>
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
          <Text><Text style={styles.label}>Equipo:</Text> {data.team}</Text>
        )}
      </ScrollView>
    );
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'access':
        return <AccessTab />;
      case 'info':
        return <InfoTab />;
      case 'summary':
        return <ResumenTab />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#fff' }}
            style={{ backgroundColor: '#1D1936' }}
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
          />
        )}
      />

      {index === 2 && (
        <TouchableOpacity
          style={[styles.button]}
         onPress={handleSubmit(onSubmit, (formErrors) => {
          console.log('Errores del formulario:', formErrors);
          Alert.alert('Formulario inválido', 'Revisá los campos requeridos.');
        })}
          disabled={isSubmitting}
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
