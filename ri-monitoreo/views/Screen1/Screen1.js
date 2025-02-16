import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchMachines } from '../../redux/slices/machineSlice';
import { fetchLastMaintenances } from '../../redux/slices/maintenanceSlice';
import { fetchUserProfile } from '../../redux/slices/userSlice';
import styles from './styles';
import UserView from '../UserView/UserView';
import HerramientasScreen from '../HerramientaScreen/HerramientaScreen';
import axios from 'axios';
import OrdenTrabajoCard2 from '../OrdenTrabajoCard/OrdenTrabajoCard2';

const Screen1 = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { profile, loading, error } = useSelector((state) => state.user);
  const { machines } = useSelector((state) => state.machines);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchLastMaintenances(profile?.id));
      dispatch(fetchMachines(profile?.id));
    }
  }, [dispatch, profile?.id]);

  const [trabajo, setTrabajo] = useState([]);

  useEffect(() => {
    const fetchTrabajo = async () => {
      try {
        const response = await axios.get(
          `https://rosensteininstalaciones.com.ar/api/trabajos/tecnicos/${profile?.id}`
        );
        setTrabajo(response.data.data || []);
      } catch (error) {
        console.error('Error al obtener el trabajo:', error);
      }
    };

    if (profile?.id) {
      fetchTrabajo();
    }
  }, [profile?.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        Ocurrió un error: {error.message || JSON.stringify(error)}
      </Text>
    </View>    
    );
  }

  return (
    <ScrollView style={styles.container}>
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
        <View style={{ margin: 0 }}>
          {trabajo.map((t) => (
            <View key={t._id} style={{ height: 600, marginBottom: 50 }}>
              <OrdenTrabajoCard2 trabajo={t} />
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
  
};

export default Screen1;
