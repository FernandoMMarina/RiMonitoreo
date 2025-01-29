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
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { TabView, TabBar } from "react-native-tab-view";
import { useWindowDimensions } from "react-native";
import styles from "./styles";

const API_URL = "https://rosensteininstalaciones.com.ar/api/maintenance";

const NewMaintenanceScreen = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "general", title: "Info Máquina" },
    { key: "details", title: "Detalles del Mantenimiento" },
  ]);

  const user = useSelector((state) => state.user.profile);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
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

  const onSubmit = async (data) => {
    if (!user || !user._id) {
      alert("Error", "No se pudo obtener la información del usuario.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("Error", "Usuario no autenticado.");
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

      alert("Éxito", "Mantenimiento registrado correctamente.");
      reset();
      setIndex(0);
    } catch (error) {
      console.error("Error creando mantenimiento:", error);
      alert("Error", "No se pudo registrar el mantenimiento.");
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
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ejemplo: 123456"
                  placeholderTextColor="#666"
                />
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

            <Text style={styles.label}>Ubicación</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ejemplo: Planta Industrial"
                  placeholderTextColor="#666"
                />
              )}
              name="location"
              rules={{ required: true }}
            />
            {errors.location && <Text style={styles.errorText}>Ubicación es obligatoria</Text>}
          </View>
        );
      case "details":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.label}>Frigorías</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ejemplo: 3500"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              )}
              name="frigorias"
              rules={{ required: true }}
            />
            {errors.frigorias && <Text style={styles.errorText}>Frigorias es obligatorio</Text>}

            <Text style={styles.label}>Evaporadora</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ejemplo: 2.5 kW"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              )}
              name="evaporadora"
              rules={{ required: true }}
            />
            {errors.evaporadora && <Text style={styles.errorText}>Evaporadora es obligatorio</Text>}
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
        renderScene={renderScene} // ✅ Se usa una función en lugar de SceneMap
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
    </View>
  );
};



export default NewMaintenanceScreen;
