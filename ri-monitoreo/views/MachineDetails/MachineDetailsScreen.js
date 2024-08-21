import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

function MachineDetailsScreen({ route }) {
  const { machine } = route.params; // Recibe los datos de la máquina escaneada

  // Asegúrate de que `machine` tenga valores válidos antes de usarlos.
  const machineInfo = JSON.stringify({
    name: machine?.name || 'Nombre no disponible',
    lastMaintenance: machine?.lastMaintenance || 'No disponible',
    installationDate: machine?.installationDate || 'No disponible',
  });

  return (
    <View style={styles.container}>
      {/* Imagen del aire acondicionado */}
      <Image source={require('./3653252.png')} style={styles.image} />

      {/* Mostrar la información de la máquina */}
      <Text style={styles.title}>{machine?.name || 'Nombre no disponible'}</Text>
      <Text style={styles.info}>
        Último Mantenimiento: {machine?.lastMaintenance || 'No disponible'}
      </Text>
      <Text style={styles.info}>
        Fecha de Instalación: {machine?.installationDate || 'No disponible'}
      </Text>

      {/* Código QR generado con la información de la máquina */}
      <View style={styles.qrContainer}>
        <Text style={styles.qrLabel}>Código QR de la máquina:</Text>
        <QRCode
          value={machineInfo}
          size={150}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qrContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
});

export default MachineDetailsScreen;
