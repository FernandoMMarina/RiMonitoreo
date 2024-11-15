import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from './styles';

const API_URL = 'http://ec2-44-211-67-52.compute-1.amazonaws.com:5000/api';

const ClientMachines = ({ route }) => {
  const { clientId } = route.params;
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idCliente, setIdCliente] = useState([]);
  const [Client, setClient] = useState([]);
  const [role, setRole]= useState('');

//Funcion Buscar datos del Cliente
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log("ACA"+JSON.stringify(response.data))
          setIdCliente(response.data.id)
          setRole(response.data.role);
        } else {
          console.log('Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
      }
    };
    //Funcion Buscar user por id
    const fetchClient = async (text) => {
        try {
          const token = await AsyncStorage.getItem('token');
          console.log('Token obtenido:', token); // Verifica si el token se obtiene correctamente
          if (!token) {
            console.log('No se encontró el token');
            return;
          }
          let url = `${API_URL}/users/user/${idCliente}`;
          console.log('URL construida:', url);
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Respuesta cliente', response.data);
          setClient(response.data || []);
        } catch (error) {
          console.error('Error al obtener los clientes:', error);
        }
      };
    fetchUser();
    fetchClient();
  }, []);


  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log(idCliente)
        if (token) {
          const response = await axios.get(`${API_URL}/machines/${idCliente}`, {
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
  }, [idCliente]);




  const getMaintenanceStatus = (lastMaintenanceDate) => {
    const now = new Date();
    const lastMaintenance = new Date(lastMaintenanceDate);
    const diffMonths = (now.getFullYear() - lastMaintenance.getFullYear()) * 12 +
      now.getMonth() - lastMaintenance.getMonth();
    return diffMonths > 3 ? 'Revisar Mantenimiento' : 'Mantenimiento al día';
  };

  const getStatusColor = (status) => (status === 'Revisar Mantenimiento' ? 'red' : 'green');

  const renderItem = ({ item }) => {
    const status = getMaintenanceStatus(item.lastMaintenance);
    return (
      <View style={styles.card}>
        <Text style={styles.titleCard}>{item.name}</Text>
        <Text style={styles.subTitle}>Último mantenimiento: {item.lastMaintenance}</Text>
        <View style={[styles.chip, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.chipText}>{status}</Text>
        </View>
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

  if (machines.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No hay máquinas registradas para este cliente.</Text>
      </View>
    );
  }

  return (
    <View>

    </View>
  );
};


export default ClientMachines;


