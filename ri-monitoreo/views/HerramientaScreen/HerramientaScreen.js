import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Checkbox } from 'react-native-paper';
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../../redux/slices/userSlice';

const HerramientasScreen = () => {
  const [herramientas, setHerramientas] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // Estados globales desde Redux
  const { profile } = useSelector((state) => state.user);

  const tecnicoId = profile?.id;

  useEffect(() => {
    if (tecnicoId) {
      fetchHerramientas();
    }
  }, [tecnicoId]);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const fetchHerramientas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://rosensteininstalaciones.com.ar/api/trabajos/tecnicos/${tecnicoId}`
      );

      const trabajos = response.data.data;

      if (!trabajos || trabajos.length === 0) {
        Alert.alert("Atención", "No hay trabajos asignados para este técnico.");
        setHerramientas([]);
        return;
      }

      // Agrupar herramientas por trabajo
      const herramientasAgrupadas = trabajos.map((trabajo) => ({
        trabajoId: trabajo._id,
        tipoDeTrabajo: trabajo.tipoDeTrabajo,
        herramientas: trabajo.herramientas.map((herramienta) => ({
          ...herramienta,
          completada: false, // Estado inicial para cada herramienta
        })),
      }));

      setHerramientas(herramientasAgrupadas);
    } catch (error) {
      console.error("Error al obtener herramientas:", error.message);
      Alert.alert("Error", "No se pudieron cargar las herramientas.");
    } finally {
      setLoading(false);
    }
  };

  const toggleHerramienta = (trabajoId, herramientaIndex) => {
    const updatedHerramientas = herramientas.map((trabajo) => {
      if (trabajo.trabajoId === trabajoId) {
        const herramientasActualizadas = [...trabajo.herramientas];
        herramientasActualizadas[herramientaIndex].completada =
          !herramientasActualizadas[herramientaIndex].completada;
        return { ...trabajo, herramientas: herramientasActualizadas };
      }
      return trabajo;
    });
    setHerramientas(updatedHerramientas);
  };

  const enviarHerramientasCompletadas = () => {
    const herramientasCompletadas = herramientas.map((trabajo) => ({
      tipoDeTrabajo: trabajo.tipoDeTrabajo,
      herramientas: trabajo.herramientas.filter((herramienta) => herramienta.completada),
    }));

    const mensaje = herramientasCompletadas
      .map((trabajo) => {
        const herramientas = trabajo.herramientas.map((h) => h.nombre).join(", ");
        return `Trabajo (${trabajo.tipoDeTrabajo}): ${herramientas}`;
      })
      .join("\n");

    Alert.alert("Herramientas completadas", mensaje || "No hay herramientas seleccionadas.");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando herramientas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Herramientas por Trabajo</Text>
      <FlatList
        data={herramientas} // Array de trabajos con herramientas
        keyExtractor={(item) => item.trabajoId}
        renderItem={({ item }) => (
          <View style={styles.trabajoContainer}>
            <Text style={styles.trabajoHeader}>{`Trabajo: ${item.tipoDeTrabajo}`}</Text>
            <FlatList
              data={item.herramientas}
              keyExtractor={(herramienta, index) => `${herramienta.nombre}-${index}`}
              renderItem={({ item: herramienta, index }) => (
                <View style={styles.item}>
                  <Checkbox
                    value={herramienta.completada}
                    onValueChange={() => toggleHerramienta(item.trabajoId, index)}
                  />
                  <Text style={styles.itemText}>{herramienta.nombre}</Text>
                </View>
              )}
            />
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={enviarHerramientasCompletadas}
      >
        <Text style={styles.buttonText}>Enviar Herramientas Completadas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 20,
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
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HerramientasScreen;
