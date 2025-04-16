import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { Tabs } from 'react-native-collapsible-tab-view';
import { Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
const HEADER_HEIGHT = 120;

const OrdenTrabajoCard2 = ({ trabajo }) => {
  const [estado, setEstado] = useState(trabajo?.estado || 'pendiente');
  const [nota, setNota] = useState(trabajo?.nota || '');
  const [costoDescripcion, setCostoDescripcion] = useState('');
  const [costoMonto, setCostoMonto] = useState('');
  const [cliente, setCliente] = useState(null);


  useEffect(() => {
    const fetchCliente = async () => {
      if (trabajo?.clienteId) {
        try {
          const response = await axios.get(
            `https://rosensteininstalaciones.com.ar/api/users/user/${trabajo.clienteId}`
          );
          setCliente(response.data);
        } catch (error) {
          console.error('Error al obtener el cliente:', error);
        }
      }
    };
  
    fetchCliente();
  }, [trabajo?.clienteId]);
  
  const Header = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orden de Trabajo</Text>
        <Text style={styles.headerSubtitle}>{trabajo?.tipoDeTrabajo || 'No especificado'}</Text>
      </View>
    );
  };

  const openGoogleMaps = () => {
    if (trabajo?.latitud && trabajo?.longitud) {
      const url = `https://www.google.com/maps?q=${trabajo.latitud},${trabajo.longitud}`;
      Linking.openURL(url).catch(() =>
        Alert.alert('Error', 'No se pudo abrir Google Maps.')
      );
    } else if (trabajo?.ubicacion?.direccion) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trabajo.ubicacion.direccion)}`;
      Linking.openURL(url).catch(() =>
        Alert.alert('Error', 'No se pudo abrir Google Maps.')
      );
    } else {
      Alert.alert('Información faltante', 'No se encontró dirección o coordenadas.');
    }
  };

  const actualizarTrabajo = async () => {
    try {
      const payload = {
        estado,
        descripcion: trabajo.descripcion,
        nota,
        costosAdicionales:
          costoDescripcion && costoMonto
            ? [{ descripcion: costoDescripcion, monto: parseFloat(costoMonto) }]
            : [],
      };

      const response = await axios.put(
        `https://rosensteininstalaciones.com.ar/api/trabajos/${trabajo._id}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        Alert.alert('✅ Éxito', 'Trabajo actualizado correctamente.');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo actualizar el trabajo.');
    }
  };

  const [herramientasCompletadas, setHerramientasCompletadas] = useState(
    trabajo?.herramientas?.every((h) => h.completada) || false
  );
  
  const toggleHerramienta = async (herramientaIndex) => {
    try {
      const herramientaSeleccionada = trabajo.herramientas[herramientaIndex];
  
      if (!herramientaSeleccionada) {
        Alert.alert('❌ Error', 'Herramienta no encontrada.');
        return;
      }
  
      const nuevaCompletada = !herramientaSeleccionada.completada;
  
      const nuevasHerramientas = trabajo.herramientas.map((herramienta, index) => {
        if (index === herramientaIndex) {
          return { ...herramienta, completada: nuevaCompletada };
        }
        return herramienta;
      });
  
      trabajo.herramientas = nuevasHerramientas;
  
      const token = await AsyncStorage.getItem('token');
  
      const payload = {
        trabajoId: trabajo._id,
        herramientaNombre: herramientaSeleccionada.nombre,
        completada: nuevaCompletada,
      };
  
      console.log('🛠️ Payload a enviar:', payload);
  
      await axios.put(
        `https://rosensteininstalaciones.com.ar/api/trabajos/marcar-herramienta-especifico`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert(
        '✅ Éxito',
        `Herramienta "${herramientaSeleccionada.nombre}" actualizada correctamente.`
      );
      // Verificar si todas están completas
      const todasCompletadas = nuevasHerramientas.every((h) => h.completada);
      setHerramientasCompletadas(todasCompletadas);
    } catch (error) {
      console.error('❌ Error al actualizar herramienta:', error.response?.data || error.message);
      Alert.alert('❌ Error', 'No se pudo actualizar la herramienta.');
    }
  };
  
  
  
  return (
    <View style={{alignContent:"center",alignItems:"center",alignSelf:"center", height:600,marginBottom:10,marginTop:20}}>
      <Tabs.Container
        renderHeader={Header}
        headerHeight={HEADER_HEIGHT}
        containerStyle={{ flex: 1 }}
      >
        {/* TAB 1 - DETALLE */}
        <Tabs.Tab name="Detalle">
          <Tabs.ScrollView
            contentContainerStyle={{
              minHeight: 300,
              flexGrow: 1,
              padding: 16,
              backgroundColor: 'white',
            }}
          >
          <View style={{margin:20}}>
           <Text style={styles.label}>Cliente: {cliente ? cliente.username : 'Cargando...'}</Text>
            <Text style={styles.label}>Descripción: {trabajo?.descripcion || 'No especificado'}</Text>
            <TouchableOpacity onPress={openGoogleMaps}>
              <Text style={[styles.label, { color: 'blue' }]}>
                Dirección: {trabajo?.ubicacion?.direccion || 'No disponible'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.label}>Insumos:</Text>
            {Array.isArray(trabajo?.insumos) && trabajo.insumos.length > 0 ? (
              trabajo.insumos.map((insumo, idx) => (
                <Text key={idx} style={styles.value}>
                  - {insumo.descripcion} - Cantidad: {insumo.cantidad}
                </Text>
              ))
            ) : (
              <Text style={styles.value}>No hay insumos asignados</Text>
            )}
          </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
        {/* TAB 2 - HERRAMIENTAS*/}
        <Tabs.Tab name="Herramientas">
          <Tabs.ScrollView
            contentContainerStyle={{
              minHeight: 300,
              flexGrow: 1,
              padding: 16,
              backgroundColor: 'white',
            }}
          >
            <Text style={styles.label}>Herramientas:</Text>
            <View style={{flex:1,alignContent:"center",alignItems:"center"}}>
            {herramientasCompletadas ? (
                <View style={styles.resultContainer}>
                <Ionicons name="checkmark-circle" size={40} color="green" />
                <Text style={styles.successText}>Herramientas Completadas</Text>
              </View>
              ) : (
                Array.isArray(trabajo?.herramientas) && trabajo.herramientas.length > 0 ? (
                  trabajo.herramientas.map((herramienta, index) => (
                    <View key={`${herramienta.nombre}-${index}`} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}>
                      <Checkbox.Android
                        status={herramienta.completada ? 'checked' : 'unchecked'}
                        onPress={() => toggleHerramienta(index)}
                        color="#4B0082"
                        uncheckedColor="#8F9295"
                      />
                      <Text style={styles.herramientaText}>{herramienta.nombre}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.value}>No hay herramientas asignadas</Text>
                )
              )}
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
        {/* TAB 4 - ACTUALIZACION */}
        <Tabs.Tab name="Actualización">
          <Tabs.ScrollView
            contentContainerStyle={{
              minHeight: 400,
              flexGrow: 1,
              padding: 16,
              backgroundColor: 'white',
            }}
          >
            <Text style={styles.label}>Nota:</Text>
            <TextInput
              style={styles.input}
              value={nota}
              onChangeText={setNota}
              placeholder="Información del trabajo realizado..."
            />
            <Text style={styles.label}>Costo Adicional:</Text>
            <TextInput
              style={styles.input}
              value={costoDescripcion}
              onChangeText={setCostoDescripcion}
              placeholder="Descripción del costo..."
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={costoMonto}
              onChangeText={(text) => setCostoMonto(text.replace(/[^0-9.]/g, ''))}
              placeholder="Monto ($)..."
            />
            <Text style={styles.label}>Estado del Trabajo:</Text>
            <View style={{ flex:1,backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#ccc' , marginBottom:10}}>
            <Picker selectedValue={estado} onValueChange={setEstado} mode="dialog" style={styles.picker}>
              <Picker.Item label="Pendiente" value="pendiente" />
              <Picker.Item label="Reprogramado" value="reprogramado" />
              <Picker.Item label="Terminado" value="terminado" />
            </Picker>
            </View>
            <TouchableOpacity style={styles.button} onPress={actualizarTrabajo}>
              <Text style={styles.buttonText}>Guardar Cambios</Text>
            </TouchableOpacity>
          </Tabs.ScrollView>
        </Tabs.Tab>
      </Tabs.Container>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
  },
  contentContainer: {
    padding: 16,
    margin: 10,
  },
  label: {
    fontSize: 16,
    margin: 10,
  },
  value: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  picker: {
    height: 50,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  successText: {
    color: 'green',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default OrdenTrabajoCard2;