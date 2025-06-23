import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Button,
  Card,
  IconButton,
  TextInput as PaperTextInput,
  Divider,
  Snackbar,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import { updateTrabajo } from "../../redux/slices/trabajoSlice";

const estadoDescripciones = {
  completado: "Trabajo realizado con éxito.",
  reprogramado: "Trabajo reprogramado por condiciones externas.",
  cancelado: "Trabajo cancelado por el cliente u otros motivos.",
};

const ResumenTab = ({ trabajo }) => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user._id);

  const [estado, setEstado] = useState(trabajo.estado || "");
  const [descripcion, setDescripcion] = useState(trabajo.descripcion || "");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [costos, setCostos] = useState(trabajo.costosAdicionales || []);

  console.log(costos)

  const mostrarSnackbar = (mensaje) => {
    setSnackbarMessage(mensaje);
    setSnackbarVisible(true);
  };

  const handleEstadoChange = (value) => {
    setEstado(value);
    setDescripcion(estadoDescripciones[value] || "");
  };

  const eliminarGasto = (index) => {
    const actualizado = [...costos];
    actualizado.splice(index, 1);
    setCostos(actualizado);
  };

  const calcularTotal = () => {
    return costos.reduce(
      (total, gasto) => total + (gasto.cantidad * (gasto.precioUnitario || 1)),
      0
    );
  };

  const guardarCambios = () => {
    Alert.alert(
      "Confirmar cambios",
      "¿Estás seguro de guardar los cambios?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Guardar",
          onPress: () => {
            dispatch(
              updateTrabajo({
                id: trabajo._id,
                data: {
                  ...trabajo,
                  estado,
                  descripcion,
                  costosAdicionales: costos,
                  costoTotal: calcularTotal(),
                },
              })
            );
            mostrarSnackbar("Cambios guardados correctamente");
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Estado del Trabajo</Text>

        <Picker
          selectedValue={estado}
          onValueChange={handleEstadoChange}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar estado" value="" />
          <Picker.Item label="Completado" value="completado" />
          <Picker.Item label="Reprogramado" value="reprogramado" />
          <Picker.Item label="Cancelado" value="cancelado" />
        </Picker>

        <PaperTextInput
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          style={styles.input}
        />

        <Text style={styles.subtitle}>Gastos adicionales</Text>

       {costos.length === 0 ? (
        <Text style={styles.noCostos}>Sin Costos Adicionales</Text>
        ) : (
        costos.map((gasto, index) => (
            <Card key={index} style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                <Text>{gasto.descripcion}</Text>
                <Text>
                    {gasto.cantidad} x ${gasto.precioUnitario?.toFixed(2)} = $
                    {(gasto.cantidad * gasto.precioUnitario).toFixed(2)}
                </Text>
                </View>
                <IconButton
                icon="stop"
                color="red"
                onPress={() => eliminarGasto(index)}
                />
            </Card.Content>
            </Card>
        ))
        )}


        <Text style={styles.total}>Total: ${calcularTotal().toFixed(2)}</Text>

        <Button mode="contained" onPress={guardarCambios} style={styles.button}>
          Guardar Cambios
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },
  input: {
    marginVertical: 12,
  },
  picker: {
    backgroundColor: "#f2f2f2",
    marginBottom: 12,
  },
  card: {
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "right",
  },
  button: {
    marginTop: 16,
  },
});

export default ResumenTab;
