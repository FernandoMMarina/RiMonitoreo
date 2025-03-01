import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions, ActivityIndicator, Button, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchMachines } from '../../redux/slices/machineSlice';
import { fetchLastMaintenances } from '../../redux/slices/maintenanceSlice';
import { fetchUserProfile } from '../../redux/slices/userSlice';
import styles from './styles';
import UserView from '../UserView/UserView';
import OrdenTrabajoCard2 from '../OrdenTrabajoCard/OrdenTrabajoCard2';
import axios from 'axios';

const useTrabajos = (userId) => {
  const [trabajo, setTrabajo] = useState([]);

  useEffect(() => {
    const fetchTrabajo = async () => {
      try {
        const response = await axios.get(
          `https://rosensteininstalaciones.com.ar/api/trabajos/tecnicos/${userId}`
        );
        setTrabajo(response.data.data || []);
      } catch (error) {
        console.error('Error al obtener el trabajo:', error);
      }
    };

    if (userId) {
      fetchTrabajo();
    }
  }, [userId]);

  return trabajo;
};

const Screen1 = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { height } = useWindowDimensions();

  const { profile, loading, error } = useSelector((state) => state.user);
  const { machines } = useSelector((state) => state.machines);
  const trabajo = useTrabajos(profile?.id);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchLastMaintenances(profile?.id));
      dispatch(fetchMachines(profile?.id));
    }
  }, [dispatch, profile?.id]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { height }]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { height }]}>
        <Text style={styles.errorText}>
          Ocurrió un error: {error.message || JSON.stringify(error)}
        </Text>
        <Button title="Reintentar" onPress={() => dispatch(fetchUserProfile())} />
      </View>
    );
  }

  return (
    <View style={[styles.containerM, { height }]}>
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
          <FlatList
            data={trabajo}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 20 }}>
                <OrdenTrabajoCard2 trabajo={item} />
              </View>
            )}
            contentContainerStyle={styles.container}
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

export default Screen1;