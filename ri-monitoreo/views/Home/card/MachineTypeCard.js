import React from 'react';
import styles from './styles'; 
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, FlatList,TouchableOpacity } from 'react-native';


// Componente para renderizar cada card
const MachineCard = ({ type, count, navigation, machines }) => {
  const getIcon = () => {
    switch (type) {
      case 'Aire Acondicionado':
        return <Ionicons name="snow-outline" size={50} color="#1E90FF" />;
      case 'Caldera':
        return <Ionicons name="flame-outline" size={50} color="#FF4500" />;
      default:
        return <Ionicons name="cube-outline" size={50} color="#888" />;
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('MachineDetails', {
          machines: machines.filter((machine) => machine.type === type), // Filtra por tipo
          type: type, // Título de la vista
        })
      }
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{type}</Text>
          <Text style={styles.subTitle}>Cantidad: {count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};


const MachineTypeCards = ({ machines, navigation }) => {
  const groupMachinesByType = (machines) => {
    return machines.reduce((acc, machine) => {
      const { type } = machine;
      if (type) {
        acc[type] = (acc[type] || 0) + 1; // Incrementa la cantidad
      }
      return acc;
    }, {});
  };

  const groupedMachines = groupMachinesByType(machines);

  return (
    <FlatList
      data={Object.entries(groupedMachines)}
      renderItem={({ item }) => (
        <MachineCard
          type={item[0]}
          count={item[1]}
          navigation={navigation}
          machines={machines} // Pasa todas las máquinas al componente
        />
      )}
      keyExtractor={(item) => item[0]}
      contentContainerStyle={styles.listContainer}
    />
  );
};


export default MachineTypeCards;
