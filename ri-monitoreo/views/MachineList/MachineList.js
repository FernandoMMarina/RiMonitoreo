import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const API_URL = 'http://ec2-34-230-81-174.compute-1.amazonaws.com:5000/api';

// Mapeo de tipo de máquina a imagen
const machineTypeImages = {
  'Aire Acondicionado': require('./acondicionador-de-aire.png'),
  'Caldera': require('./caldera.png'),
  'Compresor de Aire': require('./compresor-de-aire.png'),
  'AutoElevador': require('./elevador-de-automoviles.png'),
};

const MachinesList = ({ route }) => {
  const { machines } = route.params;
  const navigation = useNavigation();
  const [selectedCard, setSelectedCard] = useState(null);

  const fetchMachineDetails = async (machineId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado');
        return null;
      }
      const response = await axios.get(`${API_URL}/machines/${machineId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles de la máquina:', error);
      return null;
    }
  };

  const handleCardPress = async (machineId) => {
    const machineDetails = await fetchMachineDetails(machineId);
    if (machineDetails) {
      navigation.navigate('MachineDetails', { machine: machineDetails });
    }
  };

  const renderItem = ({ item, index }) => {
    // Selecciona la imagen correspondiente según el tipo de máquina
    const imageSource = machineTypeImages[item.type] || require('./3653252.png');

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animatable.View
          animation="fadeInUp"
          duration={600}
          delay={index * 100}
          style={[styles.card, selectedCard === item._id ? styles.selectedCard : null]}
        >
          <PanGestureHandler
            onGestureEvent={(event) => {
              if (event.nativeEvent.translationY > 100) {
                setSelectedCard(item._id);
              } else if (event.nativeEvent.translationY < -100) {
                setSelectedCard(null);
              }
            }}
            onHandlerStateChange={(event) => {
              if (event.nativeEvent.state === State.END) {
                setSelectedCard(null);
              }
            }}>
            <TouchableOpacity
              onPress={() => handleCardPress(item._id)}
              activeOpacity={0.8}
              style={styles.touchableArea}>
              <Image source={imageSource} style={styles.image} />
              <Text style={styles.title}>Tipo de Máquina: {item.type || 'N/A'}</Text>
              <Text style={styles.info}>Nombre de Máquina: {item.name || 'Sin nombre'}</Text>
              <Text style={styles.title}>Historial de Mantenimiento</Text>
              {item.maintenanceHistory && item.maintenanceHistory.length > 0 ? (
                <Text style={styles.info}>
                  Último Mantenimiento: {new Date(item.maintenanceHistory[0].date).toLocaleDateString()}
                </Text>
              ) : (
                <Text style={styles.info}>No hay historial de mantenimiento disponible</Text>
              )}
            </TouchableOpacity>
          </PanGestureHandler>
        </Animatable.View>
      </GestureHandlerRootView>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={machines}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={true} // Mostrar el indicador de scroll vertical
        style={{ flex: 1 }} // Asegura que el FlatList ocupe todo el espacio disponible
      />
    </View>
  );
};

export default MachinesList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D1936',
    padding: 10,
  },
  card: {
    width: width * 0.9,
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
    zIndex: 10,
    shadowOpacity: 0.3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  info: {
    fontSize: 16,
    marginVertical: 5,
    color: '#666',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  touchableArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
