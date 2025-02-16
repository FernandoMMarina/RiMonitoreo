import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Animated, ScrollView } from "react-native";
import { Checkbox } from 'react-native-paper';
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../../redux/slices/userSlice';
import { Ionicons } from '@expo/vector-icons';

const HerramientasScreen = () => {
  const [herramientas, setHerramientas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error'
  const heightAnim = useRef(new Animated.Value(600)).current;

  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const tecnicoId = profile?.id;

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (tecnicoId) {
      fetchHerramientas();
    }
  }, [tecnicoId]);

  const fetchHerramientas = async () => {
    try {
      setLoading(true);
      if (!tecnicoId) {
        console.error("❌ ERROR: No hay técnico ID.");
        return;
      }
      console.log(`📡 Haciendo GET de herramientas para técnico: ${tecnicoId}`);
      const response = await axios.get(
        `https://rosensteininstalaciones.com.ar/api/trabajos/tecnicos/${tecnicoId}`
      );
      console.log("✅ Respuesta de la API:", response.data);
      const trabajos = response.data.data || [];
      if (trabajos.length === 0) {
        Alert.alert("Atención", "No hay trabajos asignados para este técnico.");
        setHerramientas([]);
        return;
      }
      const herramientasAgrupadas = trabajos.map(trabajo => ({
        trabajoId: trabajo._id,
        tipoDeTrabajo: trabajo.tipoDeTrabajo,
        herramientas: trabajo.herramientas.map(h => ({
          ...h,
          completada: h.completada || false 
        }))
      }));
      setHerramientas(herramientasAgrupadas);
    } catch (error) {
      console.error("❌ Error al obtener herramientas:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudieron cargar las herramientas.");
      setHerramientas([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleHerramienta = (trabajoId, herramientaIndex) => {
    setHerramientas(prevHerramientas => 
      prevHerramientas.map(trabajo => {
        if (trabajo.trabajoId === trabajoId) {
          return {
            ...trabajo,
            herramientas: trabajo.herramientas.map((herramienta, index) =>
              index === herramientaIndex
                ? { ...herramienta, completada: !herramienta.completada }
                : herramienta
            )
          };
        }
        return trabajo;
      })
    );
  };

  const todasCompletadas = herramientas.length > 0 && herramientas.every(trabajo =>
    trabajo.herramientas.length > 0 && trabajo.herramientas.every(h => h.completada)
  );

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: todasCompletadas ? 100 : 600,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [todasCompletadas]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando herramientas...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { height: heightAnim }]}> 
        {todasCompletadas ? (
            <View style={styles.resultContainer}>
                <Ionicons name="checkmark-circle" size={40} color="green" />
                <Text style={styles.successText}>Herramientas Completadas</Text>
            </View>
        ) : (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.header}>Herramientas por Trabajo</Text>
                {herramientas.map((trabajo) => (
                    <View key={trabajo.trabajoId} style={styles.trabajoContainer}>
                        <Text style={styles.trabajoHeader}>{`Trabajo: ${trabajo.tipoDeTrabajo}`}</Text>
                        {trabajo.herramientas.map((herramienta, index) => (
                            <View key={`${herramienta.nombre}-${index}`} style={styles.item}>
                                <Checkbox
                                    status={herramienta.completada ? 'checked' : 'unchecked'}
                                    onPress={() => toggleHerramienta(trabajo.trabajoId, index)}
                                />
                                <Text style={styles.itemText}>{herramienta.nombre}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    minHeight: 100,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  successText: {
    color: 'green',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  trabajoContainer: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  trabajoHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  itemText: {
    marginLeft: 8,
    fontSize: 16,
  }
});

export default HerramientasScreen;
