import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal ,Share, Linking } from 'react-native';
import * as Print from 'expo-print';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles';
import axios from 'axios';
import NumeroSerie from './NumeroSerie';
import ModeloConInfo from './ModeloConInfo';
const API_URL = 'https://rosensteininstalaciones.com.ar/api';

function MachineDetailsScreen({ route }) {
  const { id, serialNumber } = route.params; // Recibe ambos parámetros
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log("ID recibido en MachineDetailsScreen:", id);
  const [modalVisible, setModalVisible] = useState(false);

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }) : 'No disponible';
  };
  useEffect(() => {
    const fetchMachineData = async () => {
      try {
        let machineId = id;

        // Si no hay ID pero hay número de serie, buscar el ID
        if (!machineId && serialNumber) {
          const serialResponse = await axios.get(`${API_URL}/machines/serial/${serialNumber}`);
          machineId = serialResponse.data.machineId; // Suponiendo que el endpoint devuelve { machineId: "..." }
        }

        // Si aún no hay ID, mostrar error
        if (!machineId) {
          throw new Error('No se pudo obtener el ID de la máquina.');
        }

        // Obtener los detalles de la máquina usando el ID
        const machineResponse = await axios.get(`${API_URL}/machines/${machineId}`);
        setMachine(machineResponse.data);
      } catch (error) {
        console.error('Error al buscar datos de la máquina:', error);
        Alert.alert('Error', 'No se pudo cargar la información de la máquina.');
      } finally {
        setLoading(false);
      }
    };

    fetchMachineData();
  }, [id, serialNumber]);

  console.log("Machines -- MachineDetailsScreen ACA", machine);

  const machineInfo = React.useMemo(() => {
    if (!machine) {
      return {
        __v: 0,
        id: 'ID no disponible',
        name: 'Nombre no disponible',
        type: 'No disponible',
        installationDate: 'No disponible',
        lastMaintenance: 'No disponible',
        historyMaintenance: {
          description: 'No disponible',
          frigorias: 'No disponible',
          condensadora: 'No disponible',
          evaporadora: 'No disponible',
          presionAlta: 'No disponible',
          presionBaja: 'No disponible',
        },
      };
    }
  
    const lastMaintenance = machine.maintenanceHistory?.[0] || {};
  
    return {
      __v: machine.__v || 0,
      id: machine._id || 'ID no disponible',
      name: machine.name || 'Nombre no disponible',
      type: machine.type || 'No disponible',
      serialNumber:machine.serialNumber || 'No disponible',
      installationDate: machine.installationDate || 'No disponible',
      lastMaintenance: formatDate(machine.lastMaintenance) || 'No disponible',
      historyMaintenance: {
        description: lastMaintenance.description || 'No disponible',
        frigorias: lastMaintenance.frigorias || 'No disponible',
        condensadora: lastMaintenance.condensadora || 'No disponible',
        evaporadora: lastMaintenance.evaporadora || 'No disponible',
        presionAlta: lastMaintenance.presionAlta || 'No disponible',
        presionBaja: lastMaintenance.presionBaja || 'No disponible',
      },
    };
  }, [machine]);
  
  // Mapear tipos a imágenes
  const typeImages = {
    "Aire Acondicionado": require('./3653252.png'),
    "Aire Acondicionado Multiposición": require('./3653252.png'),
    "Aire Acondicionado Roof Top": require('./3653252.png'),
    "Caldera": require('./caldera.png'),
    "Refrigerador": require('./refrigerator.png'),
    "AutoElevador":require('./elevador-de-automoviles.png'),
    "Cabina de Pintura":require('./spray-paint.png'),
    "Tablero Electrico":require('./electrical-panel.png'),
    "Compresor de Aire":require('./air-compressor.png'),
    // Agrega más tipos aquí
    default: require('./logo.png'), // Imagen por defecto
  };

  const getImageByType = (type) => {
    return typeImages[type] || typeImages.default;
  };

  if (!id && !serialNumber) {
    return (
      <View style={styles.container}>
        <Text>{id}</Text>
        <Text style={styles.loadingText}>Error: No se recibió un ID válido.</Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando información de la máquina...</Text>
      </View>
    );
  }
  if (!machine) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando información de la máquina...</Text>
      </View>
    );
  }

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
    const url = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
  
    Linking.openURL(url)
    .catch((err) => {
      console.error('Error al abrir WhatsApp:', err);
      Alert.alert('Error', 'No se pudo abrir WhatsApp. Por favor, asegúrate de que la aplicación esté instalada.');
    });
  };
  
  const maintenanceStatus = getMaintenanceStatus();
  
  // Construir el mensaje de WhatsApp dinámicamente
    const whatsappMessage = `
Hola, necesito agendar un mantenimiento para mi máquina.
Nombre: ${machineInfo.name || 'No disponible'}
Número de identificación: ${machineInfo.serialNumber || 'No disponible'}
Enlace: https://rosensteininstalaciones.com.ar/redirect?serialNumber=${machineInfo.serialNumber}
Tipo: ${machineInfo.type || 'No disponible'}
Último mantenimiento: ${machineInfo.lastMaintenance || 'No disponible'}
    `;

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
    <View>
      <View style={styles.container}>
        
        {/* Información del Modelo */}
        <View style={styles.cardMachine}>
          <Text style={{alignContent:"flex-start" , fontSize:15, color:"#ffffff",fontWeight:"bold"}}>{machineInfo.name || "No disponible"}</Text>
          <Image source={getImageByType(machine.type)} style={styles.image} />
          <View style={{flex:1,alignContent:"center",alignItems:"center"}}>
            <NumeroSerie serial={machineInfo.serialNumber}/>
          </View>
          {console.log(machineInfo.type)}
          {/* Información Adicional por Tipo de Máquina */}
          {machineInfo.type === "Aire Acondicionado" && (
            <>
            <Text style={styles.title}>Frigorías:</Text>
          <Text style={styles.installationDate}> {machine.coolingCapacity ||  'No disponible'}</Text>
          <Text style={styles.title}>Calorias:</Text>
          <Text style={styles.installationDate}> {machine.heatingCapacity ||  'No disponible'}</Text>
          <Text style={styles.title}>Refrigerante:</Text>
          <Text style={styles.installationDate}> {machine.condensadora ||  'No disponible'}</Text>
              <Text style={styles.title}>Capacidad (Frigorías):</Text>
              <Text style={styles.installationDate}>{machineInfo.frigorias || 'No disponible'}</Text>
            </>
          )}
          {machineInfo.type === "Aire Acondicionado Multiposición" && (
            <View style={styles.cardInfo}>
              <Text style={styles.titleGInfo}>Información</Text>
              <View style={styles.divider} />
              <View style={{ flexDirection: 'row', gap: 0 }}>

                {/* Columna 1 */}
                <View style={{ flex: 1,padding:8 }}>
                  <Text style={styles.titleinfo}>Frigorías:</Text>
                  <Text style={styles.infocard}>{machine.coolingCapacity || 'No disponible'}</Text>
                  <Text style={styles.titleinfo}>Calorías:</Text>
                  <Text style={styles.infocard}>{machine.heatingCapacity || 'No disponible'}</Text>
                  <Text style={styles.titleinfo}>Refrigerante:</Text>
                  <Text style={styles.infocard}>{machine.refrigeranteMultiposicion || 'No disponible'}</Text>
                </View>

                {/* Columna 2 */}
                <View style={{ flex: 1,padding:8 }}>
                  <Text style={styles.titleinfo}>IDU (Cantidad):</Text>
                  <Text style={styles.infocard}>{machineInfo.iduCantidad || 'No disponible'}</Text>
                  <Text style={styles.titleinfo}>HRU (Cantidad):</Text>
                  <Text style={styles.infocard}>{machineInfo.hruCantidad || 'No disponible'}</Text>
                  <Text style={styles.titleinfo}>Fecha de Instalación:</Text>
                  <Text style={styles.installationDate}>{formatDate(machineInfo.installationDate)}</Text>
                </View>
              </View>
            </View>
          )}

           {machineInfo.type === "Aire Acondicionado Roof Top" && (
            <>
          <Text style={styles.title}>Frigorías:</Text>
          <Text style={styles.installationDate}> {machine.coolingCapacity ||  'No disponible'}</Text>
          <Text style={styles.title}>Calorias:</Text>
          <Text style={styles.installationDate}> {machine.heatingCapacity ||  'No disponible'}</Text>
          <Text style={styles.title}>Refrigerante:</Text>
          <Text style={styles.installationDate}> {machine.condensadora ||  'No disponible'}</Text>
              <Text style={styles.title}>Capacidad (Frigorías):</Text>
              <Text style={styles.installationDate}>{machineInfo.historyMaintenance.frigorias || 'No disponible'}</Text>
              <Text style={styles.title}>Tipo de Gas:</Text>
              <Text style={styles.installationDate}>{machine.additionalInfo?.gasType || 'No disponible'}</Text>
            </>
          )}

          {machineInfo.type === "Caldera" && (
            <>
              <Text style={styles.title}>Potencia (kW):</Text>
              <Text style={styles.installationDate}>{machine.additionalInfo?.power || 'No disponible'}</Text>
              <Text style={styles.title}>Combustible:</Text>
              <Text style={styles.installationDate}>{machine.additionalInfo?.fuelType || 'No disponible'}</Text>
            </>
          )}

          {machineInfo.type === "Refrigerador" && (
            <>
              <Text style={styles.title}>Temperatura Mínima (°C):</Text>
              <Text style={styles.installationDate}>{machine.additionalInfo?.minTemp || 'No disponible'}</Text>
              <Text style={styles.title}>Temperatura Máxima (°C):</Text>
              <Text style={styles.installationDate}>{machine.additionalInfo?.maxTemp || 'No disponible'}</Text>
            </>
          )}

          {machineInfo.type === "AutoElevador" && (
            <>
              <Text style={styles.title}>Capacidad de Carga (kg):</Text>
              <Text style={styles.installationDate}>{machine.additionalInfo?.loadCapacity || 'No disponible'}</Text>
              <Text style={styles.title}>Altura Máxima (m):</Text>
              <Text style={styles.installationDate}>{machine.additionalInfo?.maxHeight || 'No disponible'}</Text>
            </>
          )}

          {/* Agrega más condiciones para otros tipos de máquinas */}
        </View>


        {/* Información del Mantenimiento */}
        <View style={styles.card}>
          {machine?.maintenanceHistory?.[0] ? (
            <>
              <Text style={styles.sectionTitle}>Info. Último Mantenimiento</Text>
              <Text style={styles.infoLabel}>Fecha de Último Mantenimiento:</Text>
              <Text style={styles.info}>
              {machineInfo.lastMaintenance ||  'No disponible'}
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
            onPress={() => openWhatsApp('+541141651335', whatsappMessage)}
          >
            <Ionicons style={styles.icon} name="logo-whatsapp" color="white" size={25} />
            <Text style={styles.buttonText}>Enviar Mensaje</Text>
          </TouchableOpacity>
        )}

        </View>

        {/* Botón de Imprimir con Modal */}
        <TouchableOpacity style={styles.printButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="print-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Imprimir</Text>
        </TouchableOpacity>
      </View>

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


export default MachineDetailsScreen;
