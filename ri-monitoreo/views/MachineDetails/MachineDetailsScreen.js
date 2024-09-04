import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import { Share } from 'react-native';

function MachineDetailsScreen({ route }) {
  const { machine } = route.params; // Recibe los datos de la máquina escaneada

  // Generar la información de la máquina, incluyendo el campo __v
  const machineInfo = {
    __v: machine?.__v || 0 ,// Aquí incluimos el campo __v, con un valor por defecto de 0 si no está disponible
    id: machine?._id || 'ID no disponible',
    name: machine?.name || 'Nombre no disponible',
    installationDate: machine?.installationDate || 'No disponible',
    lastMaintenance: machine?.lastMaintenance||'No disponible',
    historyMaintenance: {
      description: machine?.maintenanceHistory?.[0]?.description || 'No disponible',
      frigorias: machine?.maintenanceHistory?.[0]?.frigorias || 'No disponible',
      condensadora: machine?.maintenanceHistory?.[0]?.condensadora || 'No disponible',
      evaporadora: machine?.maintenanceHistory?.[0]?.evaporadora || 'No disponible',
      presionAlta: machine?.maintenanceHistory?.[0]?.presionAlta || 'No disponible',
      presionBaja: machine?.maintenanceHistory?.[0]?.presionBaja || 'No disponible'
    },
  };

  useEffect(() => {
    console.log('Datos de la máquina recibidos:', machine);
    console.log("Datos para el qr: ", machineInfo);
  }, []);

  // Función para generar el PDF usando expo-print
  const generatePDF = async () => {
    const lastMaintenance = machine?.maintenanceHistory?.[0] || {};
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              padding: 0;
              background-color: #f5f5f5;
            }
            h1 {
              text-align: center;
              color: #007bff;
            }
            h2 {
              text-align: left;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #007bff;
              color: white;
            }
            .qr-container {
              text-align: center;
              margin-top: 30px;
            }
            .qr-container img {
              width: 150px;
              height: 150px;
            }
          </style>
        </head>
        <body>
          <h1>Detalles de la Máquina</h1>
          <table>
            <tr>
              <th>Propiedad</th>
              <th>Valor</th>
            </tr>
            <tr>
              <td><strong>Nombre</strong></td>
              <td>${machineInfo.name}</td>
            </tr>
            <tr>
              <td><strong>Último Mantenimiento</strong></td>
              <td>${lastMaintenance.date || 'No disponible'}</td>
            </tr>
            <tr>
              <td><strong>Fecha de Instalación</strong></td>
              <td>${machineInfo.installationDate}</td>
            </tr>
            <tr>
              <td><strong>Descripción</strong></td>
              <td>${lastMaintenance.description || 'No disponible'}</td>
            </tr>
            <tr>
              <td><strong>Frigorías</strong></td>
              <td>${lastMaintenance.frigorias || 'No disponible'}</td>
            </tr>
            <tr>
              <td><strong>Condensadora</strong></td>
              <td>${lastMaintenance.condensadora || 'No disponible'}</td>
            </tr>
            <tr>
              <td><strong>Evaporadora</strong></td>
              <td>${lastMaintenance.evaporadora || 'No disponible'}</td>
            </tr>
            <tr>
              <td><strong>Presión Alta</strong></td>
              <td>${lastMaintenance.presionAlta || 'No disponible'}</td>
            </tr>
            <tr>
              <td><strong>Presión Baja</strong></td>
              <td>${lastMaintenance.presionBaja || 'No disponible'}</td>
            </tr>
            <tr>
              <td><strong>__v</strong></td>
              <td>${machineInfo.__v}</td>
            </tr>
          </table>
  
          <div class="qr-container">
            <h2>Código QR de la Máquina:</h2>
            <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
              JSON.stringify(machineInfo)
            )}&size=150x150" alt="QR Code"/>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      Alert.alert('PDF Generado', `Se ha creado el PDF en ${uri}`);
      
      Share.share({
        message: 'Detalles de la máquina',
        url: uri,
        title: 'Imprimir PDF'
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  return (
    <View style={styles.container}>
      {/* Imagen del aire acondicionado */}
      <Image source={require('./3653252.png')} style={styles.image} />

      {/* Mostrar la información de la máquina */}
      <Text style={styles.title}>{machineInfo.name}</Text>
      <Text style={styles.info}>
        Fecha de Instalación: {machineInfo.installationDate}
      </Text>

      {/* Mostrar información del último mantenimiento */}
      {machine?.maintenanceHistory?.[0] ? (
        <>
          <Text style={styles.title}>Más Info. Último Mantenimiento</Text>
          <Text style={styles.info}>
            Fecha de Ultimo Mantenimiento: {machineInfo.lastMaintenance}
          </Text>
          <Text style={styles.info}>
            Descripción: {machineInfo.historyMaintenance.description}
          </Text>
          <Text style={styles.info}>
            Frigorías: {machineInfo.historyMaintenance.frigorias}
          </Text>
          <Text style={styles.info}>
            Condensadora: {machineInfo.historyMaintenance.condensadora}
          </Text>
          <Text style={styles.info}>
            Evaporadora: {machineInfo.historyMaintenance.evaporadora}
          </Text>
          <Text style={styles.info}>
            Presión Alta: {machineInfo.historyMaintenance.presionAlta}
          </Text>
          <Text style={styles.info}>
            Presión Baja: {machineInfo.historyMaintenance.presionBaja}
          </Text>
        </>
      ) : (
        <Text style={styles.info}>No hay información de mantenimiento disponible</Text>
      )}

      {/* Código QR generado con la información de la máquina */}
      <View style={styles.qrContainer}>
        <Text style={styles.qrLabel}>Código QR de la máquina:</Text>
        <QRCode value={JSON.stringify(machineInfo)} size={150} />
      </View>

      {/* Botón para imprimir el PDF */}
      <TouchableOpacity style={styles.button} onPress={generatePDF}>
        <Text style={styles.buttonText}>Imprimir PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
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
  info: {
    fontSize: 16,
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
  button: {
    backgroundColor: '#1D1936',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MachineDetailsScreen;
