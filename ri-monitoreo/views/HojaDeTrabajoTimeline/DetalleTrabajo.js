import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { useDispatch } from "react-redux";
import axios from "axios";

import GastosTab from "./GastosTab"; // Componente separado
import ResumenTab from "./ResumenTab";
const API_URL = "https://rosensteininstalaciones.com.ar/api";

const DetalleTrabajo = ({ route }) => {
  const { trabajo } = route.params;
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [formData, setFormData] = useState(trabajo || {});
  const [cliente, setCliente] = useState(null);

  console.log(formData)

  useEffect(() => {
    if (formData.clienteId) {
      axios
        .get(`${API_URL}/users/user/${formData.clienteId}`)
        .then((res) => setCliente(res.data))
        .catch((err) => console.error("Error cargando cliente", err));
    }
  }, [formData.clienteId]);

  const openInMaps = (direccion) => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodeURIComponent(direccion)}`,
      android: `geo:0,0?q=${encodeURIComponent(direccion)}`,
    });
    Linking.openURL(url).catch((err) =>
      console.error("Error abriendo mapas", err)
    );
  };

  const onCall = (tel) => Linking.openURL(`tel:${tel}`);
  const onWhatsApp = (tel) => {
    const clean = tel.replace(/\D/g, "");
    const text = encodeURIComponent("Hola, soy técnico de Rosenstein");
    const prefix = clean.startsWith("549") ? "" : "54";
    const url = `https://wa.me/${prefix}${clean}?text=${text}`;
    Linking.openURL(url).catch((err) =>
      console.error("Error abriendo WhatsApp", err)
    );
  };

  const renderClientTab = () => {
    const direccion = formData.ubicacion?.direccion || "No disponible";
    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <Text style={styles.itemLabel}>Nombre:</Text>
          <Text style={styles.itemValue}>{cliente?.username || "N/A"}</Text>
          <Text style={styles.itemLabel}>Email:</Text>
          <Text style={styles.itemValue}>{cliente?.email || "N/A"}</Text>
          <Text style={styles.itemLabel}>Teléfono:</Text>
          {cliente?.telefono ? (
            <View style={styles.rowButtons}>
              <TouchableOpacity onPress={() => onCall(cliente.telefono)}>
                <Text style={styles.phoneLink}>📞 {cliente.telefono}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onWhatsApp(cliente.telefono)}>
                <Text style={styles.whatsappLink}>💬 WhatsApp</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.itemValue}>No Disponible</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <TouchableOpacity onPress={() => openInMaps(direccion)}>
            <Text style={styles.linkText}>{direccion}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderGeneralTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información General</Text>
        <Text style={styles.itemLabel}>Tipo de Trabajo:</Text>
        <Text style={styles.itemValue}>
          {formData.tipoDeTrabajo || "No disponible"}
        </Text>
        <Text style={styles.itemLabel}>Descripción:</Text>
        <Text style={styles.itemValue}>
          {formData.descripcion || "No disponible"}
        </Text>
        <Text style={styles.itemLabel}>Nota Adicional:</Text>
        <Text style={styles.itemValue}>{formData.nota || "No disponible"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Herramientas</Text>
        {formData.herramientas && formData.herramientas.length > 0 ? (
          formData.herramientas.map((herramienta) => (
            <Text key={herramienta._id} style={styles.bulletItem}>🔧 {herramienta.nombre}</Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay herramientas registradas</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Insumos</Text>
        {formData.insumos && formData.insumos.length > 0 ? (
          formData.insumos.map((insumo) => (
            <Text key={insumo._id} style={styles.bulletItem}>
              📦 {insumo.descripcion} ({insumo.cantidad})
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay insumos registrados</Text>
        )}
      </View>
    </ScrollView>
  );

  const renderSummaryTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionTitle}>Resumen del Trabajo</Text>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Inicio:</Text>
        <Text style={styles.summaryValue}>{trabajo.inicio}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Fin:</Text>
        <Text style={styles.summaryValue}>{trabajo.fin}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Estado:</Text>
        <Text style={styles.summaryValue}>
          {trabajo.completado ? "Completado" : "Pendiente"}
        </Text>
      </View>
    </ScrollView>
  );

  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case "client":
          return renderClientTab();
        case "general":
          return renderGeneralTab();
        case "gastos":
          return <GastosTab trabajo={formData} />;
        case "summary":
          return <ResumenTab trabajo={formData} />;
      }
    },
    [formData, cliente]
  );

  const routes = [
    { key: "client", title: "Cliente" },
    { key: "general", title: "Datos Generales" },
    { key: "gastos", title: "Gastos" },
    { key: "summary", title: "Resumen" },
  ];

  return (
    <View style={styles.container}>
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
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 16,
    textAlign: "center",
    color: "#000",
  },
  tabContent: {
    padding: 20,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1D1936",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  summaryLabel: {
    fontWeight: "600",
    color: "#555",
  },
  summaryValue: {
    fontWeight: "400",
  },
  tabBar: {
    backgroundColor: "#1D1936",
  },
  tabIndicator: {
    backgroundColor: "#fff",
    height: 3,
  },
  tabLabel: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemLabel: {
    fontWeight: "600",
    fontSize: 14,
    marginTop: 8,
    color: "#444",
  },
  itemValue: {
    fontSize: 14,
    color: "#555",
  },
  phoneLink: {
    fontSize: 16,
    color: "#007bff",
    textDecorationLine: "underline",
  },
  whatsappLink: {
    fontSize: 16,
    color: "#25D366",
    marginLeft: 10,
    textDecorationLine: "underline",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 10,
  },
  linkText: {
    color: "#007bff",
    textDecorationLine: "underline",
    fontSize: 16,
    marginTop: 5,
  },
});

export default DetalleTrabajo;
