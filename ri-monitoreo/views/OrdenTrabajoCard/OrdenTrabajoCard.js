import React, { useState ,useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert  } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import styles from './styles';
import { Linking} from 'react-native';

import { useFonts, IBM_Plex_Mono_400Regular } from '@expo-google-fonts/ibm-plex-mono';

import * as Font from "expo-font";

const OrdenTrabajoCard = ({ trabajo }) => {
  const [estado, setEstado] = useState(trabajo?.estado || "pendiente");
  const [descripcion, setDescripcion] = useState(trabajo?.descripcion || "");
  const [nota, setNota] = useState(trabajo?.nota || "");
  const [costoDescripcion, setCostoDescripcion] = useState("");
  const [costoMonto, setCostoMonto] = useState("");

  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        "IBM-Plex-Mono": require("../../assets/fonts/IBMPlexMono-Regular.ttf"),
      });
      setFontLoaded(true);
    }
    loadFont();
  }, []);
  
  if (!fontLoaded) return <Text>Cargando fuente...</Text>;
  
 const openGoogleMaps = () => {
    if (trabajo?.latitud && trabajo?.longitud) {
      // Abrir Google Maps con coordenadas
      const url = `https://www.google.com/maps?q=${trabajo.latitud},${trabajo.longitud}`;
      Linking.openURL(url).catch(() =>
        Alert.alert(
          'Error',
          'No se pudo abrir Google Maps. Verifique que esté instalado en su dispositivo.'
        )
      );
    } else if (trabajo?.ubicacion?.direccion) {
      // Abrir Google Maps con dirección
      const encodedAddress = encodeURIComponent(trabajo?.ubicacion?.direccion);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(url).catch(() =>
        Alert.alert(
          'Error',
          'No se pudo abrir Google Maps. Verifique que esté instalado en su dispositivo.'
        )
      );
    } else {
      Alert.alert('Información faltante', 'No se encontró dirección o coordenadas.');
    }
  };
  const actualizarTrabajo = async () => {
    try {
      const payload = {
        estado,
        descripcion,
        costosAdicionales: costoDescripcion && costoMonto
          ? [{ descripcion: costoDescripcion, monto: parseFloat(costoMonto) }]
          : [],
      };

      console.log("📡 Enviando PUT con datos:", payload);

      const response = await axios.put(
        `https://rosensteininstalaciones.com.ar/api/trabajos/${trabajo._id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        Alert.alert("✅ Éxito", "Trabajo actualizado correctamente.");
      }
    } catch (error) {
      console.error("❌ Error al actualizar el trabajo:", error.response?.data || error.message);
      Alert.alert("❌ Error", "No se pudo actualizar el trabajo.");
    }
  };

  return (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
        <Text style={styles.label}>Cliente:</Text>
        <Text style={styles.infoText}>{trabajo?.clienteId || "No especificado"}</Text>
        <Text style={styles.label}>⚙️ Tipo de Trabajo:</Text>
        <Text style={styles.infoText}>{trabajo?.tipoDeTrabajo || "No especificado"}</Text>
        <Text style={styles.label}>📝 Descripción:</Text>
        <Text style={styles.infoText}>{trabajo?.descripcion || "No especificado"}</Text>
    
        <Text style={styles.label}>📍 Dirección:</Text>
            
            <TouchableOpacity onPress={openGoogleMaps}>
                    <Text style={styles.infoText}>
                      Dirección: {trabajo?.ubicacion?.direccion|| 'No disponible'}
                    </Text>
            </TouchableOpacity>
            

            <Text style={styles.label}>📦 Insumos:</Text>
            {Array.isArray(trabajo?.insumos) && trabajo.insumos.length > 0 ? (
                trabajo.insumos.map((insumo, idx) => (
                <Text key={idx} style={styles.value}>- {insumo.descripcion} - Cantidad : {insumo.cantidad}</Text>
                ))
            ) : (
                <Text style={styles.value}>No hay insumos asignados</Text>
            )}

        </View>
        <View style={styles.cardInfo}>

        <Text style={styles.label}>📝 Nota:</Text>
            <TextInput
                style={styles.input}
                value={nota}
                onChangeText={setNota}
                placeholder="Informacion del trabajo realizado..."
            />
        
        <Text style={styles.label}>📋 Estado del Trabajo:</Text>
            <Picker
                selectedValue={estado}
                onValueChange={(value) => setEstado(value)}
                style={styles.picker}
            >
                <Picker.Item label="Pendiente" value="pendiente" />
                <Picker.Item label="Reprogramado" value="reprogramado" />
                <Picker.Item label="Terminado" value="terminado" />
            </Picker>

            <Text style={styles.label}>💰 Agregar Costo Adicional:</Text>
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
                onChangeText={(text) => setCostoMonto(text.replace(/[^0-9.]/g, ""))} // Permite solo números y punto decimal
                placeholder="Monto ($)..."
            />

            <TouchableOpacity style={styles.buttonGuardar} onPress={actualizarTrabajo}>
                <Text style={styles.buttonTextG}>Guardar Cambios</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
};

export default OrdenTrabajoCard;
