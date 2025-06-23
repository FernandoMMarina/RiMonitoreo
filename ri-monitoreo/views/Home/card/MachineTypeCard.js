import React from 'react';
import styles from './styles'; 
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, FlatList,TouchableOpacity,Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


// Componente para renderizar cada card
const MachineCard = ({ type, count, navigation, machines }) => {
   // Encuentra la primera máquina del tipo correspondiente
   const machineOfType = machines.find((machine) => machine.type === type);
   const filteredMachines = machines.filter((machine) => machine.type === type);
   const sucursal = machines.filter((machine) => machine.sucursales === sucursal);
  console.log(machines[1].sucursal);
  const getIcon = () => {
    switch (type) {
      case 'Aire Acondicionado':
        return <Image source={require('../../../assets/icons/3653252.png')} style={{ width: 50, height: 50 }} />;
      case 'Aire Acondicionado Multiposición':
        return <MaterialCommunityIcons name="snowflake" size={32} color="#00BFFF" />;
      case 'Aire Acondicionado Roof Top':
        return <MaterialCommunityIcons name="snowflake" size={32} color="#00BFFF" />;
      case 'Cabina de Pintura':
          return <Image source={require('../../../assets/icons/spray-paint.png')} style={{ width: 50, height: 50 }} />;
      case 'Compresor de Aire':
          return <Image source={require('../../../assets/icons/air-compressor.png')} style={{ width: 50, height: 50 }} />;
      case 'AutoElevador':
          return <Image source={require('../../../assets/icons/elevador-de-automoviles.png')} style={{ width: 50, height: 50 }} />;
      case 'Tablero Electrico':
            return <Image source={require('../../../assets/icons/electrical-panel.png')} style={{ width: 50, height: 50 }} />;
      case 'Caldera':
        return <Image source={require('../../../assets/icons/caldera.png')} style={{ width: 50, height: 50 }} />;
      default:
        return <Ionicons name="cube-outline" size={50} color="#888" />;
    }
    
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('MachineListScreen', {
          machines: filteredMachines, // Pasa las máquinas de esta categoría
          category: type, // También pasa el tipo para mostrar en el título
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
