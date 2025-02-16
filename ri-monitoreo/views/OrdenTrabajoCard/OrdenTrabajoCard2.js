import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { Tabs } from 'react-native-collapsible-tab-view';

const HEADER_HEIGHT = 120;

const OrdenTrabajoCard2 = ({ trabajo }) => {
  const [estado, setEstado] = useState(trabajo?.estado || 'pendiente');
  const [nota, setNota] = useState(trabajo?.nota || '');
  const [costoDescripcion, setCostoDescripcion] = useState('');
  const [costoMonto, setCostoMonto] = useState('');

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

  return (
    <View style={{ height:600,marginBottom:10,marginTop:10}}>
      <Tabs.Container
        renderHeader={Header}
        headerHeight={HEADER_HEIGHT}
        containerStyle={{ flex: 1 }}
      >
        {/* TAB 1 - DETALLE */}
        <Tabs.Tab name="Detalle">
          <Tabs.ScrollView
            contentContainerStyle={{
              minHeight: 400,
              flexGrow: 1,
              padding: 16,
              backgroundColor: 'white',
            }}
          >
            <Text style={styles.label}>Cliente: {trabajo?.clienteId || 'No especificado'}</Text>
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
          </Tabs.ScrollView>
        </Tabs.Tab>
        {/* TAB 1 - HERRAMIENTAS*/}
        <Tabs.Tab name="Herramientas">
          <Tabs.ScrollView
            contentContainerStyle={{
              minHeight: 400,
              flexGrow: 1,
              padding: 16,
              backgroundColor: 'white',
            }}
          >
            <Text style={styles.label}>Cliente: {trabajo?.clienteId || 'No especificado'}</Text>
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
          </Tabs.ScrollView>
        </Tabs.Tab>
        {/* TAB 1 - MAQUINA */}
        <Tabs.Tab name="Info Maquina">
          <Tabs.ScrollView
            contentContainerStyle={{
              minHeight: 400,
              flexGrow: 1,
              padding: 16,
              backgroundColor: 'white',
            }}
          >
            <Text style={styles.label}>Cliente: {trabajo?.clienteId || 'No especificado'}</Text>
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
            <Text style={styles.label}>Estado del Trabajo:</Text>
            <Picker selectedValue={estado} onValueChange={setEstado} style={styles.picker}>
              <Picker.Item label="Pendiente" value="pendiente" />
              <Picker.Item label="Reprogramado" value="reprogramado" />
              <Picker.Item label="Terminado" value="terminado" />
            </Picker>
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
    marginBottom: 8,
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
});

export default OrdenTrabajoCard2;
