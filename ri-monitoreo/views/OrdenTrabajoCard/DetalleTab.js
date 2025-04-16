import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';

const DetalleTab = ({ trabajo }) => {
  const openGoogleMaps = () => {
    if (trabajo?.latitud && trabajo?.longitud) {
      const url = `https://www.google.com/maps?q=${trabajo.latitud},${trabajo.longitud}`;
      Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir Google Maps.'));
    } else if (trabajo?.ubicacion?.direccion) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trabajo.ubicacion.direccion)}`;
      Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir Google Maps.'));
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.label}>Descripción: {trabajo?.descripcion || 'No especificado'}</Text>
      <TouchableOpacity onPress={openGoogleMaps}>
        <Text style={[styles.label, { color: 'blue' }]}>
          Dirección: {trabajo?.ubicacion?.direccion || 'No disponible'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.label}>Insumos:</Text>
      {Array.isArray(trabajo?.insumos) && trabajo.insumos.length > 0 ? (
        trabajo.insumos.map((insumo, idx) => (
          <Text key={idx} style={styles.value}>
            - {insumo.descripcion} - Cantidad: {insumo.cantidad}
          </Text>
        ))
      ) : (
        <Text style={styles.value}>No hay insumos asignados</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default DetalleTab;
