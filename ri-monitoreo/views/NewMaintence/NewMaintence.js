import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { TabView, TabBar } from "react-native-tab-view";
import { useWindowDimensions } from "react-native";
import styles from "./styles";
import { useQRCodeScanner } from "../hooks/useQRCodeScanner";  // ✅ Importamos el hook
import { fetchMachineBySerial } from "../utils/fetchMachineBySerial";  // ✅ Importamos la función para buscar máquinas
import { CameraView } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";


const API_URL = "https://rosensteininstalaciones.com.ar/api/maintenance";

const NewMaintenanceScreen = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "general", title: "Info Máquina" },
    { key: "details", title: "Detalles del Mantenimiento" },
  ]);

  const user = useSelector((state) => state.user.profile);
  const {
    scanned,
    setScanned,
    modalIsVisible,
    handleOpenCamera,
    handleCloseCamera,
    setModalIsVisible,
  } = useQRCodeScanner();

  const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      machineId: "",
      date: "",
      description: "",
      frigorias: "",
      evaporadora: "",
      condensadora: "",
      consumo: "",
      presionAlta: "",
      presionBaja: "",
      filtros: "",
      location: "",
    },
  });

  // ✅ Función para manejar el escaneo y actualizar el campo de la máquina
  async function handleBarCodeScanned({ data }) {
    if (scanned) return;

    console.log("Código escaneado:", data);
    const match = data.match(/SN\d{6}/);
    if (!match) {
      Alert.alert("Error", "Formato de código QR inválido.");
      return;
    }

    const serialNumber = match[0];
    console.log("Número de serie extraído:", serialNumber);

    try {
      setScanned(true);
      setModalIsVisible(false);

      const machineId = await fetchMachineBySerial(serialNumber);
      if (machineId) {
        setValue("machineId", machineId);  // ✅ Se actualiza el formulario con el ID de la máquina
        Alert.alert("Éxito", `Máquina encontrada: ${machineId}`);
      } else {
        Alert.alert("Error", "El servidor no devolvió un ID válido.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setScanned(false);
    }
  }

  const onSubmit = async (data) => {
    if (!user || !user._id) {
      Alert.alert("Error", "No se pudo obtener la información del usuario.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Usuario no autenticado.");
        return;
      }

      const formattedData = {
        ...data,
        performedBy: user._id,
        date: new Date(data.date).toISOString(),
        frigorias: parseFloat(data.frigorias) || 0,
        evaporadora: parseFloat(data.evaporadora) || 0,
        condensadora: parseFloat(data.condensadora) || 0,
        consumo: parseFloat(data.consumo) || 0,
        presionAlta: parseFloat(data.presionAlta) || 0,
        presionBaja: parseFloat(data.presionBaja) || 0,
        filtros: parseInt(data.filtros) || 0,
      };

      console.log("Enviando datos:", formattedData);

      await axios.post(API_URL, formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Éxito", "Mantenimiento registrado correctamente.");
      reset();
      setIndex(0);
    } catch (error) {
      console.error("Error creando mantenimiento:", error);
      Alert.alert("Error", "No se pudo registrar el mantenimiento.");
    }
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "general":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.label}>Machine ID</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.qrContainer}>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Ejemplo: 123456"
                    placeholderTextColor="#666"
                  />
                  <TouchableOpacity style={styles.qrButton} onPress={handleOpenCamera}>
                    <Ionicons name="qr-code-outline" size={30} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              name="machineId"
              rules={{ required: true }}
            />
            {errors.machineId && <Text style={styles.errorText}>Machine ID es obligatorio</Text>}

            <Text style={styles.label}>Fecha (YYYY-MM-DD)</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ejemplo: 2025-01-30"
                  placeholderTextColor="#666"
                />
              )}
              name="date"
              rules={{ required: true }}
            />
            {errors.date && <Text style={styles.errorText}>Fecha es obligatoria</Text>}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "#fff" }}
            style={{ backgroundColor: "#161616" }}
            renderLabel={({ route }) => (
              <Text style={{ color: "#161616" }}>{route.title}</Text>
            )}
          />
        )}
      />

      <TouchableOpacity style={styles.siguienteButton} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.siguienteText}>Guardar Mantenimiento</Text>
      </TouchableOpacity>

      {/* ✅ Modal para el escáner de QR */}
      <Modal visible={modalIsVisible} style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseCamera}>
            <Ionicons name="close-circle-outline" size={50} color="white" />
          </TouchableOpacity>
        </CameraView>
      </Modal>
    </View>
  );
};

export default NewMaintenanceScreen;
