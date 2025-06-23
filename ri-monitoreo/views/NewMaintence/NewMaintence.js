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

const CustomInput = ({ control, name, label, rules }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <TextInput
            style={[styles.input, error && { borderColor: 'red' }]}
            onChangeText={onChange}
            value={value}
            keyboardType="default"
          />
          {error && <Text style={{ color: 'red' }}>{error.message || 'Campo inválido'}</Text>}
        </>
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
        const token = await AsyncStorage.getItem("accessToken");
  
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
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Error", "Usuario no autenticado.");
        return;
      }
      if (!selectedMachine) {
        Alert.alert("Error", "Debe escanear y seleccionar una máquina antes de guardar el mantenimiento.");
        return;
      }      
      const formattedData = {
        date: new Date(`${data.date}T00:00:00.000Z`),
        description: data.description || " ",
        performedBy: profile?.id,
        machineId: selectedMachine?._id,
      
        ...(machineType === "cabina_pintura" && {
          limpiezaPlenoTecho: data.limpiezaPlenoTecho?.toLowerCase() === "si",
          limpiezaPlenoPiso: data.limpiezaPlenoPiso?.toLowerCase() === "si",
          limpiezaAspiranteExterior: data.limpiezaAspiranteExterior?.toLowerCase() === "si",
          damper: data.damper === "si",
          contactores: data.contactores === "si",
          luminarias: data.luminarias === "si",
          consumoMotorExtraccion: parseFloat(data.consumoMotorExtraccion),
          consumoMotorRecirculador: parseFloat(data.consumoMotorRecirculador),
        }),
        ...(machineType === "caldera" && {
          purgadoRadiadores: data.purgadoRadiadores === "si",
          limpiezaValvulas: data.limpiezaValvulas === "si",
          cambioValvulas: data.cambioValvulas === "si",
          limpiezaCircuitoAgua: data.limpiezaCircuitoAgua === "si",
        }),
        ...(machineType === "compresor_aire" && {
          consumoElectricR: parseFloat(data.consumoElectricR),
          consumoElectricS: parseFloat(data.consumoElectricS),
          consumoElectricT: parseFloat(data.consumoElectricT),
          cambioAceite: data.cambioAceite === "si",
          cambioCorrea: data.cambioCorrea === "si",
        }),
        ...(machineType === "Aire Acondicionado" && {
          frigorias: data.frigorias,
          evaporadora: data.evaporadora,
          condensadora: data.condensadora,
          consumo_electrico: parseFloat(data.consumo),
          presionAlta: parseFloat(data.presionAlta),
          presionBaja: parseFloat(data.presionBaja),
          filtros: parseInt(data.filtros),
          estado_evaporadora: parseInt(data.estado_evaporadora),
          estado_condensadora: parseInt(data.estado_condensadora),
          estado_mensulas: parseInt(data.estado_mensulas),
          estado_tuberias: parseInt(data.estado_tuberias),
          estado_desague: parseInt(data.estado_desague),
          medida_paleta_condensador: parseFloat(data.medida_paleta_condensador),
          capacitor_compresor: parseFloat(data.capacitor_compresor),
          capacitor_ventilador: parseFloat(data.capacitor_ventilador),
          refrigerante: data.refrigerante,
        }),        
        ...(machineType === "aire_rooftop" && {
          comp1_ampR: parseFloat(data.comp1_ampR),
          comp1_ampS: parseFloat(data.comp1_ampS),
          comp1_ampT: parseFloat(data.comp1_ampT),
          comp1_presionAlta: parseFloat(data.comp1_presionAlta),
          comp1_presionBaja: parseFloat(data.comp1_presionBaja),
          comp2_ampR: parseFloat(data.comp2_ampR),
          comp2_ampS: parseFloat(data.comp2_ampS),
          comp2_ampT: parseFloat(data.comp2_ampT),
          comp2_presionAlta: parseFloat(data.comp2_presionAlta),
          comp2_presionBaja: parseFloat(data.comp2_presionBaja),
          correaTurbina: data.correaTurbina,
          motorTurbina: data.motorTurbina,
          diametroForzadores: parseFloat(data.diametroForzadores),
          caracteristicasForzadores: data.caracteristicasForzadores,
          tensionSolenoide4Way: data.tensionSolenoide4Way,
        }),
        ...(machineType === "piso_techo" && {
          pisoTecho_marcaModelo: data.pisoTecho_marcaModelo,
          pisoTecho_refrigerante: data.pisoTecho_refrigerante,
          pisoTecho_numeroFases: parseInt(data.pisoTecho_numeroFases),
          pisoTecho_comp2_ampR: parseFloat(data.pisoTecho_comp2_ampR),
          pisoTecho_comp2_ampS: parseFloat(data.pisoTecho_comp2_ampS),
          pisoTecho_comp2_ampT: parseFloat(data.pisoTecho_comp2_ampT),
          pisoTecho_presionAlta: parseFloat(data.pisoTecho_presionAlta),
          pisoTecho_presionBaja: parseFloat(data.pisoTecho_presionBaja),
          pisoTecho_correaTurbinaEvaporadora: data.pisoTecho_correaTurbinaEvaporadora,
          pisoTecho_motorTurbina: data.pisoTecho_motorTurbina,
          pisoTecho_diametroForzadores: parseFloat(data.pisoTecho_diametroForzadores),
          pisoTecho_caracteristicasForzadores: data.pisoTecho_caracteristicasForzadores,
          pisoTecho_tensionSolenoide4Way: data.pisoTecho_tensionSolenoide4Way,
        }),
        ...(machineType === "bajo_silueta" && {
          bajoSilueta_marcaModelo: data.bajoSilueta_marcaModelo,
          bajoSilueta_refrigerante: data.bajoSilueta_refrigerante,
          bajoSilueta_numeroFases: parseInt(data.bajoSilueta_numeroFases),
          bajoSilueta_comp2_ampR: parseFloat(data.bajoSilueta_comp2_ampR),
          bajoSilueta_comp2_ampS: parseFloat(data.bajoSilueta_comp2_ampS),
          bajoSilueta_comp2_ampT: parseFloat(data.bajoSilueta_comp2_ampT),
          bajoSilueta_presionAlta: parseFloat(data.bajoSilueta_presionAlta),
          bajoSilueta_presionBaja: parseFloat(data.bajoSilueta_presionBaja),
          bajoSilueta_correaTurbinaEvaporadora: data.bajoSilueta_correaTurbinaEvaporadora,
          bajoSilueta_motorTurbina: data.bajoSilueta_motorTurbina,
          bajoSilueta_diametroForzadores: parseFloat(data.bajoSilueta_diametroForzadores),
          bajoSilueta_caracteristicasForzadores: data.bajoSilueta_caracteristicasForzadores,
          bajoSilueta_tensionSolenoide4Way: data.bajoSilueta_tensionSolenoide4Way,
        }),
        ...(machineType === "multiposicion" && {
          multiposicion_marcaModelo: data.multiposicion_marcaModelo,
          multiposicion_refrigerante: data.multiposicion_refrigerante,
          multiposicion_numeroFases: parseInt(data.multiposicion_numeroFases),
          multiposicion_comp2_ampR: parseFloat(data.multiposicion_comp2_ampR),
          multiposicion_comp2_ampS: parseFloat(data.multiposicion_comp2_ampS),
          multiposicion_comp2_ampT: parseFloat(data.multiposicion_comp2_ampT),
          multiposicion_presionAlta: parseFloat(data.multiposicion_presionAlta),
          multiposicion_presionBaja: parseFloat(data.multiposicion_presionBaja),
          multiposicion_correaTurbinaEvaporadora: data.multiposicion_correaTurbinaEvaporadora,
          multiposicion_motorTurbina: data.multiposicion_motorTurbina,
          multiposicion_diametroForzadores: parseFloat(data.multiposicion_diametroForzadores),
          multiposicion_caracteristicasForzadores: data.multiposicion_caracteristicasForzadores,
          multiposicion_tensionSolenoide4Way: data.multiposicion_tensionSolenoide4Way,
        }),
         
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
            <CustomInput control={control} name="description" label="Descripción" rules={{ required: "Este campo es obligatorio" }} />
            <CustomInput control={control} name="frigorias" label="Frigorías" rules={{ required: "Este campo es obligatorio" }} />
            <CustomInput control={control} name="evaporadora" label="Evaporadora" />
            <CustomInput control={control} name="condensadora" label="Condensadora" />
            <CustomInput
              control={control}
              name="consumo"
              label="Consumo Eléctrico (A)"
              rules={{
                required: "Este campo es obligatorio",
                pattern: { value: /^[0-9.]+$/, message: "Debe ser un número válido" }
              }}
            />
            <CustomInput
              control={control}
              name="presionAlta"
              label="Presión Alta"
              rules={{
                pattern: { value: /^[0-9.]+$/, message: "Debe ser un número" }
              }}
            />
            <CustomInput
              control={control}
              name="presionBaja"
              label="Presión Baja"
              rules={{
                pattern: { value: /^[0-9.]+$/, message: "Debe ser un número" }
              }}
            />
            <CustomInput
              control={control}
              name="filtros"
              label="Filtros"
              rules={{
                required: "Este campo es obligatorio",
                pattern: { value: /^[0-9]+$/, message: "Solo números enteros" }
              }}
            />
            <CustomInput
              control={control}
              name="estado_evaporadora"
              label="Estado Evaporadora (1-5)"
              rules={{
                required: "Obligatorio",
                min: { value: 1, message: "Mínimo 1" },
                max: { value: 5, message: "Máximo 5" }
              }}
            />
            <CustomInput
              control={control}
              name="estado_condensadora"
              label="Estado Condensadora (1-5)"
              rules={{
                required: "Obligatorio",
                min: { value: 1, message: "Mínimo 1" },
                max: { value: 5, message: "Máximo 5" }
              }}
            />
            <CustomInput
              control={control}
              name="estado_mensulas"
              label="Estado Ménsulas (1-5)"
              rules={{
                required: "Obligatorio",
                min: { value: 1, message: "Mínimo 1" },
                max: { value: 5, message: "Máximo 5" }
              }}
            />
            <CustomInput
              control={control}
              name="estado_tuberias"
              label="Estado Tuberías (1-5)"
              rules={{
                required: "Obligatorio",
                min: { value: 1, message: "Mínimo 1" },
                max: { value: 5, message: "Máximo 5" }
              }}
            />
            <CustomInput
              control={control}
              name="estado_desague"
              label="Estado Desagüe (1-5)"
              rules={{
                required: "Obligatorio",
                min: { value: 1, message: "Mínimo 1" },
                max: { value: 5, message: "Máximo 5" }
              }}
            />
            <CustomInput
              control={control}
              name="medida_paleta_condensador"
              label="Medida Paleta Condensador"
              rules={{
                pattern: { value: /^[0-9.]+$/, message: "Debe ser un número" }
              }}
            />
            <CustomInput
              control={control}
              name="capacitor_compresor"
              label="Capacitor Compresor"
              rules={{
                pattern: { value: /^[0-9.]+$/, message: "Debe ser un número" }
              }}
            />
            <CustomInput
              control={control}
              name="capacitor_ventilador"
              label="Capacitor Ventilador"
              rules={{
                pattern: { value: /^[0-9.]+$/, message: "Debe ser un número" }
              }}
            />
            <CustomInput control={control} name="refrigerante" label="Tipo de Refrigerante" />
          </>
        );

        case 'aire_rooftop':
          return (
            <>
              <CustomInput control={control} name="description" label="Descripción" />
              <CustomInput control={control} name="comp1_ampR" label="Compresor 1 - Amp R" />
              <CustomInput control={control} name="comp1_ampS" label="Compresor 1 - Amp S" />
              <CustomInput control={control} name="comp1_ampT" label="Compresor 1 - Amp T" />
              <CustomInput control={control} name="comp1_presionAlta" label="Compresor 1 - Presión Alta" />
              <CustomInput control={control} name="comp1_presionBaja" label="Compresor 1 - Presión Baja" />
              <CustomInput control={control} name="comp2_ampR" label="Compresor 2 - Amp R" />
              <CustomInput control={control} name="comp2_ampS" label="Compresor 2 - Amp S" />
              <CustomInput control={control} name="comp2_ampT" label="Compresor 2 - Amp T" />
              <CustomInput control={control} name="comp2_presionAlta" label="Compresor 2 - Presión Alta" />
              <CustomInput control={control} name="comp2_presionBaja" label="Compresor 2 - Presión Baja" />
              <CustomInput control={control} name="correaTurbina" label="Correa de Turbina" />
              <CustomInput control={control} name="motorTurbina" label="Motor Turbina" />
              <CustomInput control={control} name="diametroForzadores" label="Diámetro de Forzadores" />
              <CustomInput control={control} name="caracteristicasForzadores" label="Características Forzadores (220/380/mf/W)" />
              <CustomInput control={control} name="tensionSolenoide4Way" label="Tensión Solenoide 4 Way" />
            </>
          );
        case 'piso_techo':
            return (
              <>
                <CustomInput control={control} name="description" label="Descripción" />
                <CustomInput control={control} name="pisoTecho_marcaModelo" label="Marca/Modelo" />
                <CustomInput control={control} name="pisoTecho_refrigerante" label="Refrigerante" />
                <CustomInput control={control} name="pisoTecho_numeroFases" label="Número de Fases" />
                <CustomInput control={control} name="pisoTecho_comp2_ampR" label="Compresor 2 - Amp R" />
                <CustomInput control={control} name="pisoTecho_comp2_ampS" label="Compresor 2 - Amp S" />
                <CustomInput control={control} name="pisoTecho_comp2_ampT" label="Compresor 2 - Amp T" />
                <CustomInput control={control} name="pisoTecho_presionAlta" label="Presión Alta" />
                <CustomInput control={control} name="pisoTecho_presionBaja" label="Presión Baja" />
                <CustomInput control={control} name="pisoTecho_correaTurbinaEvaporadora" label="Correa/Motor Evaporadora" />
                <CustomInput control={control} name="pisoTecho_motorTurbina" label="Motor Turbina" />
                <CustomInput control={control} name="pisoTecho_diametroForzadores" label="Diámetro Forzadores" />
                <CustomInput control={control} name="pisoTecho_caracteristicasForzadores" label="Características Forzadores" />
                <CustomInput control={control} name="pisoTecho_tensionSolenoide4Way" label="Tensión Solenoide 4 Way" />
              </>
            );
        case 'bajo_silueta':
              return (
                <>
                  <CustomInput control={control} name="description" label="Descripción" />
                  <CustomInput control={control} name="bajoSilueta_marcaModelo" label="Marca/Modelo" />
                  <CustomInput control={control} name="bajoSilueta_refrigerante" label="Refrigerante" />
                  <CustomInput control={control} name="bajoSilueta_numeroFases" label="Número de Fases" />
                  <CustomInput control={control} name="bajoSilueta_comp2_ampR" label="Compresor 2 - Amp R" />
                  <CustomInput control={control} name="bajoSilueta_comp2_ampS" label="Compresor 2 - Amp S" />
                  <CustomInput control={control} name="bajoSilueta_comp2_ampT" label="Compresor 2 - Amp T" />
                  <CustomInput control={control} name="bajoSilueta_presionAlta" label="Presión Alta" />
                  <CustomInput control={control} name="bajoSilueta_presionBaja" label="Presión Baja" />
                  <CustomInput control={control} name="bajoSilueta_correaTurbinaEvaporadora" label="Correa/Motor Evaporadora" />
                  <CustomInput control={control} name="bajoSilueta_motorTurbina" label="Motor Turbina" />
                  <CustomInput control={control} name="bajoSilueta_diametroForzadores" label="Diámetro Forzadores" />
                  <CustomInput control={control} name="bajoSilueta_caracteristicasForzadores" label="Características Forzadores" />
                  <CustomInput control={control} name="bajoSilueta_tensionSolenoide4Way" label="Tensión Solenoide 4 Way" />
                </>
              );
        case 'multiposicion':
                return (
                  <>
                    <CustomInput control={control} name="description" label="Descripción" />
                    <CustomInput control={control} name="multiposicion_marcaModelo" label="Marca/Modelo" />
                    <CustomInput control={control} name="multiposicion_refrigerante" label="Refrigerante" />
                    <CustomInput control={control} name="multiposicion_numeroFases" label="Número de Fases" />
                    <CustomInput control={control} name="multiposicion_comp2_ampR" label="Compresor 2 - Amp R" />
                    <CustomInput control={control} name="multiposicion_comp2_ampS" label="Compresor 2 - Amp S" />
                    <CustomInput control={control} name="multiposicion_comp2_ampT" label="Compresor 2 - Amp T" />
                    <CustomInput control={control} name="multiposicion_presionAlta" label="Presión Alta" />
                    <CustomInput control={control} name="multiposicion_presionBaja" label="Presión Baja" />
                    <CustomInput control={control} name="multiposicion_correaTurbinaEvaporadora" label="Correa/Motor Evaporadora" />
                    <CustomInput control={control} name="multiposicion_motorTurbina" label="Motor Turbina" />
                    <CustomInput control={control} name="multiposicion_diametroForzadores" label="Diámetro Forzadores" />
                    <CustomInput control={control} name="multiposicion_caracteristicasForzadores" label="Características Forzadores" />
                    <CustomInput control={control} name="multiposicion_tensionSolenoide4Way" label="Tensión Solenoide 4 Way" />
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
              <CustomInput control={control} name="description" label="Descripción" />
              <CustomInput control={control} name="limpiezaPlenoTecho" label="Limpieza Pleno Techo (si/no)" />
              <CustomInput control={control} name="limpiezaPlenoPiso" label="Limpieza Pleno Piso (si/no)" />
              <CustomInput control={control} name="limpiezaAspiranteExterior" label="Limpieza Aspirante Exterior (si/no)" />
              <CustomInput control={control} name="damper" label="Damper (si/no)" />
              <CustomInput control={control} name="contactores" label="Contactores (si/no)" />
              <CustomInput control={control} name="luminarias" label="Luminarias (si/no)" />
              <CustomInput control={control} name="consumoMotorExtraccion" label="Consumo Motor Extracción (A)" />
              <CustomInput control={control} name="consumoMotorRecirculador" label="Consumo Motor Recirculador (A)" />
            </>
          );
        
        case 'caldera':
          return (
            <>
              <CustomInput control={control} name="description" label="Descripción" />
              <CustomInput control={control} name="purgadoRadiadores" label="Purgado de Radiadores (si/no)" />
              <CustomInput control={control} name="limpiezaValvulas" label="Limpieza de Válvulas y Detentores (si/no)" />
              <CustomInput control={control} name="cambioValvulas" label="Cambio de Válvulas/Detentores (si/no)" />
              <CustomInput control={control} name="limpiezaCircuitoAgua" label="Limpieza de Circuito de Agua (si/no)" />
            </>
          );
        
        case 'compresor_aire':
          return (
            <>
              <CustomInput control={control} name="description" label="Descripción" />
              <CustomInput control={control} name="consumoElectricR" label="Consumo Eléctrico R (A)" />
              <CustomInput control={control} name="consumoElectricS" label="Consumo Eléctrico S (A)" />
              <CustomInput control={control} name="consumoElectricT" label="Consumo Eléctrico T (A)" />
              <CustomInput control={control} name="cambioAceite" label="Cambio de Aceite (si/no)" />
              <CustomInput control={control} name="cambioCorrea" label="Cambio de Correa (si/no)" />
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
