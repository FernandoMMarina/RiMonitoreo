import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles';

const MachineListScreen = ({ route, navigation }) => {
  const { machines, category } = route.params; // Recibe las máquinas y la categoría

  const renderMachine = ({ item }) => (
    <TouchableOpacity
      style={styles.machineItem}
      onPress={() => navigation.navigate('MachineDetails', { id: item._id })}
    >
      <View style={styles.machineCard}>
        <Ionicons name="construct-outline" size={30} color="#1E90FF" />
        <View style={styles.machineInfo}>
          <Text style={styles.machineName}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Máquinas en la categoría: {category}</Text>
      <FlatList
        data={machines}
        renderItem={renderMachine}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default MachineListScreen;
