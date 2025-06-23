import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const DetalleUbicacion = () => {
  const coordenadas = {
    latitude: -34.555,   // 📍 Coordenadas reales de ejemplo (CABA)
    longitude: -58.452,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mapa fijo con coordenadas:</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            ...coordenadas,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker coordinate={coordenadas} title="Ubicación de prueba" />
        </MapView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  mapContainer: {
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});

export default DetalleUbicacion;
