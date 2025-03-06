import React, { useState, useEffect } from 'react';
import { View, Alert, Text, FlatList, StyleSheet, TouchableOpacity, Animated,Modal } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import styles from './styles';
import Screen1 from '../Screen1/Screen1';
import Screen2 from '../Screen2/Screen2';



const API_URL = 'https://rosensteininstalaciones.com.ar/api';

const HomeScreen = () => {
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false); 
  const [modalIsVisible, setModalIsVisible] = useState(false); 
  const [permission, requestPermission] = useCameraPermissions(); 
  const navigation = useNavigation(); // Agregar navegación

  async function handleOpenCamera() {
    try{
      const {granted} = await requestPermission()

      if(!granted){
        return Alert.alert("Camara","Necesita habilitar el uso de la camara")
      }

      setModalIsVisible(true)
    }catch(error){
      console.log(error)
    }
    
  }

  async function handleBarCodeScanned({ data }) {
    if (scanned) return; // Evita escanear múltiples veces
  
    console.log("Código escaneado:", data);
  
    const match = data.match(/SN\d{6}/);
    if (!match) {
      Alert.alert("Error", "Formato de código QR inválido.");
      return;
    }
  
    const serialNumber = match[0];
    console.log("Número de serie extraído:", serialNumber);
  
    try {
      setScanned(true); // Evita múltiples escaneos
      setModalIsVisible(false); // Cierra la cámara inmediatamente
      
      const response = await fetch(`https://rosensteininstalaciones.com.ar/api/machines/serial/${serialNumber}`);
      const result = await response.json();
      const id = result.machineId;
  
      if (response.ok) {
        console.log("Machine ID encontrado:", id);
  
        if (!result.machineId) {
          Alert.alert("Error", "El servidor no devolvió un ID válido.");
          return;
        }
  
        navigation.navigate("MachineDetails", { id: id });
  
      } else {
        Alert.alert("Error", result.message || "No se encontró la máquina.");
      }
    } catch (error) {
      console.error("Error al obtener el ID de la máquina:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    } finally {
      setScanned(false); // Permitir nuevos escaneos después de completar la navegación
    }
  }
  
  const _renderIcon = (routeName, selectedTab) => {
    let icon = '';
    switch (routeName) {
      case 'Rosenisten Instalaciones - Inicio':
        icon = 'home-outline';
        break;
      case 'Rosenisten Instalaciones - Ajustes':
        icon = 'settings-outline';
        break;
    }
    return (
      <Ionicons
        name={icon}
        size={25}
        color={routeName === selectedTab ? '#1D1936' : 'gray'}
      />
    );
  };

  const renderTabBar = ({ routeName, selectedTab, navigate }) => (
    <TouchableOpacity onPress={() => navigate(routeName)} style={styles.tabbarItem}>
      {_renderIcon(routeName, selectedTab)}
    </TouchableOpacity>
  );
  return (
    <View style={{ flex: 1 }}>
      <CurvedBottomBarExpo.Navigator
        type="DOWN"
        style={styles.bottomBar}
        shadowStyle={styles.shawdow}
        height={55}
        circleWidth={50}
        bgColor="white"
        initialRouteName="Rosenisten Instalaciones - Inicio"
        borderTopLeftRight
        screenOptions={{ headerStatusBarHeight:-80 }} //Aca se esconde el header.
        renderCircle={({ selectedTab, navigate }) => (
          <Animated.View style={styles.btnCircleUp}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={handleOpenCamera}
            >
              <Ionicons name={'qr-code-outline'} color="#1D1936" size={25} />
            </TouchableOpacity>
          </Animated.View>
        )}
        tabBar={renderTabBar}
      >
        <CurvedBottomBarExpo.Screen
          name="Rosenisten Instalaciones - Inicio"
          position="LEFT"
          component={Screen1}
        />
        <CurvedBottomBarExpo.Screen
          name="Rosenisten Instalaciones - Ajustes"
          position="RIGHT"
          component={Screen2}
        />
      </CurvedBottomBarExpo.Navigator>

          <Modal visible={modalIsVisible} style={{flex:1}}>
            <CameraView
              style={{flex:1}}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalIsVisible(false)}>
              <Ionicons name="close-circle-outline" size={50} color="white" />
            </TouchableOpacity>
            </CameraView>
          </Modal>
    </View>
  );
};

export default HomeScreen;