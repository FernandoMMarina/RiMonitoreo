import React, { useEffect, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View, Text, StyleSheet } from 'react-native';

const MachineFilter = ({ sucursales = [], sectores = [], onFilterChange }) => {
  const [openSucursal, setOpenSucursal] = useState(false);
  const [openSector, setOpenSector] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);

  const [sucursalOptions, setSucursalOptions] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);

  useEffect(() => {
    const mappedSucursales = sucursales.map((s) => ({
      label: s.nombre,
      value: s._id,
    }));
    setSucursalOptions(mappedSucursales);
  }, [sucursales]);

  useEffect(() => {
    console.log('Sectores recibidos en MachineFilter:', sectores);
    const mappedSectores = sectores.map((s) => ({
      label: s.nombre,
      value: s._id,
    }));
    setSectorOptions(mappedSectores);
  }, [sectores]);
  
  

  useEffect(() => {
    onFilterChange({
      sucursal: selectedSucursal,
      sector: selectedSector,
    });
  }, [selectedSucursal, selectedSector]);

  console.log('Sectores en MachineFilter:', sectores);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sucursal</Text>
      <DropDownPicker
        open={openSucursal}
        setOpen={setOpenSucursal}
        items={sucursalOptions}
        value={selectedSucursal}
        setValue={setSelectedSucursal}
        placeholder="Seleccioná una sucursal"
        zIndex={3000}
        zIndexInverse={1000}
      />

      <Text style={[styles.label, { marginTop: 10 }]}>Sector</Text>
      <DropDownPicker
        open={openSector}
        setOpen={setOpenSector}
        items={sectorOptions}
        value={selectedSector}
        setValue={setSelectedSector}
        placeholder="Seleccioná un sector"
        zIndex={2000}
        zIndexInverse={2000}
      />
    </View>
  );
};

export default MachineFilter;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 12,
    backgroundColor: '#f9f9f9',
    marginBottom:20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
    color: '#333',
  },
});
