import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './styles';
import MachineFilter from '../MachineFilter/MachineFilter';
import { useSelector } from 'react-redux';
import { selectSucursales, selectSectores } from '../../redux/slices/userSlice';



const MachineListScreen = ({ route, navigation }) => {
  const { machines, category, usuario } = route.params;
  
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Usamos directamente las sucursales y sectores del usuario logueado
  const usuarioSucursales = useSelector(selectSucursales);
  const usuarioSectores = useSelector(selectSectores);
  
  const handleFilterChange = ({ sucursal, sector }) => {
    if (!sucursal || !sector) {
      setFilteredMachines(machines); // Mostrar todas las máquinas
      setFiltersApplied(false);
      return;
    }
  
    const result = machines.filter(
      (m) => m.sucursal === sucursal && m.sector === sector
    );
  
    setFilteredMachines(result);
    setFiltersApplied(true);
  };  

  const renderMachine = ({ item }) => {
    const sucursalNombre = usuarioSucursales.find(s => s._id === item.sucursal)?.nombre || 'Sin Sucursal';
    const sectorNombre = usuarioSectores.find(s => s._id === item.sector)?.nombre || 'Sin Sector';
  
    return (
      <TouchableOpacity
        style={styles.machineItem}
        onPress={() => navigation.navigate('MachineDetails', { id: item._id })}
      >
        <View style={styles.machineCard}>
          <Ionicons name="construct-outline" size={30} color="#1E90FF" />
          <View style={styles.machineInfo}>
            <Text style={styles.machineName}>{item.name}</Text>
            <Text style={styles.machineSubText}>Sucursal: {sucursalNombre}</Text>
            <Text style={styles.machineSubText}>Sector: {sectorNombre}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Máquinas en la categoría:</Text>
      <Text style={styles.title}>{category}</Text>
      <MachineFilter
        sucursales={usuarioSucursales}
        sectores={usuarioSectores}
        onFilterChange={handleFilterChange}
      />

    <FlatList
    data={filtersApplied ? filteredMachines : machines}
    renderItem={renderMachine}
    keyExtractor={(item) => item._id}
    />      
      {!filtersApplied && filteredMachines.length === 0 && (
  <Text style={styles.title}>Seleccioná una sucursal y sector para ver máquinas</Text>
)}

    </View>
  );
};

export default MachineListScreen;
