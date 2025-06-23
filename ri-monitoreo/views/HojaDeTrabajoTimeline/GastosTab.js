import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Button,
  Card,
  TextInput as PaperTextInput,
  Divider,
  Snackbar,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { updateTrabajo } from "../../redux/slices/trabajoSlice";

const GastosTab = ({ trabajo }) => {
  const dispatch = useDispatch();
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const userId = useSelector((state) => state.auth.user._id);

  const mostrarSnackbar = (mensaje) => {
    setSnackbarMessage(mensaje);
    setSnackbarVisible(true);
  };

  const agregarGasto = () => {
    if (!descripcion.trim()) {
      mostrarSnackbar("La descripción es obligatoria");
      return;
    }
    if (!cantidad.trim()) {
      mostrarSnackbar("La cantidad es obligatoria");
      return;
    }
    if (!precioUnitario.trim()) {
      mostrarSnackbar("El precio unitario es obligatorio");
      return;
    }

    const cantidadNumerica = parseFloat(cantidad);
    const precioNumerico = parseFloat(precioUnitario);

    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      mostrarSnackbar("La cantidad debe ser un número válido mayor que 0");
      return;
    }
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      mostrarSnackbar("El precio unitario debe ser un número válido mayor que 0");
      return;
    }

    const nuevoGasto = {
      descripcion,
      cantidad: cantidadNumerica,
      precioUnitario: precioNumerico,
      agregadoPor: userId,
      fecha: new Date(),
    };

    const actualizado = {
      ...trabajo,
      costosAdicionales: [...(trabajo.costosAdicionales || []), nuevoGasto],
      costoTotal: (trabajo.costoTotal || 0) + cantidadNumerica * precioNumerico,
    };

    dispatch(updateTrabajo({ id: trabajo._id, data: actualizado }));

    setDescripcion("");
    setCantidad("");
    setPrecioUnitario("");
    mostrarSnackbar("Gasto agregado correctamente");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Costos adicionales</Text>

        {(trabajo.costosAdicionales || []).map((gasto, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Text style={styles.text}>{gasto.descripcion}</Text>
              <Text style={styles.amount}>
                Cantidad: {gasto.cantidad} | Precio Unitario: ${gasto.precioUnitario?.toFixed(2)}
              </Text>
              <Text style={styles.amount}>
                Total: ${(gasto.precioUnitario * gasto.cantidad).toFixed(2)}
              </Text>
              <Text style={styles.date}>
                {new Date(gasto.fecha).toLocaleDateString()}
              </Text>
              {gasto.agregadoPor && (
                <Text style={styles.user}>Agregado por: {gasto.agregadoPor}</Text>
              )}
            </Card.Content>
          </Card>
        ))}

        <Divider style={{ marginVertical: 16 }} />

        <Text style={styles.subtitle}>Agregar nuevo gasto</Text>

        <PaperTextInput
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          style={styles.input}
        />
        <PaperTextInput
          label="Cantidad"
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
          style={styles.input}
        />
        <PaperTextInput
          label="Precio Unitario"
          value={precioUnitario}
          onChangeText={setPrecioUnitario}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button mode="contained" onPress={agregarGasto} style={styles.button}>
          Agregar Gasto
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  card: {
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
  },
  amount: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  user: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
});

export default GastosTab;
