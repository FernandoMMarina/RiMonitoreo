import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WorkDetailsScreen = ({ route }) => {
  const { trabajo } = route.params || {};

  // Coordenadas predeterminadas, actualízalas con los datos reales si están disponibles
  const [mapUrl, setMapUrl] = useState(`https://www.openstreetmap.org/#map=15/37.7749/-122.4194`);

  useEffect(() => {
    // Crear un enlace basado en las coordenadas o usa las predeterminadas si no tienes latitud y longitud precisas
    if (trabajo && trabajo.clientAddress) {
      const encodedAddress = encodeURIComponent(trabajo.clientAddress);
      setMapUrl(`https://www.openstreetmap.org/search?query=${encodedAddress}#map=15`);
    }
  }, [trabajo.clientAddress]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles del Trabajo</Text>
      <Text style={styles.info}>Cliente: {trabajo.clientName}</Text>
      <Text style={styles.info}>Dirección: {trabajo.clientAddress}</Text>
      <WebView source={{ uri: mapUrl }} style={styles.map} />
      <Text style={styles.info}>Estado: {trabajo.estado}</Text>
      <Text style={styles.info}>
        Fecha de Asignación: {new Date(trabajo.fechaAsignacion).toLocaleDateString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D1936',
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    marginTop: 16,
  },
  info: {
    fontSize: 16,
    marginVertical: 5,
    color: 'white',
  },
  map: {
    width: '100%',
    height: 300,
  },
});

export default WorkDetailsScreen;
