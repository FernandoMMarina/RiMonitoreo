import React, { useState, useEffect } from 'react';
import { View, Alert, Text, FlatList, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import styles from './styles';
import Constants from 'expo-constants';


function HomeScreen({ navigation}) {
  const [maquinas, setMaquinas] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false); 
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [searchText, setSearchText] = useState('');



 
  useEffect(() => {
    navigation.setOptions({
      headerTitle: "HomeScreen",
      headerSearchBarOptions: {
        placeholder: "Clientes",
        color: "#161616",
        // @ts-ignore
        onChangeText: (event) => {
          const text = event.nativeEvent.text;
          console.log('Texto ingresado en la búsqueda:', text);
          
          setSearchText((prevText) => {
            console.log('Texto anterior:', prevText); 
            return text;  // Actualiza correctamente el estado
          });
        },
      },
    });
  }, [navigation]);
  
  useEffect(() => {
    if (searchText.trim() !== "") {
      console.log('Estado actualizado, llamando a fetchClients:', searchText);
      fetchClients(searchText); // Llama a la función para buscar clientes
    }
  }, [searchText]);
  
   // Función para buscar clientes
   const fetchClients = async (text) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token obtenido:', token); // Verifica si el token se obtiene correctamente
      if (!token) {
        console.log('No se encontró el token');
        return;
      }
      let url = `http://ec2-50-16-74-81.compute-1.amazonaws.com:5000/api/users/users?role=client`;
      if (text) {
        url += `&name=${text}`;
      }
      console.log('URL construida:', url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Respuesta de clientes:', response.data);
      setClientes(response.data || []);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
    }
  };
  
  // Obtener el texto de búsqueda de los params, o una cadena vacía si no está definido
  //const searchText = route.params?.searchText || '';
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
    loadRecentSearches(); // Cargar búsquedas recientes al iniciar
  }, [searchText]);

  
  const filteredClientes = Array.isArray(clientes)
  ? clientes.filter((client) =>
      client.name && client.name.toLowerCase().includes(searchText.toLowerCase())
    )
  : [];

  // Guardar búsqueda en AsyncStorage
 
const saveSearch = async (machine) => {
  try {
    const storedSearches = await AsyncStorage.getItem('recentSearches');
    let searches = storedSearches ? JSON.parse(storedSearches) : [];

    // Filtrar los duplicados antes de agregar la nueva búsqueda
    searches = searches.filter(search => search.machineId !== machine._id);

    // Limitar a 5 búsquedas recientes
    if (searches.length >= 5) {
      searches.pop(); // Eliminar la búsqueda más antigua
    }

    // Agregar la nueva búsqueda al inicio con todos los detalles de la máquina
    searches.unshift(machine); // Ahora todo el objeto de la máquina será almacenado

    await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
    setRecentSearches(searches); // Actualizar el estado
  } catch (error) {
    console.error('Error al guardar búsqueda:', error);
  }
};


  

  // Cargar búsquedas recientes de AsyncStorage
  const loadRecentSearches = async () => {
    try {
      const storedSearches = await AsyncStorage.getItem('recentSearches');
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error('Error al cargar búsquedas recientes:', error);
    }
  };

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
          setEmail(response.data.email); 
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
      const machine = await searchMachineById(machineId); // Buscar la máquina por ID
      // Guardar búsqueda en AsyncStorage
      saveSearch({ 
        id: machine._id,
        name: machine.name,
        lastMaintenance: machine.lastMaintenance 
      });
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      Alert.alert("Error", "Formato de datos QR incorrecto");
    }
  };

  // Buscar la máquina por ID
  const searchMachineById = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/machines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        const machine = response.data;
        navigation.navigate('MachineDetails', { machine });
        return machine; // Devolver la máquina encontrada
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

  // Renderizar la lista de búsquedas recientes
const renderRecentSearches = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.titleCard}>{item.name}</Text>
    <Text style={styles.subTitle}>Último Mantenimiento: {item.lastMaintenance}</Text>
    <Text style={styles.subTitle}>Frigorías: {item.frigorias}</Text>
    <Text style={styles.subTitle}>Ubicación: {item.location}</Text>
    {/* Puedes seguir agregando otros campos que hayas guardado */}
  </View>
);


  const clearSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]); // Limpiar el estado de las búsquedas recientes
    } catch (error) {
      console.error('Error al limpiar las búsquedas recientes:', error);
    }
  };

  

  const Screen1 = () => (
  <View style={styles.container}>
    <Text style={{ color: "#FFF", fontSize: 30, marginTop: 110, marginLeft: 60 }}>
      Bienvenido! {username}
    </Text>

    <View style={{height: 200}}>
  {clientes.length === 0 ? (
    <Text style={{ color: "#FFF", fontSize: 18, marginTop: 20 }}>
      No hay Clientes con ese nombre
    </Text>
  ) : (
    <FlatList
      data={clientes}
      renderItem={({ item }) => (
        <TouchableOpacity
            onPress={() => {
              navigation.navigate('MachinesList', { machines: item.machines });
            }}
          >
            <View style={styles.card}>
              <Text style={styles.titleCard}>{item.username}</Text>
              <Text style={styles.subTitle}>Número de Máquinas: {item.machines.length}</Text>
            </View>
          </TouchableOpacity>
      )}
      keyExtractor={(item) => item._id.toString()}
    />
  )}
</View>


    {/* Contenedor para "Búsquedas Recientes" y "Limpiar" */}
    <View style={styles.recentSearchHeader}>
      <Text style={styles.title}>Búsquedas Recientes</Text>
      <TouchableOpacity onPress={clearSearches}>
        <Text style={styles.clearButtonText}>LIMPIAR</Text>
      </TouchableOpacity>
    </View>

    {recentSearches.length === 0 ? (
      <Text style={{ color: "#FFF", fontSize: 18, marginTop: 20 }}>
        No hay búsquedas Recientes
      </Text>
    ) : (
      <FlatList
        data={recentSearches}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('MachineDetails', { machine: item })}
          >
            {console.log("Los datos son : "+ JSON.stringify(item))}
            <View style={styles.card}>
              <Text style={styles.titleCard}>{item.name}</Text>
              <Text style={styles.subTitle}>Último mantenimiento: {item.lastMaintenance}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => (item.machineId ? item.machineId.toString() : Math.random().toString())}
        contentContainerStyle={styles.flatListContent}
      />
    )}
  </View>
);

  
  const getInitials = (name) => {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase();
    return initials.length > 2 ? initials.slice(0, 2) : initials; // Limitar a 2 caracteres
  };

  const Screen2 = () => {
    const initials = getInitials(username);

    return (
      <View style={styles.screen2}>
        <View style={styles.profileContainer}>
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
          <Text style={styles.usernameText}>{username}</Text>
          <Text style={styles.usernameText}>Nombre de usuario: {username}</Text>
          <Text style={styles.usernameText}>Mail: {email}</Text>
          <Text style={styles.usernameText}>Contraseña: {email}</Text>
          
        </View>
      </View>
    );
  };

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
        screenOptions={{ headerStatusBarHeight: 0 }}
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
          position="RIGHT"
          component={Screen2}
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
