import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from './styles';

const API_URL = 'http://ec2-44-211-67-52.compute-1.amazonaws.com:5000/api';

const ClientMachines = ({ clientId }) => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMachineId, setExpandedMachineId] = useState(null);
  const [maintenanceDetails, setMaintenanceDetails] = useState({});

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${API_URL}/machines/user/${clientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMachines(response.data || []);
        } else {
          console.error('Token no encontrado');
        }
      } catch (error) {
        console.error('Error al obtener las máquinas del cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, [clientId]);

  const fetchMaintenanceDetails = async (maintenanceId) => {
    try {
      const response = await axios.get(`${API_URL}/maintenances/${maintenanceId}`);
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalles del mantenimiento ${maintenanceId}:`, error);
      return null;
    }
  };

  const toggleExpand = async (machine) => {
    const machineId = machine._id;
    setExpandedMachineId((prevId) => (prevId === machineId ? null : machineId));

    if (!maintenanceDetails[machineId]) {
      // Obtener detalles de cada mantenimiento en el historial
      const maintenanceData = await Promise.all(
        machine.maintenanceHistory.map((maintenanceId) => fetchMaintenanceDetails(maintenanceId))
      );

      setMaintenanceDetails((prevDetails) => ({
        ...prevDetails,
        [machineId]: maintenanceData.filter(Boolean), // Filtrar datos no válidos
      }));
    }
  };



  const getMaintenanceStatus = (lastMaintenanceDate, maintenanceHistory = []) => {
    // Usa la última fecha conocida o la primera del historial
    const dateToCheck = lastMaintenanceDate || (maintenanceHistory.length > 0 ? maintenanceHistory[0].date : null);
  
    console.log("lastMaintenanceDate:", lastMaintenanceDate);
    console.log("maintenanceHistory:", maintenanceHistory);
    console.log("dateToCheck:", dateToCheck);
  
    if (!dateToCheck) {
      return { status: 'Sin registro', color: 'red' };
    }
  
    const now = new Date();
    const lastMaintenance = new Date(dateToCheck);
    const diffMonths =
      (now.getFullYear() - lastMaintenance.getFullYear()) * 12 +
      now.getMonth() - lastMaintenance.getMonth();
  
    if (diffMonths > 3) {
      return { status: 'Revisar Mantenimiento', color: 'red' };
    }
    return { status: 'Mantenimiento al día', color: 'green' };
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
    // Asegúrate de que `maintenanceDetails` tiene datos antes de usarlo
    const maintenanceHistory = maintenanceDetails[item._id] || [];
    const { status, color } = getMaintenanceStatus(item.lastMaintenance, maintenanceHistory);
  
    const isExpanded = expandedMachineId === item._id;
  
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item)} style={styles.cardHeader}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.subTitleContainer}>
            <Text style={styles.subTitle}>Último mantenimiento:</Text>
            <View style={[styles.chip, { backgroundColor: color }]}>
              <Text style={styles.chipText}>{status}</Text>
            </View>
          </View>
        </TouchableOpacity>
  
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.historyTitle}>Historial de mantenimiento:</Text>
            {renderMaintenanceHistory(maintenanceHistory)}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando máquinas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={machines}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default ClientMachines;
