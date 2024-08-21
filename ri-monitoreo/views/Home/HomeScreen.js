import React, { useState, useEffect } from 'react';
import { View, Alert, Text, FlatList, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import styles from './styles';

function HomeScreen({ navigation }) {
  const [maquinas, setMaquinas] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false); 
  const [username, setUsername] = useState('');

  // Obtener lista de máquinas al cargar la pantalla
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://ec2-50-16-74-81.compute-1.amazonaws.com:5000/api/machines', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMaquinas(response.data.data);
        } else {
          console.log('Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener las maquinas:', error);
      }
    };
    fetchData();
  }, []);

  // Obtener datos del perfil de usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://ec2-50-16-74-81.compute-1.amazonaws.com:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsername(response.data.username);
        } else {
          console.log('Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
      }
    };
    fetchUser();
  }, []);

  // Pedir permisos de la cámara para el escáner de códigos QR
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Manejar la lectura del código QR
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true); // Detener el escáner hasta que lo reiniciemos
    try {
      const machineInfo = JSON.parse(data);
      const machineId = machineInfo._id;
      await searchMachineById(machineId); // Buscar la máquina por ID
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      Alert.alert("Error", "Formato de datos QR incorrecto");
    }
  };

  // Buscar la máquina por ID
  const searchMachineById = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://ec2-50-16-74-81.compute-1.amazonaws.com:5000/api/machines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        const machine = response.data;
        // Navegar a la pantalla MachineDetailsScreen y pasar la información de la máquina
        navigation.navigate('MachineDetails', { machine });
      } else {
        Alert.alert('Máquina no encontrada', `No se pudo encontrar la máquina con ID: ${id}`);
      }
    } catch (error) {
      console.error('Error al buscar la máquina:', error);
      Alert.alert('Error', 'Hubo un problema al buscar la máquina.');
    } finally {
      setScanned(false); // Reiniciar el escáner después de la búsqueda
    }
  };

  // Renderizar la lista de máquinas
  const renderMaquinas = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row" }}>
        <View style={styles.details}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.stockText}>Último Mantenimiento: {item.lastMaintenance}</Text>
          <Text style={styles.installationDate}>Fecha de Instalación: {item.installationDate}</Text>
        </View>
      </View>
    </View>
  );

  const Screen1 = () => (
    <View style={styles.container}>
      <Text style={{ color: "#FFF", fontSize: 20, marginTop: 110 }}>Bienvenido! {username}</Text>
      <Text style={{ color: "#FFF", fontSize: 20, marginTop: 20 }}>Búsquedas Recientes</Text>
      <FlatList
        data={maquinas}
        renderItem={renderMaquinas}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );

  const Screen2 = () => (
    <View style={styles.screen2} >
      <Text style={{flex: 1, marginTop: 100, marginLeft: 50, fontSize: 20, color: "#161616"}}>Nombre de usuario: {username}</Text>
    </View>
  );

  // Iconos para las pestañas
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

  // Renderizar la barra de pestañas
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
        screenOptions={{headerStatusBarHeight: 0}}
        renderCircle={({ selectedTab, navigate }) => (
          <Animated.View style={styles.btnCircleUp}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => {
                setShowScanner(!showScanner);
                setScanned(false); // Reiniciar el estado al abrir el escáner
              }} 
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
          component={Screen2}
          position="RIGHT"
        />
      </CurvedBottomBarExpo.Navigator>

      {showScanner && hasPermission && (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanner(false)}>
            <Ionicons name="close-circle-outline" size={50} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {hasPermission === null && <Text>Solicitando permiso para usar la cámara</Text>}
      {hasPermission === false && <Text>No tienes acceso a la cámara</Text>}
    </View>
  );
}

export default HomeScreen;
