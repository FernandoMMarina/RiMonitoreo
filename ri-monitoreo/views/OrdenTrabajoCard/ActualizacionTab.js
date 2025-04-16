import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const ActualizacionTab = ({ trabajo }) => {
  const [estado, setEstado] = useState(trabajo?.estado || 'pendiente');
  const [nota, setNota] = useState(trabajo?.nota || '');
  const [costoDescripcion, setCostoDescripcion] = useState('');
  const [costoMonto, setCostoMonto] = useState('');

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
      console.error('Error actualizando trabajo:', error);
      Alert.alert('❌ Error', 'No se pudo actualizar el trabajo.');
    }
  };

  return (
    <View style={{ padding: 16 }}>
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
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={estado}
          onValueChange={setEstado}
          mode="dialog"
          style={styles.picker}
        >
          <Picker.Item label="Pendiente" value="pendiente" />
          <Picker.Item label="Reprogramado" value="reprogramado" />
          <Picker.Item label="Terminado" value="terminado" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={actualizarTrabajo}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ActualizacionTab;
