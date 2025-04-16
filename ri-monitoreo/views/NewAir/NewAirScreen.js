import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Picker } from "@react-native-picker/picker";
import { useWindowDimensions } from "react-native";
import UserSearchComponent from "../UserSearchComponent/UserSearchComponent";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import styles from './styles';

const NewAirScreen = () => {
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "general", title: "General" },
    { key: "details", title: "Detalles" },
    { key: "preview", title: "Resumen" },
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
    sucursal: "",
    sectorId: "",
    sucursalNombre: "",
    sectorNombre: "",
  
    // Cabina de Pintura
    filtrosTecho: "",
    filtrosPiso: "",
    moduloIgnicion: "",
    motorExtraccion: "",
    motorRecirculacion: "",
  
    // Caldera
    marcaModelo: "",
    cantidadRadiadores: "",
    cantidadColectores: "",
    dual: "",
    tirajeForzado: "",
  
    // Compresor de Aire
    motorElectrico: "",
    correa: "",
    purgador: "",
    tipoAceite: "",
  
    // Aire Roof Top
    toneladas: "",
  
    // Aire Piso Techo / Bajo Silueta / Multiposición
    fases: "",
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
    if (machineData.sucursal && selectedUser?.sectores) {
      const filteredSectors = selectedUser.sectores.filter(
        sector => sector.sucursal === machineData.sucursal
      );
      setSectors(filteredSectors);
  
      const selectedBranch = branches.find(b => b._id === machineData.sucursal);
      if (selectedBranch) {
        setMachineData(prev => ({
          ...prev,
          sucursalNombre: selectedBranch.nombre
        }));
      }
    } else {
      setSectors([]);
      setMachineData(prev => ({
        ...prev,
        sectorId: "",
        sectorNombre: ""
      }));
    }
  }, [machineData.sucursal, selectedUser]);
  
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

  const clonarDatosBase = (data) => {
    return {
      ...data,
      name: "",
      marcaModelo: "",
      coolingCapacity: "",
      heatingCapacity: "",
      refrigerantType: "",
      filtrosTecho: "",
      filtrosPiso: "",
      moduloIgnicion: "",
      motorExtraccion: "",
      motorRecirculacion: "",
      cantidadRadiadores: "",
      cantidadColectores: "",
      dual: "",
      tirajeForzado: "",
      motorElectrico: "",
      correa: "",
      purgador: "",
      tipoAceite: "",
      toneladas: "",
      fases: "",
    };
  };
  
  const handleSubmit = () => {
    const errores = getResumenErrores(machineData);
  
    if (errores.length > 0) {
      Alert.alert("Error", "Faltan completar algunos campos obligatorios");
      setIndex(2); // Cambia al tab Resumen
      return;
    }
  
    Alert.alert(
      "Confirmar creación",
      "¿Estás seguro de que querés crear esta máquina con los datos ingresados?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => enviarMaquina() }
      ]
    );
  };

  const enviarMaquina = async () => {
    setIsSubmitting(true);
  
    try {
      const token = await AsyncStorage.getItem("token");
  
      const payload = {
        ...machineData,
        userId: selectedUser._id,
        userEmail: selectedUser.email,
        userName: selectedUser.username,
        sucursal: machineData.sucursal,
        sector: machineData.sectorId,
      };
  
      delete payload.sucursalNombre;
      delete payload.sectorNombre;
  
      const response = await axios.post(
        "https://rosensteininstalaciones.com.ar/api/machines",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      Alert.alert(
        "Máquina creada",
        "¿Querés crear otra similar?",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => {
              setMachineData({
                name: "",
                type: "",
                manufacturer: "",
                coolingCapacity: "",
                heatingCapacity: "",
                refrigerantType: "",
                sucursal: "",
                sectorId: "",
                sucursalNombre: "",
                sectorNombre: "",
      
                filtrosTecho: "",
                filtrosPiso: "",
                moduloIgnicion: "",
                motorExtraccion: "",
                motorRecirculacion: "",
      
                marcaModelo: "",
                cantidadRadiadores: "",
                cantidadColectores: "",
                dual: "",
                tirajeForzado: "",
      
                motorElectrico: "",
                correa: "",
                purgador: "",
                tipoAceite: "",
      
                toneladas: "",
                fases: "",
              });
              setIndex(0);
            }
          },
          {
            text: "Sí",
            onPress: () => {
              const nuevosDatos = clonarDatosBase(machineData);
              setMachineData(nuevosDatos);
              setIndex(0);
            }
          }
        ]
      );
      
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
          <Picker.Item label="Aire Acondicionado" value="Aire Acondicionado" />
          <Picker.Item label="Cabina de Pintura" value="Cabina de Pintura" />
          <Picker.Item label="Caldera" value="Caldera" />
          <Picker.Item label="Compresor de Aire" value="Compresor de Aire" />
          <Picker.Item label="Aire Roof Top" value="Aire Roof Top" />
          <Picker.Item label="Aire Piso Techo" value="Aire Piso Techo" />
          <Picker.Item label="Bajo Silueta" value="Bajo Silueta" />
          <Picker.Item label="Multiposición" value="Multiposición" />
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
          selectedValue={machineData.sucursal}
          onValueChange={(value) => handleInputChange("sucursal", value)}
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

        {machineData.sucursalNombre ? (
          <Text style={styles.selectedInfo}>Sucursal seleccionada: {machineData.sucursalNombre}</Text>
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
            <Text style={styles.label}>Filtros de Techo (medida)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.filtrosTecho} 
              onChangeText={(value) => handleInputChange("filtrosTecho", value)} 
            />
            <Text style={styles.label}>Filtros de Piso (medida)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.filtrosPiso} 
              onChangeText={(value) => handleInputChange("filtrosPiso", value)} 
            />
            <Text style={styles.label}>Módulo de Ignición (modelo)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.moduloIgnicion} 
              onChangeText={(value) => handleInputChange("moduloIgnicion", value)} 
            />
            <Text style={styles.label}>Motor de Extracción (HP/Amp)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.motorExtraccion} 
              onChangeText={(value) => handleInputChange("motorExtraccion", value)} 
            />
            <Text style={styles.label}>Motor de Recirculación (HP/Amp)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.motorRecirculacion} 
              onChangeText={(value) => handleInputChange("motorRecirculacion", value)} 
            />
          </>
        )}
  
        {machineData.type === "Caldera" && (
          <>
            <Text style={styles.label}>Marca / Modelo</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.marcaModelo} 
              onChangeText={(value) => handleInputChange("marcaModelo", value)} 
            />
            <Text style={styles.label}>Cantidad de Radiadores</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.cantidadRadiadores} 
              onChangeText={(value) => handleInputChange("cantidadRadiadores", value)} 
              keyboardType="numeric"
            />
            <Text style={styles.label}>Cantidad de Colectores</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.cantidadColectores} 
              onChangeText={(value) => handleInputChange("cantidadColectores", value)} 
              keyboardType="numeric"
            />
            <Text style={styles.label}>Dual</Text>
            <Picker
              selectedValue={machineData.dual}
              onValueChange={(value) => handleInputChange("dual", value)}
              style={styles.input}
            >
              <Picker.Item label="Seleccione" value="" />
              <Picker.Item label="Sí" value="Sí" />
              <Picker.Item label="No" value="No" />
            </Picker>
            <Text style={styles.label}>Tiraje Forzado</Text>
            <Picker
              selectedValue={machineData.tirajeForzado}
              onValueChange={(value) => handleInputChange("tirajeForzado", value)}
              style={styles.input}
            >
              <Picker.Item label="Seleccione" value="" />
              <Picker.Item label="Sí" value="Sí" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </>
        )}
  
        {machineData.type === "Compresor de Aire" && (
          <>
            <Text style={styles.label}>Motor Eléctrico (HP/Amp)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.motorElectrico} 
              onChangeText={(value) => handleInputChange("motorElectrico", value)} 
            />
            <Text style={styles.label}>Correa (modelo)</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.correa} 
              onChangeText={(value) => handleInputChange("correa", value)} 
            />
            <Text style={styles.label}>Purgador</Text>
            <Picker
              selectedValue={machineData.purgador}
              onValueChange={(value) => handleInputChange("purgador", value)}
              style={styles.input}
            >
              <Picker.Item label="Seleccione" value="" />
              <Picker.Item label="Sí" value="Sí" />
              <Picker.Item label="No" value="No" />
            </Picker>
            <Text style={styles.label}>Tipo de Aceite</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.tipoAceite} 
              onChangeText={(value) => handleInputChange("tipoAceite", value)} 
            />
          </>
        )}
  
        {machineData.type === "Aire Roof Top" && (
          <>
            <Text style={styles.label}>Marca / Modelo</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.marcaModelo} 
              onChangeText={(value) => handleInputChange("marcaModelo", value)} 
            />
            <Text style={styles.label}>Toneladas</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.toneladas} 
              onChangeText={(value) => handleInputChange("toneladas", value)} 
              keyboardType="numeric"
            />
          </>
        )}
  
          {machineData.type === "Aire Piso Techo" && (
          <>
            <Text style={styles.label}>Marca / Modelo</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.marcaModelo} 
              onChangeText={(value) => handleInputChange("marcaModelo", value)} 
            />
            <Text style={styles.label}>Refrigerante</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.refrigerantType} 
              onChangeText={(value) => handleInputChange("refrigerantType", value)} 
            />
            <Text style={styles.label}>Fases</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.fases} 
              onChangeText={(value) => handleInputChange("fases", value)} 
              keyboardType="numeric"
            />
          </>
        )}

        {machineData.type === "Bajo Silueta" && (
          <>
            <Text style={styles.label}>Marca / Modelo</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.marcaModelo} 
              onChangeText={(value) => handleInputChange("marcaModelo", value)} 
            />
            <Text style={styles.label}>Refrigerante</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.refrigerantType} 
              onChangeText={(value) => handleInputChange("refrigerantType", value)} 
            />
            <Text style={styles.label}>Fases</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.fases} 
              onChangeText={(value) => handleInputChange("fases", value)} 
              keyboardType="numeric"
            />
          </>
        )}

        {machineData.type === "Multiposición" && (
          <>
            <Text style={styles.label}>Marca / Modelo</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.marcaModelo} 
              onChangeText={(value) => handleInputChange("marcaModelo", value)} 
            />
            <Text style={styles.label}>Refrigerante</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.refrigerantType} 
              onChangeText={(value) => handleInputChange("refrigerantType", value)} 
            />
            <Text style={styles.label}>Fases</Text>
            <TextInput 
              style={styles.input} 
              value={machineData.fases} 
              onChangeText={(value) => handleInputChange("fases", value)} 
              keyboardType="numeric"
            />
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
  
  const getResumenErrores = (data) => {
    const errores = [];
  
    // Campos comunes
    if (!data.name) errores.push("Falta el nombre de la máquina");
    if (!data.type) errores.push("Falta seleccionar el tipo de máquina");
    if (!data.sucursalNombre) errores.push("Falta seleccionar una sucursal");
    if (!data.sectorNombre) errores.push("Falta seleccionar un sector");
  
    // Por tipo de máquina
    switch (data.type) {
      case "Aire Acondicionado":
        if (!data.coolingCapacity) errores.push("Falta la capacidad de enfriamiento");
        if (!data.heatingCapacity) errores.push("Falta la capacidad de calefacción");
        if (!data.refrigerantType) errores.push("Falta el tipo de refrigerante");
        break;
  
      case "Cabina de Pintura":
        if (!data.filtrosTecho) errores.push("Faltan los filtros de techo");
        if (!data.filtrosPiso) errores.push("Faltan los filtros de piso");
        if (!data.moduloIgnicion) errores.push("Falta el módulo de ignición");
        if (!data.motorExtraccion) errores.push("Falta el motor de extracción");
        if (!data.motorRecirculacion) errores.push("Falta el motor de recirculación");
        break;
  
      case "Caldera":
        if (!data.marcaModelo) errores.push("Falta la marca/modelo");
        if (!data.cantidadRadiadores) errores.push("Faltan los radiadores");
        if (!data.cantidadColectores) errores.push("Faltan los colectores");
        if (!data.dual) errores.push("Falta especificar si es dual");
        if (!data.tirajeForzado) errores.push("Falta especificar el tiraje forzado");
        break;
  
      case "Compresor de Aire":
        if (!data.motorElectrico) errores.push("Falta el motor eléctrico");
        if (!data.correa) errores.push("Falta la correa");
        if (!data.purgador) errores.push("Falta indicar si tiene purgador");
        if (!data.tipoAceite) errores.push("Falta el tipo de aceite");
        break;
  
      case "Aire Roof Top":
        if (!data.marcaModelo) errores.push("Falta la marca/modelo");
        if (!data.toneladas) errores.push("Faltan las toneladas");
        break;
  
      case "Aire Piso Techo":
      case "Bajo Silueta":
      case "Multiposición":
        if (!data.marcaModelo) errores.push("Falta la marca/modelo");
        if (!data.refrigerantType) errores.push("Falta el tipo de refrigerante");
        if (!data.fases) errores.push("Faltan las fases");
        break;
    }
  
    return errores;
  };
  
  const ResumenTab = () => {
    const errores = getResumenErrores(machineData);
  
    return (
    <View style={styles.tabContent}>
      <ScrollView>
      {errores.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "red", fontWeight: "bold" }}>⚠️ Faltan datos:</Text>
            {errores.map((err, index) => (
              <Text key={index} style={{ color: "red" }}>• {err}</Text>
            ))}
          </View>
        )}
        <Text style={styles.label}>Nombre / Modelo:</Text>
        <Text>{machineData.name}</Text>
  
        <Text style={styles.label}>Tipo:</Text>
        <Text>{machineData.type}</Text>
  
        <Text style={styles.label}>Sucursal:</Text>
        <Text>{machineData.sucursalNombre}</Text>
  
        <Text style={styles.label}>Sector:</Text>
        <Text>{machineData.sectorNombre}</Text>
  
        <Text style={styles.label}>Fabricante:</Text>
        <Text>{machineData.manufacturer}</Text>
  
        {machineData.type === "Aire Acondicionado" && (
          <>
            <Text style={styles.label}>Enfriamiento:</Text>
            <Text>{machineData.coolingCapacity} BTU</Text>
            <Text style={styles.label}>Calefacción:</Text>
            <Text>{machineData.heatingCapacity} BTU</Text>
            <Text style={styles.label}>Refrigerante:</Text>
            <Text>{machineData.refrigerantType}</Text>
          </>
        )}
  
        {machineData.type === "Cabina de Pintura" && (
          <>
            <Text style={styles.label}>Filtros Techo:</Text>
            <Text>{machineData.filtrosTecho}</Text>
            <Text style={styles.label}>Filtros Piso:</Text>
            <Text>{machineData.filtrosPiso}</Text>
            <Text style={styles.label}>Módulo Ignición:</Text>
            <Text>{machineData.moduloIgnicion}</Text>
            <Text style={styles.label}>Motor Extracción:</Text>
            <Text>{machineData.motorExtraccion}</Text>
            <Text style={styles.label}>Motor Recirculación:</Text>
            <Text>{machineData.motorRecirculacion}</Text>
          </>
        )}
  
        {machineData.type === "Caldera" && (
          <>
            <Text style={styles.label}>Marca/Modelo:</Text>
            <Text>{machineData.marcaModelo}</Text>
            <Text style={styles.label}>Radiadores:</Text>
            <Text>{machineData.cantidadRadiadores}</Text>
            <Text style={styles.label}>Colectores:</Text>
            <Text>{machineData.cantidadColectores}</Text>
            <Text style={styles.label}>Dual:</Text>
            <Text>{machineData.dual}</Text>
            <Text style={styles.label}>Tiraje Forzado:</Text>
            <Text>{machineData.tirajeForzado}</Text>
          </>
        )}
  
        {machineData.type === "Compresor de Aire" && (
          <>
            <Text style={styles.label}>Motor Eléctrico:</Text>
            <Text>{machineData.motorElectrico}</Text>
            <Text style={styles.label}>Correa:</Text>
            <Text>{machineData.correa}</Text>
            <Text style={styles.label}>Purgador:</Text>
            <Text>{machineData.purgador}</Text>
            <Text style={styles.label}>Tipo de Aceite:</Text>
            <Text>{machineData.tipoAceite}</Text>
          </>
        )}
  
        {machineData.type === "Aire Roof Top" && (
          <>
            <Text style={styles.label}>Marca/Modelo:</Text>
            <Text>{machineData.marcaModelo}</Text>
            <Text style={styles.label}>Toneladas:</Text>
            <Text>{machineData.toneladas}</Text>
          </>
        )}
  
        {["Aire Piso Techo", "Bajo Silueta", "Multiposición"].includes(machineData.type) && (
          <>
            <Text style={styles.label}>Marca/Modelo:</Text>
            <Text>{machineData.marcaModelo}</Text>
            <Text style={styles.label}>Refrigerante:</Text>
            <Text>{machineData.refrigerantType}</Text>
            <Text style={styles.label}>Fases:</Text>
            <Text>{machineData.fases}</Text>
          </>
        )}
      </ScrollView>
    </View>
     )}
  
  
  const renderScene = SceneMap({
    general: GeneralTab,
    details: DetailsTab,
    preview: ResumenTab,
  });
  

  return (
    <View style={styles.container}>
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

      {index === 2 && (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear Máquina</Text>
          )}
        </TouchableOpacity>
      )}

    </View>
  );
};


export default NewAirScreen;