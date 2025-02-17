import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Modal } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserSearchComponent from "../UserSearchComponent/UserSearchComponent";
import { useSelector } from "react-redux";
import { CameraView, useCameraPermissions } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';

const MachineSearchComponent = () => {
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedMachine, setSelectedMachine] = useState(null); // Máquina seleccionada para asignar el serial

  useEffect(() => {
    if (selectedUser) {
      fetchMachines(selectedUser._id);
    }
  }, [selectedUser]);

  const fetchMachines = async (userId) => {
    if (!userId) return;

    setLoading(true);
    setMachines([]);
    setError(null);

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "Usuario no autenticado");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://rosensteininstalaciones.com.ar/api/machines/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.length === 0) {
        setError("Este usuario no tiene máquinas registradas.");
      }

      setMachines(response.data);
    } catch (error) {
      console.error("Error buscando máquinas:", error);
      setError("No se pudieron obtener las máquinas. Intenta nuevamente.");
    }

    setLoading(false);
  };

  async function handleOpenCamera() {
    if (!selectedMachine) {
      Alert.alert("Atención", "Primero debes seleccionar una máquina.");
      return;
    }

    try {
      const { granted } = await requestPermission();

      if (!granted) {
        return Alert.alert("Cámara", "Necesita habilitar el uso de la cámara");
      }

      setModalIsVisible(true);
      setScanned(false); // Reiniciar el escaneo al abrir la cámara
    } catch (error) {
      console.log(error);
    }
  }

  async function handleBarCodeScanned({ data }) {
    if (scanned) return;

    setScanned(true);

    console.log("Código escaneado:", data);

    const match = data.match(/SN\d{6}/);
    if (!match) {
      Alert.alert("Error", "Formato de código QR inválido.");
      setModalIsVisible(false);
      return;
    }

    const serialNumber = match[0];

    assignSerialNumberToMachine(serialNumber);
  }

  const assignSerialNumberToMachine = async (serialNumber) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Error", "Usuario no autenticado");
      return;
    }

    try {
      const response = await axios.put(
        `https://rosensteininstalaciones.com.ar/api/machines/${selectedMachine._id}`,
        { serialNumber },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert(
        "Asignación exitosa",
        `Número de serie ${serialNumber} asignado a la máquina ${selectedMachine.name}`
      );

      // Actualizar la lista de máquinas después de asignar el serial
      fetchMachines(selectedUser._id);

      // Limpiar selección
      setSelectedMachine(null);
    } catch (error) {
      console.error("Error asignando número de serie:", error);
      Alert.alert("Error", "No se pudo asignar el número de serie.");
    } finally {
      setModalIsVisible(false);
      setScanned(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Buscar Máquina por Usuario</Text>

      <UserSearchComponent />

      {selectedUser && (
        <Text style={{ marginTop: 10, fontSize: 16 }}>
          Usuario seleccionado: {selectedUser.username} (ID: {selectedUser._id})
        </Text>
      )}

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}

      {error && !loading && <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>}

      <FlatList
        data={machines}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.machineItem,
              selectedMachine?._id === item._id && styles.selectedMachineItem,
            ]}
            onPress={() => setSelectedMachine(item)}
          >
            <Text>
              {item.name} - {item.model}
            </Text>
            {item.serialNumber && (
              <Text style={{ fontSize: 12, color: "gray" }}>
                Serial: {item.serialNumber}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && selectedUser && !error ? <Text>No hay máquinas disponibles</Text> : null}
      />

      {selectedMachine && (
        <Text style={{ marginTop: 10, fontSize: 16 }}>
          Máquina seleccionada: {selectedMachine.name} (ID: {selectedMachine._id})
        </Text>
      )}

      <TouchableOpacity style={styles.circleButton} onPress={handleOpenCamera}>
        <Ionicons name={"qr-code-outline"} color="#1D1936" size={25} />
      </TouchableOpacity>

      <Modal visible={modalIsVisible} style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalIsVisible(false)}>
            <Ionicons name="close-circle-outline" size={50} color="white" />
          </TouchableOpacity>
        </CameraView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  machineItem: {
    padding: 10,
    backgroundColor: "#ddd",
    marginTop: 10,
    borderRadius: 5,
  },
  selectedMachineItem: {
    backgroundColor: "#cce5ff",
  },
  circleButton: {
    marginTop: 30,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 50,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 50,
  },
});

export default MachineSearchComponent;
