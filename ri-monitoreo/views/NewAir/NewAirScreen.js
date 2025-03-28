import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Picker } from "@react-native-picker/picker";
import { useWindowDimensions } from "react-native";
import UserSearchComponent from "../UserSearchComponent/UserSearchComponent";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const NewAirScreen = () => {
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "general", title: "General" },
    { key: "details", title: "Detalles" },
  ]);

  const [branches, setBranches] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [machineData, setMachineData] = useState({
    name: "",
    type: "",
    manufacturer: "",
    coolingCapacity: "",
    heatingCapacity: "",
    refrigerantType: "",
    branchId: "",
    sectorId: "",
    branchName: "", // Nuevo campo para el nombre de la sucursal
    sectorName: "" // Nuevo campo para el nombre del sector
  });

  // Cargar sucursales desde el usuario seleccionado
  useEffect(() => {
    if (selectedUser?.sucursales) {
      setBranches(selectedUser.sucursales);
      // Resetear selecciones cuando cambia el usuario
      setMachineData(prev => ({
        ...prev,
        branchId: "",
        sectorId: "",
        branchName: "",
        sectorName: ""
      }));
      setSectors([]);
    } else {
      setBranches([]);
      setSectors([]);
    }
  }, [selectedUser]);

  // Cargar sectores filtrados por sucursal seleccionada
  useEffect(() => {
    if (machineData.branchId && selectedUser?.sectores) {
      const filteredSectors = selectedUser.sectores.filter(
        sector => sector.sucursal === machineData.branchId
      );
      setSectors(filteredSectors);
      
      // Actualizar el nombre de la sucursal seleccionada
      const selectedBranch = branches.find(b => b._id === machineData.branchId);
      if (selectedBranch) {
        setMachineData(prev => ({
          ...prev,
          branchName: selectedBranch.nombre
        }));
      }
    } else {
      setSectors([]);
      setMachineData(prev => ({
        ...prev,
        sectorId: "",
        sectorName: ""
      }));
    }
  }, [machineData.branchId, selectedUser]);

  const handleInputChange = (name, value) => {
    setMachineData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectorChange = (sectorId) => {
    const selectedSector = sectors.find(s => s._id === sectorId);
    setMachineData(prev => ({
      ...prev,
      sectorId,
      sectorName: selectedSector ? selectedSector.nombre : ""
    }));
  };

  const validateForm = () => {
    const requiredFields = {
      name: "Nombre de la máquina",
      type: "Tipo de máquina",
      branchId: "Sucursal",
      sectorId: "Sector"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!machineData[field]) {
        Alert.alert("Error", `Por favor ingrese ${label}`);
        return false;
      }
    }
    
    // Validación adicional para campos numéricos
    if (machineData.type === "Aire Acondicionado") {
      if (machineData.coolingCapacity && isNaN(parseFloat(machineData.coolingCapacity))) {
        Alert.alert("Error", "La capacidad de enfriamiento debe ser un número");
        return false;
      }
      if (machineData.heatingCapacity && isNaN(parseFloat(machineData.heatingCapacity))) {
        Alert.alert("Error", "La capacidad de calefacción debe ser un número");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      
      const payload = {
        ...machineData,
        userId: selectedUser._id,
        userEmail: selectedUser.email,
        userName: selectedUser.username,
        // Eliminar campos temporales antes de enviar
        branchName: undefined,
        sectorName: undefined
      };
      
      delete payload.branchName;
      delete payload.sectorName;

      const response = await axios.post(
        "https://rosensteininstalaciones.com.ar/api/machines",
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );

      Alert.alert("Éxito", "Máquina creada correctamente");
      
      // Resetear formulario
      setMachineData({
        name: "",
        type: "",
        manufacturer: "",
        coolingCapacity: "",
        heatingCapacity: "",
        refrigerantType: "",
        branchId: "",
        sectorId: "",
        branchName: "",
        sectorName: ""

      });
      
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      let errorMessage = "Error al crear máquina";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Error de conexión. Verifique su internet";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const GeneralTab = () => (
    <View style={styles.tabContent}>
      <ScrollView>
      <Text style={styles.label}>Tipo de máquina*</Text>
        <Picker
          selectedValue={machineData.type}
          onValueChange={(value) => handleInputChange("type", value)}
          style={styles.input}
          dropdownIconColor="#1D1936"
        >
          <Picker.Item label="Seleccione un tipo" value="" />
          <Picker.Item label="Aire Acondicionado" value="Aire Acondicionado" />
          <Picker.Item label="Cabina de Pintura" value="Cabina de Pintura" />
          <Picker.Item label="Caldera" value="Caldera" />
          <Picker.Item label="Compresor de Aire" value="Compresor de Aire" />
          <Picker.Item label="AutoElevador" value="AutoElevador" />
        </Picker>
        <Text style={styles.label}>Nombre o Modelo de la Maquina*</Text>
        <TextInput
          style={styles.input}
          value={machineData.name}
          onChangeText={(value) => handleInputChange("name", value)}
          placeholder="Ejemplo: Samsung Split"
          maxLength={50}
        />
        
        <Text style={styles.label}>Sucursal*</Text>
        <Picker
          selectedValue={machineData.branchId}
          onValueChange={(value) => handleInputChange("branchId", value)}
          style={styles.input}
          dropdownIconColor="#1D1936"
        >
          <Picker.Item label="Seleccione una sucursal" value="" />
          {branches.map((branch) => (
            <Picker.Item 
              key={branch._id} 
              label={branch.nombre} 
              value={branch._id} 
            />
          ))}
        </Picker>
        
        {machineData.branchName ? (
          <Text style={styles.selectedInfo}>Sucursal seleccionada: {machineData.branchName}</Text>
        ) : null}
        
        <Text style={styles.label}>Sector*</Text>
        <Picker
          selectedValue={machineData.sectorId}
          onValueChange={handleSectorChange}
          style={styles.input}
          enabled={!!machineData.branchId && sectors.length > 0}
          dropdownIconColor="#1D1936"
        >
          <Picker.Item 
            label={!machineData.branchId ? "Seleccione una sucursal primero" : sectors.length === 0 ? "No hay sectores disponibles" : "Seleccione un sector"} 
            value="" 
          />
          {sectors.map((sector) => (
            <Picker.Item 
              key={sector._id} 
              label={`${sector.nombre} (${sector.codigo})`} 
              value={sector._id} 
            />
          ))}
        </Picker>
        
        {machineData.sectorName ? (
          <Text style={styles.selectedInfo}>Sector seleccionado: {machineData.sectorName}</Text>
        ) : null}

     
      </ScrollView>
    </View>
  );

  const DetailsTab = () => (
    <View style={styles.tabContent}>
      <ScrollView>
        {machineData.type === "Aire Acondicionado" && (
          <>
            <Text style={styles.label}>Capacidad de enfriamiento (BTU)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.coolingCapacity} 
              onChangeText={(value) => handleInputChange("coolingCapacity", value)} 
              placeholder="3500" 
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.label}>Capacidad de calefacción (BTU)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.heatingCapacity} 
              onChangeText={(value) => handleInputChange("heatingCapacity", value)} 
              placeholder="4000" 
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.label}>Tipo de refrigerante</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.refrigerantType} 
              onChangeText={(value) => handleInputChange("refrigerantType", value)} 
              placeholder="R410A" 
              maxLength={20}
            />
          </>
        )}
        
        {machineData.type === "Cabina de Pintura" && (
          <>
            <Text style={styles.label}>Medida de Filtros de Techo</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.cabinSize} 
              onChangeText={(value) => handleInputChange("cabinSize", value)} 
              placeholder="3x3m" 
              maxLength={20}
            />
            <Text style={styles.label}>Medida de Filtros piso</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.filterType} 
              onChangeText={(value) => handleInputChange("filterType", value)} 
              placeholder="HEPA" 
              maxLength={30}
            />
            <Text style={styles.label}>Modulo de Ignicion (Modelo)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.airFlow} 
              onChangeText={(value) => handleInputChange("airFlow", value)} 
              placeholder="2000" 
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.label}>Motor de Extraccion (HP/Amp)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.airFlow} 
              onChangeText={(value) => handleInputChange("airFlow", value)} 
              placeholder="2000" 
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.label}>Moto de Recirculacion(HP/Amp)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.airFlow} 
              onChangeText={(value) => handleInputChange("airFlow", value)} 
              placeholder="2000" 
              keyboardType="numeric"
              maxLength={6}
            />
          </>
        )}
        
        {machineData.type === "Caldera" && (
          <>
            <Text style={styles.label}>Cantidad de Radiadores</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.powerOutput} 
              onChangeText={(value) => handleInputChange("powerOutput", value)} 
              placeholder="100" 
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.label}>Cantidad de Colectores</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.maxPressure} 
              onChangeText={(value) => handleInputChange("maxPressure", value)} 
              placeholder="15" 
              keyboardType="numeric"
              maxLength={4}
            />
            <Text style={styles.label}>Dual (Si / No)</Text>
            <Picker
          selectedValue={machineData.type}
          onValueChange={(value) => handleInputChange("type", value)}
          style={styles.input}
          dropdownIconColor="#1D1936"
        >
          <Picker.Item label="Seleccione un valor" value="" />
          <Picker.Item label="Si" value="Si" />
          <Picker.Item label="No" value="No" />
          
        </Picker>
             <Text style={styles.label}>Tiraje Forzado (Si / No)</Text>
             <Picker
          selectedValue={machineData.type}
          onValueChange={(value) => handleInputChange("type", value)}
          style={styles.input}
          dropdownIconColor="#1D1936"
        >
          <Picker.Item label="Seleccione un valor" value="" />
          <Picker.Item label="Si" value="Si" />
          <Picker.Item label="No" value="No" />
          
        </Picker>
            
          </>
        )}
        
        <Text style={styles.label}>Fabricante</Text>
        <TextInput 
          style={styles.input} 
          value={machineData.manufacturer} 
          onChangeText={(value) => handleInputChange("manufacturer", value)} 
          placeholder="Ejemplo: Samsung" 
          maxLength={50}
        />
      </ScrollView>

    </View>
  );

  const renderScene = SceneMap({
    general: GeneralTab,
    details: DetailsTab,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Máquina</Text>
      
      <View style={styles.userSection}>
        <UserSearchComponent />
        {selectedUser && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfo}>Usuario: {selectedUser.username}</Text>
            <Text style={styles.userInfo}>Empresa: {selectedUser.empresa}</Text>
          </View>
        )}
      </View>
      
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "#fff" }}
            style={{ backgroundColor: "#1D1936" }}
            labelStyle={{ color: "#1D1936", fontWeight: "bold" }}
          />
        )}
      />

      {isSubmitting ? (
        <ActivityIndicator size="large" color="#1D1936" style={styles.submitButton} />
      ) : (
        <Button 
          title="Crear Máquina" 
          onPress={handleSubmit} 
          color="#1D1936" 
          style={{ backgroundColor: "#1D1936" }}
          disabled={!selectedUser}
        />
      )}
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
    color: "#1D1936",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    color: "#333",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  userSection: {
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  userInfoContainer: {
    marginTop: 8,
  },
  userInfo: {
    fontSize: 14,
    color: "#555",
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  selectedInfo: {
    fontSize: 14,
    color: "#1D1936",
    marginTop: 4,
    fontStyle: "italic",
  },
});

export default NewAirScreen;