import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../redux/slices/userSlice';
import { logoutUser } from '../../redux/actions/authActions'; 
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from '../../utils/navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutSuccess } from '../../redux/slices/authSlice'; // Asegurate de importar esto

import styles from './styles';

const Screen2 = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Obtener datos del estado global
  const { profile, loading, error } = useSelector((state) => state.user);
  const username = profile?.username || 'Usuario';
  const email = profile?.email || 'No disponible';
  const currentAddress = profile?.sucursal?.direccion || 'No disponible';
  const direccion = profile?.sucursal?.direccion || {};

  console.log("Direccion", direccion);

  console.log("Direcion-- ",profile )
  const currentPhone = profile?.telefono || 'No disponible';

  // Local state para el formulario
  const [address, setAddress] = useState(profile?.direccion || '');
  const [phone, setPhone] = useState(profile?.telefono || '');
  const [password, setPassword] = useState('');

  const handleUpdate = () => {
    if (!address || !phone || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    dispatch(updateUserProfile({ id: profile._id, direccion: address, telefono: phone, password }))
      .unwrap()
      .then(() => Alert.alert('Éxito', 'Perfil actualizado correctamente'))
      .catch((err) => Alert.alert('Error', err.message || 'Ocurrió un error'));
  };

  return (
    <ScrollView style={styles.screen2}>
      {/* Encabezado con círculo de iniciales */}
      <View style={styles.header}>
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{username.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.usernameText}>{username}</Text>
        <Text style={styles.infoText}>Email: {email}</Text>
      </View>

      {/* Formulario de edición */}
      <View style={styles.formContainer}>
      <Text style={styles.formLabel}>Sucursal:</Text>
      <Text style={styles.currentInfo}>
          {`${profile?.sucursales?.[0]?.nombre || 'No Disponible'} `}
        </Text>
          <Text style={styles.formLabel}>Dirección:</Text>
        {profile?.sucursales?.length > 0 ? (
          <Text style={styles.currentInfo}>
            {`${profile.sucursales[0].direccion.calle} ${profile.sucursales[0].direccion.numero}, ${profile.sucursales[0].direccion.ciudad}, ${profile.sucursales[0].direccion.provincia}, ${profile.sucursales[0].direccion.codigoPostal}`}
          </Text>
        ) : (
          <Text style={styles.currentInfo}>No disponible</Text>
        )}
        <Text style={styles.formLabel}>Nueva dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nueva dirección"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.formLabel}>Teléfono actual</Text>
        <Text style={styles.currentInfo}>{currentPhone}</Text>

        <Text style={styles.formLabel}>Nuevo teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nuevo teléfono"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.formLabel}>Nueva contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nueva contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Botón de guardar cambios */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>

        {/* Mostrar errores */}
        {error && <Text style={styles.errorText}>{error}</Text>}

       
<TouchableOpacity
  style={styles.logoutButton}
  onPress={async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      console.log("[LOGOUT] Tokens eliminados");

      dispatch(logoutSuccess()); // Vacía el estado en Redux

      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
      } else {
        console.warn("navigationRef no está listo");
      }
    } catch (error) {
      console.error("Error en logout:", error);
    }
  }}
>
  <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
</TouchableOpacity>



      </View>
    </ScrollView>
  );
};

export default Screen2;
