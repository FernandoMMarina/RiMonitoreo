import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders, selectFilteredOrders } from '../../redux/slices/ordersSlice';
import { useNavigation } from '@react-navigation/native';

const OrdersList = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Obtener ID del técnico desde el perfil del usuario
  const { profile } = useSelector((state) => state.user);
  const tecnicoId = profile?.id;

  // Obtener datos desde Redux
  const filteredOrders = useSelector((state) => selectFilteredOrders(state, selectedFilter));
  console.log(filteredOrders);
  const { loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (tecnicoId) {
      dispatch(fetchOrders(tecnicoId));
    }
  }, [dispatch, tecnicoId]);

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('DetallesTrabajo', { trabajo: item })}>
      <View style={styles.orderItem}>
        <Text style={styles.info}>ID Orden: {item._id}</Text>
        <Text style={styles.info}>Estado: {item.estado}</Text>
        <Text style={styles.info}>Fecha: {new Date(item.fechaInicio).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const ChipButton = ({ title, status }) => (
    <TouchableOpacity
      onPress={() => setSelectedFilter(status)}
      style={[
        styles.chipButton,
        selectedFilter === status && styles.chipButtonSelected,
      ]}
    >
      <Text style={[
        styles.chipButtonText,
        selectedFilter === status && styles.chipButtonTextSelected,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.info}>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.info, { color: 'red' }]}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Órdenes de Trabajo</Text>
      <View>

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
        renderItem={({ item }) => <ChipButton title={item.title} status={item.status} />}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      />
      </View>
      <View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => String(item._id)}
        ListEmptyComponent={<Text style={styles.info}>No hay órdenes disponibles.</Text>}
      />
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginVertical: 5,
    color: 'black',
  },
  orderItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    marginTop:20
  },
  chipButton: {
    height: 30,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'black',
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  chipButtonSelected: {
    backgroundColor: 'black',
  },
  chipButtonText: {
    color: 'black',
  },
  chipButtonTextSelected: {
    color: 'white',
  },
});
