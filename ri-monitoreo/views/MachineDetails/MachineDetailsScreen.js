import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import { Share, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

function MachineDetailsScreen({ route }) {
  const { machine } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  const machineInfo = {
    __v: machine?.__v || 0,
    id: machine?._id || 'ID no disponible',
    name: machine?.name || 'Nombre no disponible',
    installationDate: machine?.installationDate || 'No disponible',
    lastMaintenance: machine?.lastMaintenance || 'No disponible',
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
  }, [machine]);

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'No disponible';
  };

  const getMaintenanceStatus = () => {
    if (!machine?.lastMaintenance) {
      return { status: 'no-maintenance', message: 'No hay mantenimiento, por favor mándanos un mensaje para tener tu mantenimiento al día.', icon: 'close-circle', color: 'red' };
    }

    const lastMaintenanceDate = new Date(machine.lastMaintenance);
    const currentDate = new Date();
    const diffMonths = (currentDate.getFullYear() - lastMaintenanceDate.getFullYear()) * 12 + (currentDate.getMonth() - lastMaintenanceDate.getMonth());

    if (diffMonths > 3) {
      return { status: 'expired', message: 'Por favor mándanos un mensaje para tener tu mantenimiento al día.', icon: 'close-circle', color: 'red' };
    }

    return { status: 'up-to-date', message: 'Mantenimiento al día', icon: 'checkmark-circle', color: 'green' };
  };

  const openWhatsApp = (phoneNumber, message) => {
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp no está instalado en este dispositivo');
        }
      })
      .catch(err => console.error('Error al abrir WhatsApp:', err));
  };

  const maintenanceStatus = getMaintenanceStatus();

  const generatePDF = async () => {
    const lastMaintenance = machine?.maintenanceHistory?.[0] || {};
    const htmlContent = `
      <html>
        <head>
          <style>
          * { print-color-adjust:exact !important; }
            html, body {
              height: 100%;
              margin: 0;
              padding: 0;
              background-color: #1D1936 !important;
              color: #fff;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
              background: #1D1936; 
            }
            .content {
              background: #1D1936;
              color: #fff;
              padding: 20px;
              border-radius: 10px;
            }
            h1 {
              text-align: center;
              color: #fff;
            }
            h2 {
              text-align: left;
              color: #fff;
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
          <div class="content">
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
                <td>${formatDate(lastMaintenance.date)}</td>
              </tr>
              <tr>
                <td><strong>Fecha de Instalación</strong></td>
                <td>${formatDate(machineInfo.installationDate)}</td>
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

  // Función para generar PDF de etiqueta "Scan Me"
  const generateScanMePDF = async () => {
    const qrData = JSON.stringify({ machineId: machineInfo.id, name: machineInfo.name });
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background-color: #ffffff;
              margin: 0;
            }
            .container {
              text-align: center;
              border: 1px solid #ccc;
              padding: 20px;
              border-radius: 10px;
              background-color: #f9f9f9;
            }
            .qr-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #333;
            }
            .qr-code img {
              width: 200px;
              height: 200px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="qr-title">Scan Me</div>
            <div class="qr-code">
              <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                `appname://machineDetails?machineId=${machineInfo.id}`
              )}&size=200x200" alt="QR Code"/>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      Alert.alert('PDF Generado', `Se ha creado el PDF de la etiqueta en ${uri}`);
      
      Share.share({
        message: 'Etiqueta Scan Me',
        url: uri,
        title: 'Imprimir PDF'
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo generar el PDF de la etiqueta');
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}> 
      <View style={styles.container}>
        
        {/* Información del Modelo */}
        <View style={styles.card}>
          <Image source={require('./3653252.png')} style={styles.image} />
          <Text style={styles.title}>Modelo:</Text>
          <Text style={styles.modelName}>{machineInfo.name}</Text>
          <Text style={styles.title}>Fecha de Instalación :</Text>
          <Text style={styles.installationDate}>{formatDate(machineInfo.installationDate)}</Text>
        </View>

        {/* Información del Mantenimiento */}
        <View style={styles.card}>
          {machine?.maintenanceHistory?.[0] ? (
            <>
              <Text style={styles.sectionTitle}>Info. Último Mantenimiento</Text>
              <Text style={styles.infoLabel}>Fecha de Último Mantenimiento:</Text>
              <Text style={styles.info}>{formatDate(machineInfo.lastMaintenance)}</Text>
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
            <Text style={styles.noMaintenance}>No hay información de mantenimiento disponible</Text>
          )}
        </View>

        {/* Estado del Mantenimiento */}
        <View style={styles.card}>
          <View style={styles.statusMessageContainer}>
            <Ionicons style={styles.statusIcon} name={maintenanceStatus.icon} color={maintenanceStatus.color} size={30}/>
            <Text style={{ ...styles.statusMessage, color: maintenanceStatus.color }}>
              {maintenanceStatus.message}
            </Text>
          </View>

          {maintenanceStatus.status !== 'up-to-date' && (
            <TouchableOpacity 
              style={styles.whatsappButton} 
              onPress={() => openWhatsApp('+541141651335', 'Hola, necesito agendar un mantenimiento para mi máquina.')}
            >
              <Ionicons style={styles.icon} name={'logo-whatsapp'} color={"white"} size={25}/>
              <Text style={styles.buttonText}>Enviar Mensaje</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botón de Imprimir con Modal */}
        <TouchableOpacity style={styles.printButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="print-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Imprimir</Text>
        </TouchableOpacity>

        {/* Modal para Seleccionar Opción de Impresión */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccione una opción</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  generatePDF();
                }}
              >
                <Text style={styles.modalButtonText}>Imprimir PDF Completo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  generateScanMePDF();
                }}
              >
                <Text style={styles.modalButtonText}>Imprimir Etiqueta "Scan Me"</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  modelName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1D1936',
    textAlign: 'center',
  },
  installationDate: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#444',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    textAlign: 'left',
  },
  noMaintenance: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  statusMessageContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  statusIcon: {
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  whatsappButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
  },
  printButton: {
    flexDirection: 'row',
    backgroundColor: '#1D1936',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#1D1936',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MachineDetailsScreen;
