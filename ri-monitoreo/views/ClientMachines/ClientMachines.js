import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMachines } from '../../redux/slices/machineSlice';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

const ClientMachines = ({ userId }) => {
  const dispatch = useDispatch();
  const [expandedMachineId, setExpandedMachineId] = useState(null);
  const [maintenanceDetails, setMaintenanceDetails] = useState({}); // Almacenará los detalles de mantenimiento

  const { machines, loading, error } = useSelector((state) => state.machines);

  useEffect(() => {
    if (userId) {
      dispatch(fetchMachines(userId)); // Llama al thunk para obtener las máquinas
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (machines && machines.length > 0) {
      fetchMaintenanceHistories(); // Busca los detalles de los mantenimientos
    }
  }, [machines]);

  const fetchMaintenanceDetails = async (maintenanceId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/maintenances/${maintenanceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalles del mantenimiento ${maintenanceId}:`, error);
      return null;
    }
  };

  const fetchMaintenanceHistories = async () => {
    const details = {};
    for (const machine of machines) {
      const history = machine.maintenanceHistory || [];
      const maintenanceData = await Promise.all(
        history.map((id) => fetchMaintenanceDetails(id))
      );
      details[machine._id] = maintenanceData.filter(Boolean); // Filtrar datos válidos
    }
    setMaintenanceDetails(details);
  };

  const calculateTimeSinceLastMaintenance = (history) => {
    if (!history || history.length === 0) {
      return { status: 'Sin registro', color: 'red' };
    }
  
    const lastMaintenance = new Date(history[0].date); // Usar la fecha del primer mantenimiento
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - lastMaintenance.getFullYear()) * 12 +
      now.getMonth() - lastMaintenance.getMonth();
  
    if (diffMonths > 3) {
      return { status: 'Revisar Mantenimiento', color: 'red' };
    }
  
    return { status: 'Mantenimiento al día', color: 'green' };
  };
  

  const toggleExpand = (machineId) => {
    setExpandedMachineId(expandedMachineId === machineId ? null : machineId);
  };

  const renderMaintenanceHistory = (history) => {
    if (!history || history.length === 0) {
      return <Text style={styles.noHistory}>No hay historial de mantenimiento disponible.</Text>;
    }

    return history.map((maintenance, index) => (
      <View key={index} style={styles.maintenanceItem}>
        <Text style={styles.maintenanceDate}>
          Fecha: {new Date(maintenance.date).toLocaleDateString()}
        </Text>
        <Text style={styles.maintenanceDescription}>
          Descripción: {maintenance.description || 'No especificada'}
        </Text>
      </View>
    ));
  };

  const renderItem = ({ item }) => {
    const history = maintenanceDetails[item._id] || [];
    const { status, color } = calculateTimeSinceLastMaintenance(history);
  
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item._id)} style={styles.cardHeader}>
          <Text style={styles.title}>{item.name || 'Nombre no disponible'}</Text>
          <View style={styles.subTitleContainer}>
            <Text style={styles.subTitle}>Último mantenimiento:</Text>
            <View style={[styles.chip, { backgroundColor: color }]}>
              <Text style={styles.chipText}>{status}</Text>
            </View>
          </View>
        </TouchableOpacity>
  
        {expandedMachineId === item._id && (
          <View style={styles.expandedContent}>
            <Text style={styles.historyTitle}>Historial de mantenimiento:</Text>
            {renderMaintenanceHistory(history)}
          </View>
        )}
      </View>
    );
  };
  

  if (loading) {
    return (
      <View style={styles.noDataContainer}>
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.noDataContainer}>
        <Text>Error al cargar datos: {error}</Text>
      </View>
    );
  }

  if (!machines || machines.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text>No se encontraron máquinas para este cliente.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={machines}
      renderItem={renderItem}
      keyExtractor={(item) => item._id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

export default ClientMachines;
