import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HerramientasTab = ({ trabajo }) => {
  const [herramientas, setHerramientas] = useState(trabajo?.herramientas || []);

  const toggleHerramienta = async (index) => {
    const herramientaSeleccionada = herramientas[index];
    const nuevaCompletada = !herramientaSeleccionada.completada;

    const nuevasHerramientas = herramientas.map((h, i) =>
      i === index ? { ...h, completada: nuevaCompletada } : h
    );

    setHerramientas(nuevasHerramientas);

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `https://rosensteininstalaciones.com.ar/api/trabajos/marcar-herramienta-especifico`,
        {
          trabajoId: trabajo._id,
          herramientaNombre: herramientaSeleccionada.nombre,
          completada: nuevaCompletada,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error al actualizar herramienta:', error);
      Alert.alert('Error', 'No se pudo actualizar la herramienta.');
    }
  };

  const completadas = herramientas.every((h) => h.completada);

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.label}>Herramientas:</Text>
      {completadas && (
        <View style={styles.resultContainer}>
          <Ionicons name="checkmark-circle" size={40} color="green" />
          <Text style={styles.successText}>Herramientas Completadas</Text>
        </View>
      )}
      {herramientas.map((herramienta, index) => (
        <View key={index} style={styles.itemRow}>
          <Checkbox.Android
            status={herramienta.completada ? 'checked' : 'unchecked'}
            onPress={() => toggleHerramienta(index)}
            color="#4B0082"
          />
          <Text style={styles.herramientaText}>{herramienta.nombre}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  herramientaText: {
    fontSize: 15,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  successText: {
    color: 'green',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default HerramientasTab;
