import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const OrdersList = () => {
  const [clientes, setClientes] = useState([]); // Asegúrate de que clientes esté inicializado como un array
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const navigation = useNavigation();
  // Cargar órdenes y clientes desde el backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://ec2-44-211-67-52.compute-1.amazonaws.com:5000/api/trabajos/equipo/67326de1b8efe0bc08448a8e');
        setOrders(response.data);
        setFilteredOrders(response.data); // Inicializar filteredOrders
      } catch (error) {
        console.error(error);
      }
    };
    
    const fetchClientes = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await axios.get("http://ec2-44-211-67-52.compute-1.amazonaws.com:5000/api/users/user/6701bff10ad8a3d2d030bcc8", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Asegurarse de que setClientes reciba un array
        setClientes(Array.isArray(response.data) ? response.data : [response.data]);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchOrders();
    fetchClientes();
  }, []);

  // Función para combinar clientes y órdenes
  const combineOrdersWithClients = (ordersData) => {
    return ordersData.map(order => {
      // Verifica que clientes es un array antes de usar .find
      const cliente = Array.isArray(clientes) 
        ? clientes.find(client => String(client._id) === String(order.cotizacionId.clienteId)) 
        : null;
      return {
        ...order,
        clientName: cliente?.username || "Desconocido",
        clientAddress: cliente
          ? `${cliente.direccion.calle} ${cliente.direccion.numero}, ${cliente.direccion.ciudad}, ${cliente.direccion.provincia}, ${cliente.direccion.codigoPostal}`
          : "Sin dirección",
      };
    });
  };

  // Aplicar el filtro de órdenes y combinar datos
  const filterOrders = (status) => {
    setSelectedFilter(status);
    const filtered = status === 'all' ? orders : orders.filter(order => order.estado === status);
    const combinedFilteredOrders = combineOrdersWithClients(filtered);
    setFilteredOrders(combinedFilteredOrders);
  };

  // Actualizar la lista combinada inicial después de obtener clientes
  useEffect(() => {
    if (orders.length > 0 && Array.isArray(clientes) && clientes.length > 0) {
      const combinedInitialOrders = combineOrdersWithClients(orders);
      setFilteredOrders(combinedInitialOrders);
    }
  }, [orders, clientes]);

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("DetallesTrabajo", { trabajo: item })}
    >
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#ddd' }}>
        <Text style={styles.info}>Cliente: {item.clientName || "Desconocido"}</Text>
        <Text style={styles.info}>Dirección: {item.clientAddress || "Sin dirección"}</Text>
        <Text style={styles.info}>Estado: {item.estado}</Text>
        <Text style={styles.info}>Fecha: {new Date(item.fechaAsignacion).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const ChipButton = ({ title, status }) => (
    <TouchableOpacity
      onPress={() => filterOrders(status)}
      style={{
        height: 30,
        paddingVertical: 4,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: selectedFilter === status ? 'black' : 'white',
        borderWidth: 1,
        borderColor: 'black',
        marginHorizontal: 4,
      }}
    >
      <Text style={{ color: selectedFilter === status ? 'white' : 'black' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Órdenes de Trabajo</Text>
      
      <FlatList
        data={[
          { title: 'Todas', status: 'all' },
          { title: 'Pendiente', status: 'pendiente' },
          { title: 'En Progreso', status: 'en progreso' },
          { title: 'Completadas', status: 'completado' },
          { title: 'No Completado', status: 'no completado' },
          { title: 'Reprogramado', status: 'reprogramado' },
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.status}
        renderItem={({ item }) => (
          <ChipButton title={item.title} status={item.status} />
        )}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id.toString()}
        ListEmptyComponent={<Text style={styles.info}>No hay órdenes disponibles.</Text>}
      />
    </View>
  );
};

export default OrdersList;

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
});
