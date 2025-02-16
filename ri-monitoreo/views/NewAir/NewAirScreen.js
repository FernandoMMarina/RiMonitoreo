import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Picker } from "@react-native-picker/picker";
import { useWindowDimensions } from "react-native";
import UserSearchComponent from "../UserSearchComponent/UserSearchComponent";
import { useSelector, useDispatch } from "react-redux";
import { clearSelectedUser } from "../redux/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


const NewAirScreen= () => {
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "general", title: "General" },
    { key: "details", title: "Detalles" },
  ]);

  const [machineData, setMachineData] = useState({
    name: "", // 🔹 Asegurar que siempre sea string
    installationDate: "",
    type: "",
    manufacturer: "",
    coolingCapacity: "",
    heatingCapacity: "",
    refrigerantType: "",
    cabinSize: "",
    filterType: "",
    airFlow: "",
    powerOutput: "",
    pressure: "",
    fuelType: "",
    capacity: "",
    maxPressure: "",
    motorPower: "",
    loadCapacity: "",
    liftHeight: "",
  });
  

  const handleInputChange = (name, value) => {
    let formattedValue = value;
  
    // Solo validar si el campo es numérico
    if (["coolingCapacity", "heatingCapacity", "powerOutput", "maxPressure", "airFlow"].includes(name)) {
      if (!/^\d*\.?\d*$/.test(value)) {
        return; // Si no es un número válido, no actualizar el estado
      }
    }
  
    setMachineData((prev) => ({ ...prev, [name]: formattedValue }));
  };
  
  
  const handleNameChange = (value) => {
    if (typeof value !== "string") return; // Asegurar que siempre sea string
    setMachineData((prev) => ({ ...prev, name: value.trimStart() })); // Evita espacios en blanco al inicio
  };
  


  const parseNumericValue = (value) => {
    if (!value) return ""; // Si el campo está vacío, devolver cadena vacía
  
    const numericValue = value.replace(/[^0-9.]/g, ""); // Elimina cualquier carácter que no sea número o punto
  
    if (numericValue === "") return ""; // Si después de limpiar queda vacío, devolver cadena vacía
  
    return numericValue; // Devolver el valor limpio sin letras
  };
  
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    try {
      const token = await AsyncStorage.getItem("token");
  
      const machineResponse = await axios.post(
        "https://rosensteininstalaciones.com.ar/api/machines",
        machineData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      Alert.alert("Éxito", "Máquina creada correctamente.");
  
      // Reiniciar formulario
      setMachineData({
        name: "",
        type: "",
        manufacturer: "",
        coolingCapacity: "",
        heatingCapacity: "",
        refrigerantType: "",
      });
  
    } catch (error) {
      console.error("Error al crear máquina:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo crear la máquina.");
    }
  };
  
  

  const GeneralTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.label}>Nombre de la máquina</Text>
        <TextInput
          style={styles.input}
          value={machineData.name} // 🔹 Evita valores `undefined`
          placeholder="Ejemplo: Aire acondicionado"
        />

      <Text style={styles.label}>Tipo de máquina</Text>
      <Picker
        selectedValue={machineData.type}
        onValueChange={(value) => handleInputChange("type", value)}
        style={styles.input}
      >
        <Picker.Item label="Seleccione un tipo" value="" />
        <Picker.Item label="Aire Acondicionado" value="Aire Acondicionado" />
        <Picker.Item label="Cabina de Pintura" value="Cabina de Pintura" />
        <Picker.Item label="Caldera" value="Caldera" />
        <Picker.Item label="Compresor de Aire" value="Compresor de Aire" />
        <Picker.Item label="AutoElevador" value="AutoElevador" />
      </Picker>
    </View>
  );

  const DetailsTab = () => (
    <View style={styles.tabContent}>
      {machineData.type === "Aire Acondicionado" && (
        <>
          <Text style={styles.label}>Capacidad de enfriamiento</Text>
          <TextInput style={styles.input} value={machineData.coolingCapacity} onChangeText={(value) => handleInputChange("coolingCapacity", value)} placeholder="Ejemplo: 3500 BTU" />
          <Text style={styles.label}>Capacidad de calefacción</Text>
          <TextInput style={styles.input} value={machineData.heatingCapacity} onChangeText={(value) => handleInputChange("heatingCapacity", value)} placeholder="Ejemplo: 4000 BTU" />
          <Text style={styles.label}>Tipo de refrigerante</Text>
          <TextInput style={styles.input} value={machineData.refrigerantType} onChangeText={(value) => handleInputChange("refrigerantType", value)} placeholder="Ejemplo: R410A" />
        </>
      )}
      {machineData.type === "Cabina de Pintura" && (
        <>
          <Text style={styles.label}>Tamaño de Cabina</Text>
          <TextInput style={styles.input} value={machineData.cabinSize} onChangeText={(value) => handleInputChange("cabinSize", value)} placeholder="Ejemplo: 3x3m" />
          <Text style={styles.label}>Tipo de Filtro</Text>
          <TextInput style={styles.input} value={machineData.filterType} onChangeText={(value) => handleInputChange("filterType", value)} placeholder="Ejemplo: HEPA" />
          <Text style={styles.label}>Flujo de Aire</Text>
          <TextInput style={styles.input} value={machineData.airFlow} onChangeText={(value) => handleInputChange("airFlow", value)} placeholder="Ejemplo: 2000 m³/h" />
        </>
      )}
      {machineData.type === "Caldera" && (
        <>
          <Text style={styles.label}>Potencia</Text>
          <TextInput style={styles.input} value={machineData.powerOutput} onChangeText={(value) => handleInputChange("powerOutput", value)} placeholder="Ejemplo: 100 kW" />
          <Text style={styles.label}>Presión Máxima</Text>
          <TextInput style={styles.input} value={machineData.maxPressure} onChangeText={(value) => handleInputChange("maxPressure", value)} placeholder="Ejemplo: 15 bar" />
          <Text style={styles.label}>Tipo de Combustible</Text>
          <TextInput style={styles.input} value={machineData.fuelType} onChangeText={(value) => handleInputChange("fuelType", value)} placeholder="Ejemplo: Gas Natural" />
        </>
      )}
    </View>
  );

  const renderScene = SceneMap({
    general: GeneralTab,
    details: DetailsTab,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Máquina</Text>
      <View>
      {/* Componente de búsqueda de usuario */}
      <UserSearchComponent />

      {selectedUser && <Text>Usuario seleccionado: {selectedUser.username}</Text>}
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "#1D1936" }}
            style={{ backgroundColor: "#1D1936" }}
            renderLabel={({ route }) => (
              <Text style={{ color: "#1D1936" }}>{route.title}</Text>
            )}
          />
        )}
      />

      <Button title="Crear Máquina" onPress={handleSubmit} color="#1D1936" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  listItem: {
    padding: 10,
    backgroundColor: "#ddd",
    marginTop: 5,
    borderRadius: 5,
  },
});

export default NewAirScreen;
