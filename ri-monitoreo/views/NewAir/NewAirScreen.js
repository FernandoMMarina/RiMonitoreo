import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { Picker } from "@react-native-picker/picker";
import { useWindowDimensions } from "react-native";
import UserSearchComponent from "../UserSearchComponent/UserSearchComponent";
import { useSelector } from "react-redux";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = 'https://rosensteininstalaciones.com.ar/api';

const MACHINE_TYPES = {
 "Cabina de Pintura": [
    { name: "filtrosTecho", label: "Filtros Techo (medida)", type: "text" },
    { name: "filtrosPiso", label: "Filtros Piso (medida)", type: "text" },
    { name: "moduloIgnicion", label: "Módulo de Ignición", type: "text" },
    { name: "motorExtraccionHP", label: "Motor Extracción (HP)", type: "number" },
    { name: "motorExtraccionAmp", label: "Motor Extracción (Amp)", type: "number" },
    { name: "motorRecirculacionHP", label: "Motor Recirculación (HP)", type: "number" },
    { name: "motorRecirculacionAmp", label: "Motor Recirculación (Amp)", type: "number" },
  ],
  "Caldera": [
    { name: "marcaModeloCaldera", label: "Marca/Modelo", type: "text" },
    { name: "cantidadRadiadores", label: "Cantidad de Radiadores", type: "number" },
    { name: "cantidadColectores", label: "Cantidad de Colectores", type: "number" },
    { name: "dual", label: "Dual", type: "boolean" },
    { name: "tirajeForzado", label: "Tiraje Forzado", type: "boolean" },
  ],
  "Compresor de Aire": [
    { name: "marcaModeloCompresor", label: "Marca y Modelo", type: "text" },
    { name: "motorElectricoHP", label: "Motor Eléctrico (HP)", type: "number" },
    { name: "motorElectricoAmp", label: "Motor Eléctrico (Amp)", type: "number" },
    { name: "correa", label: "Correa (modelo)", type: "text" },
    { name: "purgador", label: "Purgador", type: "boolean" },
    { name: "tipoAceite", label: "Tipo de Aceite", type: "text" },
  ],
  "Aire Acondicionado Roof Top": [
    { name: "marcaModeloRoofTop", label: "Marca/Modelo", type: "text" },
    { name: "heatingCapacity", label: "Capacidad de Calefacción", type: "text" },
    { name: "coolingCapacity", label: "Capacidad de Refrigeración", type: "text" },
    { name: "toneladas", label: "Toneladas", type: "number" },
    { name: "refrigeranteRoofTop", label: "Tipo de Refrigerante", type: "text" },
  ],
  "Aire Acondicionado Piso Techo": [
    { name: "marcaModeloPisoTecho", label: "Marca/Modelo", type: "text" },
    { name: "heatingCapacity", label: "Capacidad de Calefacción", type: "text" },
    { name: "coolingCapacity", label: "Capacidad de Refrigeración", type: "text" },
    { name: "refrigerantePisoTecho", label: "Tipo de Refrigerante", type: "text" },
    { name: "numeroFasesPisoTecho", label: "Número de Fases", type: "number" },
  ],
  "Aire Acondicionado Bajo Silueta": [
    { name: "marcaModeloBajoSilueta", label: "Marca/Modelo", type: "text" },
    { name: "heatingCapacity", label: "Capacidad de Calefacción", type: "text" },
    { name: "coolingCapacity", label: "Capacidad de Refrigeración", type: "text" },
    { name: "refrigeranteBajoSilueta", label: "Tipo de Refrigerante", type: "text" },
    { name: "numeroFasesBajoSilueta", label: "Número de Fases", type: "number" },
  ],
  "Aire Acondicionado Multiposición": [
    { name: "marcaModeloMultiposicion", label: "Marca/Modelo", type: "text" },
    { name: "heatingCapacity", label: "Capacidad de Calefacción", type: "text" },
    { name: "coolingCapacity", label: "Capacidad de Refrigeración", type: "text" },
    { name: "refrigeranteMultiposicion", label: "Tipo de Refrigerante", type: "text" },
    { name: "numeroFasesMultiposicion", label: "Número de Fases", type: "number" },
  ],
  "Aire Acondicionado": [
    { name: "marcaModeloPisoTecho", label: "Marca/Modelo", type: "text" },
    { name: "refrigerante", label: "Tipo de Refrigerante", type: "text" },
    { name: "heatingCapacity", label: "Capacidad de Calefacción", type: "text" },
    { name: "coolingCapacity", label: "Capacidad de Refrigeración", type: "text" },
  ],
  "Tablero Electrico": [
    { name: "amperaje", label: "Amperaje", type: "text" },
    { name: "cantidadDeCircuitos", label: "Cantidad de Circuitos", type: "text" },
  ],
};

const NewMachineScreen = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectores, setSectores] = useState([]);

  // Datos generales
  const [formData, setFormData] = useState({
  // Generales
  name: "",
  model: "",
  brand: "",
  manufacturer: "",
  serial: "",
  installationDate: "",
  location: "",
  notes: "",
  frecuenciaMantenimiento: "",
  estado: "activa",
  type: "Aire Acondicionado",// tipo por defecto// Aire Acondicionado
  refrigerant: "",
  phases: "",
  voltage: "",
  cooling_capacity: "",
  heatingCapacity: "",

  // Caldera
  radiators: "",
  dual: "No",
  forced_draft: "No",
  marcaModeloCaldera: "",
  cantidadColectores: "",

  // Cabina de Pintura
  ceiling_filter: "",
  floor_filter: "",
  ignition_module: "",
  extraction_motor_hp: "",
  extraction_motor_amp: "",
  recirculation_motor_hp: "",
  recirculation_motor_amp: "",

  // Compresor de Aire
  marcaModeloCompresor: "",
  motor_hp: "",
  motor_amp: "",
  belt_model: "",
  has_purge: "No",
  oil_type: "",

  // Roof Top
  brand_model_rooftop: "",
  toneladas: "",
  refrigeranteRoofTop: "",

  // Piso Techo
  brand_model_pisotecho: "",
  refrigerant_pisotecho: "",
  phases_pisotecho: "",

  // Bajo Silueta
  brand_model_bajoSilueta: "",
  refrigerant_bajoSilueta: "",
  phases_bajoSilueta: "",

  // Multiposición
  brand_model_multiposicion: "",
  refrigerant_multiposicion: "",
  phases_multiposicion: "",

  // Tablero Eléctrico
  amperaje: "",
  cantidadDeCircuitos: "",
});

// Actualizar sectores cuando cambia la sucursal
useEffect(() => {
  if (selectedSucursal && selectedUser) {
    const sectoresFiltrados = selectedUser.sectores?.filter(
      (s) => !s.sucursal || s.sucursal === selectedSucursal
    );
    setSectores(sectoresFiltrados || []);
    setSelectedSector(null);
  }
}, [selectedSucursal, selectedUser]);

  const routes = [
    { key: "client", title: "Cliente" },
    { key: "general", title: "Datos Generales" },
    { key: "specific", title: "Detalles Técnicos" },
    { key: "summary", title: "Resumen" },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderGeneralTab = () => (
  <ScrollView contentContainerStyle={styles.tabContent}>
    <Text style={styles.label}>Nombre*</Text>
    <TextInput
      style={styles.input}
      value={formData.name}
      onChangeText={(text) => handleInputChange("name", text)}
      placeholder="Ej: Split Inverter"
    />

    <Text style={styles.label}>Modelo*</Text>
    <TextInput
      style={styles.input}
      value={formData.model}
      onChangeText={(text) => handleInputChange("model", text)}
      placeholder="Ej: AR12TXC"
    />

    <Text style={styles.label}>Marca*</Text>
    <TextInput
      style={styles.input}
      value={formData.brand}
      onChangeText={(text) => handleInputChange("brand", text)}
      placeholder="Ej: Samsung"
    />

    <Text style={styles.label}>Fabricante*</Text>
    <TextInput
      style={styles.input}
      value={formData.manufacturer}
      onChangeText={(text) => handleInputChange("manufacturer", text)}
      placeholder="Ej: Samsung"
    />

    <Text style={styles.label}>Fecha de Instalación</Text>
    <TextInput
      style={styles.input}
      value={formData.installationDate}
      onChangeText={(text) => handleInputChange("installationDate", text)}
      placeholder="YYYY-MM-DD"
    />

    <Text style={styles.label}>Ubicación</Text>
    <TextInput
      style={styles.input}
      value={formData.location}
      onChangeText={(text) => handleInputChange("location", text)}
    />

    <Text style={styles.label}>Notas</Text>
    <TextInput
      style={[styles.input, { height: 80 }]}
      value={formData.notes}
      onChangeText={(text) => handleInputChange("notes", text)}
      multiline
    />

    <Text style={styles.label}>Tipo de Máquina*</Text>
    <Picker
      selectedValue={formData.type}
      onValueChange={(value) => handleInputChange("type", value)}
      style={styles.picker}
    >
      {Object.keys(MACHINE_TYPES).map((typeName) => (
        <Picker.Item key={typeName} label={typeName} value={typeName} />
      ))}
    </Picker>
  </ScrollView>
);

  const renderSpecificFields = () => {
    const machineTypeFields = MACHINE_TYPES[formData.type];

    return (
      <>
        {machineTypeFields?.map((field) => {
          if (field.type === "picker") {
            return (
              <View key={field.name} style={styles.fieldContainer}>
                <Text style={styles.label}>{field.label}</Text>
                <Picker
                  selectedValue={formData[field.name]}
                  onValueChange={(value) => handleInputChange(field.name, value)}
                  style={styles.picker}
                >
                  {field.options.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            );
          }
          
          return (
            <View key={field.name} style={styles.fieldContainer}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={formData[field.name]}
                onChangeText={(text) => handleInputChange(field.name, text)}
                keyboardType={field.type === "number" ? "numeric" : "default"}
              />
            </View>
          );
        })}
      </>
    );
  };

  const renderSpecificTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {renderSpecificFields()}
    </ScrollView>
  );

  const renderSummaryTab = () => {
    const machineTypeFields = MACHINE_TYPES[formData.type];

    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <Text style={styles.sectionTitle}>Datos Generales</Text>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Nombre:</Text>
          <Text style={styles.summaryValue}>{formData.name || "-"}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Modelo:</Text>
          <Text style={styles.summaryValue}>{formData.model || "-"}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Marca:</Text>
          <Text style={styles.summaryValue}>{formData.brand || "-"}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tipo:</Text>
          <Text style={styles.summaryValue}>{formData.type || "-"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Detalles Técnicos</Text>
        {machineTypeFields?.map((field) => (
          <View key={field.name} style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{field.label}:</Text>
            <Text style={styles.summaryValue}>{formData[field.name] || "-"}</Text>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Guardar Máquina</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderClientTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionTitle}>Selección de Cliente</Text>
      
      <UserSearchComponent />
      
      {selectedUser && (
        <View style={styles.userInfo}>
          <Text style={styles.label}>Usuario:</Text>
          <Text>{selectedUser.username}</Text>
          
          <Text style={styles.label}>Empresa:</Text>
          <Text>{selectedUser.empresa}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Datos de Ubicación</Text>
      
      <Text style={styles.label}>Sucursal*</Text>
      <Picker
        selectedValue={selectedSucursal}
        onValueChange={setSelectedSucursal}
        style={styles.picker}
        enabled={!!selectedUser}
      >
        <Picker.Item label="Seleccione una sucursal" value={null} />
        {selectedUser?.sucursales?.map((suc) => (
          <Picker.Item key={suc._id} label={suc.nombre} value={suc._id} />
        ))}
      </Picker>

      <Text style={styles.label}>Sector*</Text>
      <Picker
        selectedValue={selectedSector}
        onValueChange={setSelectedSector}
        style={styles.picker}
        enabled={!!selectedSucursal}
      >
        <Picker.Item label="Seleccione un sector" value={null} />
        {sectores.map((sec) => (
  <Picker.Item key={sec._id} label={sec.nombre} value={sec._id} />
))}
      </Picker>
    </ScrollView>
  );

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case "client":
        return renderClientTab();
      case "general":
        return renderGeneralTab();
      case "specific":
        return renderSpecificTab();
      case "summary":
        return renderSummaryTab();
      default:
        return null;
    }
  }, [formData, selectedUser, selectedSucursal, selectedSector, sectores]);

  // Validación antes de avanzar
  const canGoNext = () => {
    switch (index) {
      case 0: // Tab Cliente
        return selectedUser && selectedSucursal && selectedSector;
      case 1: // Tab General
        return formData.name && formData.model && formData.brand;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canGoNext()) {
      Alert.alert("Faltan datos", "Complete todos los campos obligatorios");
      return;
    }
    setIndex(prev => Math.min(prev + 1, routes.length - 1));
  };

const convertToBoolean = (value) => {
  if (value === "Sí") return true;
  if (value === "No") return false;
  return value;
};

const BOOLEAN_FIELDS = ["dual", "tirajeForzado", "purgador"];

const handleSubmit = async () => {
  try {
    setIsSubmitting(true);

    // Convertir booleanos
    const machinePayload = {
      ...formData,
      sucursal: selectedSucursal,
      sector: selectedSector,
      createdBy: selectedUser._id,
    };

    BOOLEAN_FIELDS.forEach((field) => {
      if (formData.hasOwnProperty(field)) {
        machinePayload[field] = convertToBoolean(formData[field]);
      }
    });

    console.log("Payload para crear máquina:", machinePayload);
    const token = await AsyncStorage.getItem('accessToken');
    console.log("token",token)
    // Paso 1: Crear la máquina
    const response = await axios.post(
      `${API_URL}/machines`,
      machinePayload,
      {headers: { Authorization: `Bearer ${token}` },}
    );

    const createdMachine = response.data;
    console.log("Máquina creada:", createdMachine);
    console.log("User Id",selectedUser._id,"Machine id",createdMachine._id)
    // Paso 2: Asignar la máquina al usuario
    machineId = createdMachine._id;
    await axios.post(
      `${API_URL}/users/users/add-machine/`,{userId:selectedUser._id,machineId},
      {headers: { Authorization: `Bearer ${token}` },}
    );

    Alert.alert("Éxito", "Máquina creada y asignada correctamente");
    // Podés reiniciar o navegar
  } catch (error) {
    console.error("Error en la creación o asignación:", error.response?.data || error.message);
    Alert.alert("Error", "Hubo un problema al crear o asignar la máquina.");
  } finally {
    setIsSubmitting(false);
  }
};



  const validateForm = () => {
    if (!formData.name || !formData.model || !formData.brand) {
      Alert.alert("Error", "Complete los campos obligatorios");
      return false;
    }
    return true;
  };

 
  return (
    <KeyboardAvoidingView 
      style={styles.flex1} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
          />
        )}
        swipeEnabled={false} // Deshabilitar swipe para controlar validaciones
      />
      
      {index < routes.length - 1 && (
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canGoNext() && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!canGoNext()}
        >
          <Text style={styles.nextButtonText}>
            {index === routes.length - 2 ? "Finalizar" : "Siguiente"}
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = {
  flex1: {
    flex: 1
  },
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },
  tabContent: {
    padding: 20,
    paddingBottom: 80
  },
  fieldContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff"
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 4
  },
  fullWidthPicker: {
    width: "100%",
    marginTop: 10
  },
  tabBar: {
    backgroundColor: "#1D1936"
  },
  tabIndicator: {
    backgroundColor: "#fff",
    height: 3
  },
  tabLabel: {
    color: "#fff",
    fontWeight: "bold"
  },
  nextButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1D1936",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 3
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "bold"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#1D1936"
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  summaryLabel: {
    fontWeight: "600",
    color: "#555"
  },
  summaryValue: {
    fontWeight: "400"
  },
  submitButton: {
    backgroundColor: "#1D1936",
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    alignItems: "center"
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
  userInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8
  }
};

export default NewMachineScreen;