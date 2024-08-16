import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Alert, Text, FlatList, StyleSheet, Image, TouchableOpacity, Pressable, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BarCodeScanner } from 'expo-barcode-scanner';

function HomeScreen({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [cantidad, setCantidad] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false); 

  // Funciones para manejar la cantidad y agregar al carrito
  const handleIncrement = () => setCantidad(cantidad + 1);
  const handleDecrement = () => cantidad > 0 && setCantidad(cantidad - 1);
  const handleAddToCart = () => { /* Lógica para agregar al carrito */ };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://ec2-50-16-74-81.compute-1.amazonaws.com:5000/api/products/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProductos(response.data.data);
        } else {
          console.log('Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    try {
        // Asegúrate de que 'data' es una cadena JSON y luego parsea
        const userInfo = JSON.parse(data);
        
        // Log para verificar que está bien parseado
        console.log(userInfo);

        // Ahora, extrae el ID del usuario
        const userId = userInfo._id;
        
        // Verifica que el ID se ha extraído correctamente
        console.log("User ID:", userId);

        // Realiza la búsqueda del usuario por ID
        searchUserById(userId);

    } catch (error) {
        console.error("Error parsing QR code data:", error);
    }
};

  const searchUserById = async (id) => {
    try {
      const response = await fetch(`http://ec2-50-16-74-81.compute-1.amazonaws.com:5000/api/users/user/${id}`);
      const user = await response.json();
      if (response.ok) {
        // Navega a una pantalla con la información del usuario o realiza alguna acción
       // navigation.navigate('UserDetail', { user });
       alert.alert("Datos",{user})
      } else {
        Alert.alert('Usuario no encontrado', `Usuario no encontrado: ${user.message}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al buscar el usuario');
    }
  };

  const renderProducts = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row" }}>
        <Image source={{ uri: item.attributes.imageUrl }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.title}>{item.attributes.name}</Text>
          <Text style={styles.stockText}>Stock</Text>
          <Text style={styles.price}>${item.attributes.price.toString()}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", height: 50 }}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={handleDecrement}>
            <AntDesign name="minuscircle" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{cantidad}</Text>
          <TouchableOpacity onPress={handleIncrement}>
            <AntDesign name="pluscircle" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Pressable onPress={handleAddToCart} style={styles.addButton}>
          <Text style={styles.addButtonText}>Agregar</Text>
        </Pressable>
      </View>
    </View>
  );

  const Screen1 = () => (
    <View style={styles.container}>
      <Text style={{ color: "#FFF", fontSize: 20, marginTop: 30 }}>Busquedas Recientes</Text>
      <FlatList
        data={productos}
        renderItem={renderProducts}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );

  const Screen2 = () => (
    <View style={styles.screen2} />
  );

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
        screenOptions={{headerStatusBarHeight:-156}}
        renderCircle={({ selectedTab, navigate }) => (
          <Animated.View style={styles.btnCircleUp}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => setShowScanner(!showScanner)} // Alterna el estado al presionar el botón
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
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {hasPermission === null && <Text>Requesting for camera permission</Text>}
      {hasPermission === false && <Text>No access to camera</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  // ... tus estilos existentes
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: '#1D1936',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  flatListContent: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#D3C3B9',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 16,
    borderRadius: 8,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  stockText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    color: "#197008"
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 13,
    marginRight: 5,
    height: 50,
    width: 100
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  price: {
    fontSize: 20,
    marginTop: 5,
    marginBottom: 5
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
    width: 100,
    height: 50
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  bottomBar: {
    backgroundColor: '#1D1936',
  },
  btnCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    bottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  btnCircleUp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },
  imgCircle: {
    width: 30,
    height: 30,
    tintColor: 'gray',
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: 30,
    height: 30,
  },
  screen1: {
    flex: 1,
    backgroundColor: '#BFEFFF',
  },
  screen2: {
    flex: 1,
    backgroundColor: '#FFEBCD',
  }, shawdow: {
    shadowColor: '#DDDDDD',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomBar: {},
});

export default HomeScreen;
