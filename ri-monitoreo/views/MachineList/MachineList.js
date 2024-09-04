import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const MachinesList = ({ route }) => {
    const { machines } = route.params;
    const navigation = useNavigation(); // Solución para acceder a la navegación

    const fetchMachineDetails = async (machineId) => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const response = await axios.get(`http://ec2-50-16-74-81.compute-1.amazonaws.com:5000/api/machines/${machineId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Detalles de la máquina:', response.data);
          return response.data;
        } catch (error) {
          console.error('Error al obtener detalles de la máquina:', error);
        }
      };

    return (
      <FlatList
        data={machines}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={async () => {
              const machineDetails = await fetchMachineDetails(item); // Obtener los detalles de cada máquina
              navigation.navigate('MachineDetails', { machine: machineDetails });
            }}
          >
            <View style={styles.card}>
              <Text style={styles.title}>Máquina ID: {item}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.toString()}
      />
    );
};

export default MachinesList;

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',   
  }
});
