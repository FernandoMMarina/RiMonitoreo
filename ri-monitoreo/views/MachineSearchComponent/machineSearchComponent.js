import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator,StyleSheet,Modal } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserSearchComponent from "../UserSearchComponent/UserSearchComponent"; // Asegúrate de la ruta correcta
import { useSelector } from "react-redux";
import { CameraView, useCameraPermissions } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';


const MachineSearchComponent = () => {
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Para manejar errores específicos
const [scanned, setScanned] = useState(false);
const [showScanner, setShowScanner] = useState(false); 
const  [modalIsVisible, setModalIsVisible] = useState(false); 
const  [permission, requestPermission] = useCameraPermissions(); 

  // useEffect para ejecutar fetchMachines cuando cambia selectedUser
  useEffect(() => {
    if (selectedUser) {
      fetchMachines(selectedUser._id);
    }
  }, [selectedUser]);

  // Función para buscar máquinas por usuario
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
        `https://rosensteininstalaciones.com.ar/api/machines/user/${userId}`, // Asegúrate de que la ruta es correcta
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(response.data);
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
      try{
        const {granted} = await requestPermission()
  
        if(!granted){
          return Alert.alert("Camara","Necesita habilitar el uso de la camara")
        }
  
        setModalIsVisible(true)
      }catch(error){
        console.log(error)
      }
      
    }
  
    async function handleBarCodeScanned({ data }) {
      if (scanned) return; // Evita escanear múltiples veces
    
      console.log("Código escaneado:", data);
    
      const match = data.match(/SN\d{6}/);
      if (!match) {
        Alert.alert("Error", "Formato de código QR inválido.");
        return;
      }
    
      const serialNumber = match[0];
      console.log("Número de serie extraído:", serialNumber);
    
    }
    
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Buscar Máquina por Usuario</Text>

      {/* Componente para buscar usuario */}
      <UserSearchComponent />

      {/* Muestra el usuario seleccionado */}
      {selectedUser && (
        <Text style={{ marginTop: 10, fontSize: 16 }}>
          Usuario seleccionado: {selectedUser.username} (ID: {selectedUser._id})
        </Text>
      )}

      {/* Indicador de carga */}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}

      {/* Mensaje de error si no hay máquinas */}
      {error && !loading && <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>}

      {/* Lista de máquinas */}
      <FlatList
        data={machines}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <Text style={{ padding: 10, backgroundColor: "#ddd", marginTop: 25, borderRadius: 5 }}>
              {item.name} - {item.model}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && selectedUser && !error ? <Text>No hay máquinas disponibles</Text> : null}
      />
        <TouchableOpacity
              style={styles.circleButton}
              onPress={handleOpenCamera}
            >
              <Ionicons name={'qr-code-outline'} color="#1D1936" size={25} />
        </TouchableOpacity>
        <Modal visible={modalIsVisible} style={{flex:1}}>
            <CameraView
              style={{flex:1}}
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
    circleButton: {
        marginTop:30,
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
