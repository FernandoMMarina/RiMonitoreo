import React, { useState, useEffect } from 'react';
import { View, Alert, Text, FlatList, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Camera } from 'expo-camera';
import styles from './styles';
import Constants from 'expo-constants';
import ClientMachines from '../ClientMachines/ClientMachines';
import { ScrollView } from 'react-native-gesture-handler';
import MaintenanceVisitStatus from '../MaintenanceVisitStatus/MaintenanceVisitStatus';
import MachineTypeCards from './card/MachineTypeCard';

const API_URL = 'https://rosensteininstalaciones.com.ar/api';

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
  const [gender, setGender] = useState('');
  const [role, setRole]= useState('');
  const [idCliente, setIdCliente] = useState([]);
  const [lastMaintenances, setLastMaintenances] = useState([]);
  

  const groupMachinesByType = (machines) => {
    return machines.reduce((acc, machine) => {
      const { type } = machine;
      if (type) {
        acc[type] = (acc[type] || 0) + 1; // Incrementar la cantidad
      }
      return acc;
    }, {});
  };
  

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Rosenstein Instalaciones",
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
      let url = `${API_URL}/users/users?role=user`;
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
        if (token && idCliente) {
          const response = await axios.get(`${API_URL}/machines/user/${idCliente}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Lista de Máquinas:", response.data.data);
          setMaquinas(response.data || []); // Asegúrate de manejar null o undefined
        } else {
          console.log('Token o idCliente no encontrado');
        }
      } catch (error) {
        console.error('Error al obtener las máquinas:', error);
      }
    };
    fetchData();
    loadRecentSearches(); // Cargar búsquedas recientes al iniciar
  }, [searchText,idCliente]);

  const filteredClientes = Array.isArray(clientes)
  ? clientes.filter((client) =>
      client.name && client.name.toLowerCase().includes(searchText.toLowerCase())
    )
  : [];

  // Guardar búsqueda en AsyncStorag
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

  useEffect(() => {
    const fetchUserAndMaintenance = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Solicita el perfil del usuario
          const response = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const { id, username, email, gender, role: userRole } = response.data;
  
          // Actualiza los estados relevantes
          setIdCliente(id);
          setUsername(username);
          setEmail(email);
          setGender(gender);
          setRole(userRole); // Actualiza el rol del usuario
  
          console.log("Perfil actualizado:", response.data);
  
          // Llama a `fetchLastMaintenances` después de actualizar `idCliente`
          await fetchLastMaintenances(id, token);
        } else {
          console.log('Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener el perfil y los mantenimientos:', error);
      }
    };
  
    fetchUserAndMaintenance();
  }, []);  
  
  // Pedir permisos de la cámara para el escáner de códigos QR
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    try {
      const machineInfo = JSON.parse(data);
      const machineId = machineInfo._id;
      const machine = await searchMachineById(machineId);
      saveSearch({
        id: machine._id,
        name: machine.name,
        lastMaintenance: machine.lastMaintenance,
      });
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      Alert.alert('Error', 'Formato de datos QR incorrecto');
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


const renderMaintenanceItem = ({ item }) => {
  // Función para determinar el color según el estado
  const getChipStyle = (estado) => {
    switch (estado) {
      case 'completado':
        return { backgroundColor: 'green', color: 'white' };
      case 'pendiente':
        return { backgroundColor: 'orange', color: 'white' };
      case 'cancelado':
        return { backgroundColor: 'red', color: 'white' };
      default:
        return { backgroundColor: 'gray', color: 'white' };
    }
  };

  const chipStyle = getChipStyle(item.estado);

  return (
    <View style={styles.card}>
      <Text style={styles.titleCard}>Equipo: {item.maquinaId}</Text>
      <Text style={styles.subTitle}>
        Fecha: {new Date(item.fechaInicio).toLocaleDateString()}
      </Text>
      <Text style={styles.subTitle}>Tipo de Trabajo: {item.tipoDeTrabajo}</Text>
      <Text style={styles.subTitle}>Descripción: {item.description}</Text>
      <View style={[styles.chip, { backgroundColor: chipStyle.backgroundColor }]}>
        <Text style={[styles.chipText, { color: chipStyle.color }]}>
          {item.estado.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};


const clearSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]); // Limpiar el estado de las búsquedas recientes
    } catch (error) {
      console.error('Error al limpiar las búsquedas recientes:', error);
    }
  };

const fetchClientMachines = async (machineIds) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado');
        return [];
      }
  
      const machineRequests = machineIds.map(id => axios.get(`${API_URL}/machines/user/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` }
      }));
  
      const machineResponses = await Promise.all(machineRequests);
      const machines = machineResponses.map(response => response.data);
  
      // Filtra las máquinas válidas y asegúrate de que tienen las propiedades necesarias
      return machines.filter(machine => machine && machine._id && machine.name);
    } catch (error) {
      console.error('Error al obtener las máquinas del cliente:', error);
      return [];
    }
  };

  const fetchLastMaintenances = async (clienteId, token) => {
    try {
      if (!clienteId) {
        console.log('fetchLastMaintenances: idCliente no definido');
        return;
      }
  
      const response = await axios.get(`${API_URL}/trabajos/clientes/${clienteId}/servicios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data && Array.isArray(response.data)) {
        const completedMaintenances = response.data.filter(
          (maintenance) => maintenance.estado === "completado"
        );
  
        const orderedMaintenances = completedMaintenances.sort(
          (a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)
        );
  
        console.log('Mantenimientos completados obtenidos:', orderedMaintenances.length);
        setLastMaintenances(orderedMaintenances);
      } else {
        console.log('fetchLastMaintenances: No se encontraron mantenimientos recientes.');
      }
    } catch (error) {
      console.error('fetchLastMaintenances: Error al obtener los últimos mantenimientos:', error);
    }
  };
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await AsyncStorage.getItem('token');
      if (token && idCliente) {
        console.log('Actualizando mantenimientos...');
        await fetchLastMaintenances(idCliente, token);
      }
    }, 60000); // Actualizar cada minuto
  
    return () => clearInterval(interval);
  }, [idCliente]);
    
  // Suponiendo que `visits` es una lista de visitas que puedes obtener de tu API o de algún estado en `Screen1`
// Visitas programadas de ejemplo:
const scheduledVisits = [
  { date: '2024-12-29T00:00:00.000Z' },
  { date: '2024-12-31T00:00:00.000Z' },
];
  
  const Screen1 = () => {
    return (
      <View style={styles.container}>
        <ScrollView>
        {/* Siempre muestra el saludo */}
        <Text style={styles.titleCScreen1}>
          <Text style={{ fontWeight: 'bold' }}>
            {gender === 'female' ? '¡Bienvenida! ' : '¡Bienvenido! '}
          </Text>
          <Text>{username}</Text>
        </Text>
        {role === 'user' ? (
          <View>
            <MaintenanceVisitStatus visits={scheduledVisits} />
            <View>
            <Text style={styles.titleMaquinas}>Mantenimiento de mis equipos</Text>
            <View style={{flexDirection:'row'}}>
            <MachineTypeCards machines={maquinas || []} navigation={navigation} />
            </View>
            </View> 
            <View>
              <Text style={styles.titleMaquinas}>Últimos mantenimientos</Text>
              {lastMaintenances.length === 0 ? (
                <View style={styles.card}>
                  <Text style={{color:"black"}}>No hay mantenimientos recientes disponibles.</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => navigation.navigate('MaintenanceDetails', { maintenance: item })}>
                    <FlatList
                    data={lastMaintenances}
                    renderItem={renderMaintenanceItem}
                    keyExtractor={(item) => item._id.toString()}
                    contentContainerStyle={{ padding: 10 }}
                  />
                </TouchableOpacity>
              )}
            </View>


          </View>
          

      ) : role === 'technical'|| 'admin' ? (
        <View>
          <Text style={styles.titleMaquinas} >Tareas de hoy</Text>
        </View>

      ) : null}

        {/* Condicional para mostrar contenido según el rol */}
        {role === 'user' ? (
          // Mostrar solo el ScrollView si el rol es "user"
          <ScrollView
            style={{ marginTop: 20 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          >
            <ClientMachines clientId={idCliente} />
          </ScrollView>
        ) : role === 'technical' ? (
          // Mostrar el resto del contenido si el rol es "technical"
          <ScrollView
            style={{ marginTop: 20 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          >
            <View style={{ height: 200 }}>
              {clientes.length === 0 ? (
                <View style={styles.card}>
                  <Text
                    style={{
                      color: '#161616',
                      fontWeight: 'bold',
                      fontSize: 18,
                      marginTop: 0,
                      marginBottom: 50,
                    }}
                  >
                    No hay Clientes con ese nombre, realiza otra búsqueda...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={clientes}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={async () => {
                        if (item.machines && item.machines.length > 0) {
                          const machineDetails = await fetchClientMachines(item.machines);
                          navigation.navigate('MachinesList', { machines: machineDetails });
                        } else {
                          Alert.alert('No hay máquinas', 'Este cliente no tiene máquinas registradas.');
                        }
                      }}
                    >
                      <View style={styles.card}>
                        <Text style={styles.titleCard}>{item.username}</Text>
                        <Text style={styles.subTitle}>
                          Número de Máquinas: {item.machines.length}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item._id.toString()}
                />
              )}
            </View>
  
            <View style={styles.recentSearchHeader}>
              <Text style={styles.title}>Búsquedas Recientes</Text>
              <TouchableOpacity onPress={clearSearches}>
                <Text style={styles.clearButtonText}>LIMPIAR</Text>
              </TouchableOpacity>
            </View>
  
            {recentSearches.length === 0 ? (
              <View style={styles.card}>
                <Text
                  style={{
                    color: '#161616',
                    fontWeight: 'bold',
                    fontSize: 18,
                    marginTop: 0,
                    marginBottom: 50,
                  }}
                >
                  No hay búsquedas recientes...
                </Text>
              </View>
            ) : (
              <FlatList
                data={recentSearches}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('MachineDetails', { machine: item })}
                  >
                    <View style={styles.card}>
                      <Text style={styles.titleCard}>{item.name}</Text>
                      <Text style={styles.subTitle}>
                        Último mantenimiento: {item.lastMaintenance}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) =>
                  item.machineId ? item.machineId.toString() : Math.random().toString()
                }
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </ScrollView>
        ) : null}
        </ScrollView>
      </View>
    );
  };
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await AsyncStorage.getItem('token');
      if (token && idCliente) {
        await fetchLastMaintenances(idCliente, token);
      }
    }, 60000); // Cada minuto
  
    return () => clearInterval(interval);
  }, [idCliente]); // Ejecuta el intervalo solo cuando `idCliente` cambie

  
  useEffect(() => {
    console.log("Valor actualizado de idCliente:", idCliente);
  }, [idCliente]);
  

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
          <Text style={styles.usernameText}>Contraseña: ****** </Text>
          
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
        screenOptions={{ headerStatusBarHeight:-80 }} //Aca se esconde el header.
        renderCircle={({ selectedTab, navigate }) => (
          <Animated.View style={styles.btnCircleUp}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => {
                setShowScanner(!showScanner);
                setScanned(false); // Reiniciar el estado al abrir el escáner.
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

      {showScanner && (
      <View style={styles.scannerContainer}>
        {hasPermission === null && <Text>Solicitando permiso para usar la cámara...</Text>}
        {hasPermission === false && (
          <Text>No tienes permiso para usar la cámara. Por favor, habilítalo en configuraciones.</Text>
        )}
        {hasPermission === true && (
          <Camera
            style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        )}
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanner(false)}>
          <Ionicons name="close-circle-outline" size={50} color="white" />
        </TouchableOpacity>
      </View>
    )}
    </View>
  );
}



export default HomeScreen;
