import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import ProgressBarMultiStep from "react-native-progress-bar-multi-step";
import { useForm, Controller } from 'react-hook-form';

import styles from './styles';

const tabs = [
  { title: 'Info Máquina', pageNo: 1 },
  { title: 'Detalles del Mantenimiento', pageNo: 2 },
];

function NewMaintenanceScreen() {
  const [page, setPage] = useState(1);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      machineId: '',
      date: '',
      description: '',
      performedBy: '',
      photoUrl: '',
      frigorias: '',
      evaporadora: '',
      condensadora: '',
      consumo: '',
      presionAlta: '',
      presionBaja: '',
      filtros: '',
      location: '',
    }
  });

  const handleNext = () => {
    if (page < tabs.length) {
      setPage(page + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const onSubmit = (data) => {
    // Aquí iría la lógica para enviar el formulario completo
    console.log("Datos enviados:", data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <ProgressBarMultiStep
          progressive={true}
          page={page}
          setPage={setPage}
          tabs={tabs}
        />
      </View>
      <View style={styles.formContainer}>
        {page === 1 && (
          <>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Machine ID"
                  placeholderTextColor="#666"
                />
              )}
              name="machineId"
              rules={{ required: true }}
            />
            {errors.machineId && <Text style={styles.errorText}>Machine ID is required</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Date (YYYY-MM-DD)"
                  placeholderTextColor="#666"
                />
              )}
              name="date"
              rules={{ required: true }}
            />
            {errors.date && <Text style={styles.errorText}>Date is required</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Location"
                  placeholderTextColor="#666"
                />
              )}
              name="location"
              rules={{ required: true }}
            />
            {errors.location && <Text style={styles.errorText}>Location is required</Text>}
          </>
        )}

        {page === 2 && (
          <>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Frigorias"
                  placeholderTextColor="#666"
                />
              )}
              name="frigorias"
              rules={{ required: true }}
            />
            {errors.frigorias && <Text style={styles.errorText}>Frigorias is required</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Evaporadora"
                  placeholderTextColor="#666"
                />
              )}
              name="evaporadora"
              rules={{ required: true }}
            />
            {errors.evaporadora && <Text style={styles.errorText}>Evaporadora is required</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Condensadora"
                  placeholderTextColor="#666"
                />
              )}
              name="condensadora"
              rules={{ required: true }}
            />
            {errors.condensadora && <Text style={styles.errorText}>Condensadora is required</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Presión Alta"
                  placeholderTextColor="#666"
                />
              )}
              name="presionAlta"
              rules={{ required: true }}
            />
            {errors.presionAlta && <Text style={styles.errorText}>Presión Alta is required</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Presión Baja"
                  placeholderTextColor="#666"
                />
              )}
              name="presionBaja"
              rules={{ required: true }}
            />
            {errors.presionBaja && <Text style={styles.errorText}>Presión Baja is required</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Filtros"
                  placeholderTextColor="#666"
                />
              )}
              name="filtros"
            />
          </>
        )}

        <TouchableOpacity
          style={styles.siguienteButton}
          onPress={handleNext}
        >
          <Text style={styles.siguienteText}>{page < tabs.length ? 'Siguiente' : 'Enviar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default NewMaintenanceScreen;
