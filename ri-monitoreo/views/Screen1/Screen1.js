import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchMachines } from '../../redux/slices/machineSlice';
import { fetchLastMaintenances } from '../../redux/slices/maintenanceSlice';
import { fetchUserProfile } from '../../redux/slices/userSlice';
import styles from './styles';
import UserView from '../UserView/UserView';
import HerramientasScreen from '../HerramientaScreen/HerramientaScreen';

const Screen1 = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Estados globales desde Redux
  const { profile, loading, error } = useSelector((state) => state.user);
  const { machines } = useSelector((state) => state.machines);
  
  // Obtener datos al montar el componente
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile?.id) {
      console.log('Fetching data for userId:', profile?.id);
      dispatch(fetchLastMaintenances(profile?.id));
      dispatch(fetchMachines(profile?.id));
    }
  }, [dispatch, profile?.id]);

  // Pantalla de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // Manejo de errores
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ocurrió un error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Saludo personalizado */}
      <Text style={styles.titleCScreen1}>
        <Text style={{ fontWeight: 'bold' }}>
          {profile?.gender === 'female' ? '¡Bienvenida! ' : '¡Bienvenido! '}
        </Text>
        <Text>{profile?.username || 'Usuario'}</Text>
      </Text>

      {profile?.role === 'user' ? (
        <UserView
          idCliente={profile?.userId}
          machines={machines}
          userId={profile.userId}
          navigation={navigation}
        />
      ) : profile?.role === 'technical' || profile?.role === 'admin' ? (
        <View>
          <Text style={styles.titleMaquinas}>No te olvides nada!</Text>
          <HerramientasScreen/>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default Screen1;