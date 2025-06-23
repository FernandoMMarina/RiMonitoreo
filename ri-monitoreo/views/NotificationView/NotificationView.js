import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import RegisterPushToken from './RegisterPushToken'; 

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

const NotificationView = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(null);

  // Obtener el rol del usuario al cargar el componente
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          const response = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRole(response.data.role); // Establecer el rol del usuario
        } else {
          console.log('Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
      }
    };
    fetchUserRole();
  }, []);

  // Buscar usuarios por nombre y rol
  const searchUsers = async (name, role) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('Token no encontrado');
        return;
      }

      const response = await axios.get(`${API_URL}/users/users/search`, {
        params: { name, role },
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      await AsyncStorage.setItem('userId', response.data._id);
      console.log('Usuarios encontrados:', response.data);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
    }
  };

  // Enviar notificación de prueba
  const sendNotification = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('Token no encontrado');
        return;
      }
      
      if (!selectedUser || !message) {
        Alert.alert('Error', 'Debes seleccionar un usuario y escribir un mensaje.');
        return;
      }
      
      console.log("Enviando notificación a usuario ID:", selectedUser);
      
      const response = await axios.post(`${API_URL}/users/users/send-test-notification`, {
        userId: selectedUser,
        message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Respuesta del servidor:', response.data);
      Alert.alert('Notificación enviada', response.data.message);
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      Alert.alert('Error', 'Hubo un problema al enviar la notificación.');
    }
  };

  return (
    <View style={styles.container}>
      <RegisterPushToken />
      <Text style={styles.header}>Dashboard de Notificaciones</Text>

      {role === 'user' ? (
        <Text style={styles.noNotifications}>No hay notificaciones</Text>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <Text style={styles.subHeader}>Buscar Usuarios</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del usuario"
              onChangeText={(text) => searchUsers(text, 'user')}
            />
            <FlatList
              data={users}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedUser(item._id)}>
                  <View style={[styles.userItem, selectedUser === item._id && styles.selectedItem]}>
                    <Text>{item.username} ({item.role})</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
            />
          </View>

          <View style={styles.notificationContainer}>
            <Text style={styles.subHeader}>Enviar Notificación</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Mensaje de la notificación"
              value={message}
              onChangeText={(text) => setMessage(text)}
              multiline={true}
            />
            <Button title="Enviar Notificación" onPress={sendNotification} />
          </View>
        </>
      )}
    </View>
  );
};

export default NotificationView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  noNotifications: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  userItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#cce7ff',
  },
  notificationContainer: {
    marginTop: 20,
  },
  textarea: {
    height: 100,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlignVertical: 'top',
  },
});
