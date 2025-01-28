import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const WorkDetailsScreen = ({ route }) => {
  const { trabajo } = route.params || {};

  const [mapUrl, setMapUrl] = useState(
    'https://www.openstreetmap.org/#map=15/37.7749/-122.4194'
  );

  useEffect(() => {
    if (trabajo) {
      if (trabajo.latitud && trabajo.longitud) {
        // Usar coordenadas si están disponibles
        setMapUrl(
          `https://www.openstreetmap.org/#map=15/${trabajo.latitud}/${trabajo.longitud}`
        );
      } else if (trabajo.clientAddress) {
        // Usar la dirección codificada si no hay coordenadas
        const encodedAddress = encodeURIComponent(trabajo.clientAddress);
        setMapUrl(
          `https://www.openstreetmap.org/search?query=${encodedAddress}#map=15`
        );
      }
    }
  }, [trabajo]);

  const openGoogleMaps = () => {
    if (trabajo?.latitud && trabajo?.longitud) {
      // Abrir Google Maps con coordenadas
      const url = `https://www.google.com/maps?q=${trabajo.latitud},${trabajo.longitud}`;
      Linking.openURL(url).catch(() =>
        Alert.alert(
          'Error',
          'No se pudo abrir Google Maps. Verifique que esté instalado en su dispositivo.'
        )
      );
    } else if (trabajo?.clientAddress) {
      // Abrir Google Maps con dirección
      const encodedAddress = encodeURIComponent(trabajo.clientAddress);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(url).catch(() =>
        Alert.alert(
          'Error',
          'No se pudo abrir Google Maps. Verifique que esté instalado en su dispositivo.'
        )
      );
    } else {
      Alert.alert('Información faltante', 'No se encontró dirección o coordenadas.');
    }
  };

  if (!trabajo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Detalles del Trabajo</Text>
        <Text style={styles.info}>No se encontraron datos del trabajo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles del Trabajo</Text>
      <Text style={styles.info}>Cliente: {trabajo.clientName || 'No disponible'}</Text>
      <TouchableOpacity onPress={openGoogleMaps}>
        <Text style={[styles.info, styles.link]}>
          Dirección: {trabajo.clientAddress || 'No disponible'}
        </Text>
      </TouchableOpacity>
      <WebView source={{ uri: mapUrl }} style={styles.map} />
      <Text style={styles.info}>Estado: {trabajo.estado || 'No disponible'}</Text>
      <Text style={styles.info}>
        Fecha de Asignación:{' '}
        {trabajo.fechaAsignacion
          ? new Date(trabajo.fechaAsignacion).toLocaleDateString()
          : 'No disponible'}
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
  link: {
    textDecorationLine: 'underline',
    color: '#1E90FF',
  },
  map: {
    width: '100%',
    height: 300,
    marginVertical: 10,
  },
});

export default WorkDetailsScreen;
