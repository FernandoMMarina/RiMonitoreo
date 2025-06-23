import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  Card,
  TextInput,
  Button,
  Snackbar,
  HelperText,
} from "react-native-paper";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

const prioridades = ["normal", "alta", "urgente"];

const AddTareaCard = ({ onTareaAgregada }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("normal");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setError("");

    try {
      const response = await axios.post("https://rosensteininstalaciones.com.ar/api/tareas", {
        nombre,
        descripcion,
        prioridad,
      });

      setNombre("");
      setDescripcion("");
      setPrioridad("normal");

      setSnackbarMessage("Tarea creada con éxito");
      setSnackbarVisible(true);

      if (onTareaAgregada) onTareaAgregada(response.data);
    } catch (err) {
      console.error("Error al crear tarea:", err);
      setSnackbarMessage("Error al crear la tarea");
      setSnackbarVisible(true);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Nombre"
              value={nombre}
              onChangeText={setNombre}
              mode="outlined"
              error={!!error}
            />
            {error ? <HelperText type="error">{error}</HelperText> : null}

            <TextInput
              label="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.inputMargin}
              returnKeyType="done"
              blurOnSubmit={false}
            />

            {/* Agregamos View adicional para dar espacio y evitar solapamiento */}
            <View style={styles.inputMargin}>
              <Picker
                selectedValue={prioridad}
                onValueChange={(itemValue) => {
                  Keyboard.dismiss(); // Cerrar teclado al abrir Picker
                  setPrioridad(itemValue);
                }}
              >
                {prioridades.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
              </Picker>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
            >
              Agregar
            </Button>
          </Card.Content>
        </Card>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: "Cerrar",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: "center",
  },
  card: {
    padding: 16,
    borderRadius: 10,
  },
  inputMargin: {
    marginTop: 16,
  },
  button: {
    marginTop: 24,
  },
});

export default AddTareaCard;
