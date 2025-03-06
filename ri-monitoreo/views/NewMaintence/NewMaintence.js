import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Modal,ScrollView} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { TabView, TabBar } from "react-native-tab-view";
import { useWindowDimensions } from "react-native";
import styles from "./styles";
import { useQRCodeScanner } from "../hooks/useQRCodeScanner";
import { fetchMachineBySerial } from "../utils/fetchMachineBySerial";
import { CameraView } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useDispatch } from 'react-redux';
import { fetchUserProfile } from '../../redux/slices/userSlice';


const API_URL = "https://rosensteininstalaciones.com.ar/api/maintenance";

const CustomInput = ({ control, name, label }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TextInput
          style={styles.input}
          onChangeText={onChange}
          value={value}
        />
      )}
    />
  </>
);

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const NewMaintenanceScreen = () => {
  const dispatch = useDispatch();

    const { profile, loading, error } = useSelector((state) => state.user);
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "general", title: "Info Máquina" },
    { key: "details", title: "Detalles del Mantenimiento" },
  ]);

  const [machineType, setMachineType] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
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
      date: getCurrentDate(),
      description: "",
    },
  });

  async function handleBarCodeScanned({ data }) {
    if (scanned) return;
  
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
        const token = await AsyncStorage.getItem("token");
  
        const response = await axios.get(
          `https://rosensteininstalaciones.com.ar/api/machines/${machineId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        const machine = response.data;

        console.log("Máquina encontrada:", machine);
  
        setValue("machineId", machine._id);
        setMachineType(machine.type);
        setSelectedMachine(machine);

        // ✅ Ir directamente a la pestaña de detalles al escanear QR
      setIndex(1);

  
        
      } else {
        Alert.alert("Error", "Máquina no encontrada.");
      }
    } catch (error) {
      console.error("Error al buscar la máquina:", error);
      Alert.alert("Error", error.message);
    } finally {
      setScanned(false);
    }
  }
  
  const onSubmit = async (data) => {

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Usuario no autenticado.");
        return;
      }
      const formattedData = {
        date: new Date(`${data.date}T00:00:00.000Z`),
        description: data.description || " ",
        performedBy: profile?.id,
        machineId: selectedMachine?._id,
        machineType: selectedMachine?.type,
        frigorias: data.frigorias,
        evaporadora: data.evaporadora,
        condensadora: data.condensadora,
        consumo: data.consumo,
        presionAlta: data.presionAlta,
        presionBaja: data.presionBaja,
        filtros: data.filtros,
      };
  
      console.log("Enviando datos al backend:", formattedData);
  
      // 1. Crear el mantenimiento
      const maintenanceResponse = await axios.post(
        "https://rosensteininstalaciones.com.ar/api/maintenances/",
        formattedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const maintenanceId = maintenanceResponse.data.data._id;
  
      console.log("Mantenimiento creado, ID:", maintenanceId);
  
  

// 2. Actualizar la máquina agregando el nuevo mantenimiento a maintenanceHistory
await axios.put(
  `https://rosensteininstalaciones.com.ar/api/machines/addMaintenance/${selectedMachine._id}`,
  { maintenanceId },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

  
      Alert.alert("Éxito", "Mantenimiento registrado correctamente.");
      reset();
      setIndex(0);
      setSelectedMachine(null);
      setMachineType(null);
    } catch (error) {
      console.error(
        "Error creando mantenimiento o actualizando máquina:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "No se pudo registrar el mantenimiento.");
    }
  };
  
  
  const renderDetailFields = () => {
    switch (machineType) {
      case 'Aire Acondicionado':
        return (
          <>
           <CustomInput control={control} name="description" label="description" />
            <CustomInput control={control} name="frigorias" label="Frigorías" />
            <CustomInput control={control} name="evaporadora" label="Evaporadora" />
            <CustomInput control={control} name="condensadora" label="Condensadora" />
            <CustomInput control={control} name="consumo" label="Consumo" />
            <CustomInput control={control} name="presionAlta" label="Presión Alta" />
            <CustomInput control={control} name="presionBaja" label="Presión Baja" />
            <CustomInput control={control} name="filtros" label="Filtros" />
          </>
        );
      case 'tablero_electrico':
        return (
          <>
          <CustomInput control={control} name="description" label="description" />
            <CustomInput control={control} name="tensionEntrada" label="Tensión de Entrada (V)" />
            <CustomInput control={control} name="tensionSalida" label="Tensión de Salida (V)" />
            <CustomInput control={control} name="consumo" label="Consumo (A)" />
            <CustomInput control={control} name="temperatura" label="Temperatura (°C)" />
            <CustomInput control={control} name="chequeoInterruptores" label="Chequeo de Interruptores" />
          </>
        );
      case 'cabina_pintura':
        return (
          <>
          <CustomInput control={control} name="description" label="description" />
            <CustomInput control={control} name="temperatura" label="Temperatura" />
            <CustomInput control={control} name="flujoAire" label="Flujo de Aire" />
            <CustomInput control={control} name="limpieza" label="Limpieza" />
            <CustomInput control={control} name="ventilacion" label="Ventilación" />
            <CustomInput control={control} name="nivelFiltro" label="Nivel del Filtro" />
          </>
        );
      case 'caldera':
        return (
          <>
          <CustomInput control={control} name="description" label="description" />
            <CustomInput control={control} name="temperatura" label="Temperatura" />
            <CustomInput control={control} name="presion" label="Presión" />
            <CustomInput control={control} name="combustion" label="Combustión" />
            <CustomInput control={control} name="limpieza" label="Limpieza" />
          </>
        );
      case 'compresor_aire':
        return (
          <>
          <CustomInput control={control} name="description" label="description" />
            <CustomInput control={control} name="presion" label="Presión" />
            <CustomInput control={control} name="caudal" label="Caudal" />
            <CustomInput control={control} name="amperaje" label="Amperaje" />
            <CustomInput control={control} name="aceite" label="Aceite" />
            <CustomInput control={control} name="temperatura" label="Temperatura" />
          </>
        );
      case 'autoelevador':
        return (
          <>
          <CustomInput control={control} name="description" label="description" />
            <CustomInput control={control} name="horasUso" label="Horas de Uso" />
            <CustomInput control={control} name="aceite" label="Aceite" />
            <CustomInput control={control} name="bateria" label="Batería" />
            <CustomInput control={control} name="ruedas" label="Ruedas" />
            <CustomInput control={control} name="frenos" label="Frenos" />
            <CustomInput control={control} name="inspeccionGeneral" label="Inspección General" />
          </>
        );
      default:
        return <Text>Selecciona una máquina para ver los campos específicos.</Text>;
    }
  };
  
  const renderScene = ({ route }) => {
    switch (route.key) {
      case "general":
        return (
          <View style={styles.tabContent}>
            <Controller
              control={control}
              name="machineId"
              render={({ field: { value } }) => (
                <TextInput style={styles.input} value={value} editable={false} />
              )}
            />
            <TouchableOpacity style={styles.qrButton} onPress={handleOpenCamera}>
              <Ionicons name="qr-code-outline" size={30} color="white" />
            </TouchableOpacity>
            {selectedMachine && (
              <Text style={styles.machineInfo}>Máquina seleccionada: {selectedMachine.name}</Text>
            )}
          </View>
        );
      case "details":
        return <View style={styles.tabContent}><ScrollView>{renderDetailFields()}</ScrollView></View>;
      default:
        return null;
    }
  };

  const addMaintenanceToMachine = async (req, res) => {
    try {
      const machineId = req.params.id;
      const { maintenanceId } = req.body;
  
      const machine = await Machine.findById(machineId);
      if (!machine) {
        return res.status(404).json({ message: 'Machine not found' });
      }
  
      machine.maintenanceHistory.push(maintenanceId);
      await machine.save();
  
      res.status(200).json({ message: 'Maintenance added to machine', machine });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
            renderLabel={({ route, focused }) => (
              <Text style={{ color: focused ? "#fff" : "#aaa" }}>{route.title}</Text>
            )}
          />
        )}
      />

      <TouchableOpacity style={styles.siguienteButton} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.siguienteText}>Guardar Mantenimiento</Text>
      </TouchableOpacity>

      <Modal visible={modalIsVisible} transparent={true}>
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
