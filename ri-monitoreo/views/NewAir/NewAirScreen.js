import React, { useState } from 'react';
import { Text, View, TextInput,TouchableOpacity } from 'react-native';
import ProgressBarMultiStep from "react-native-progress-bar-multi-step";
import { useForm, Controller } from 'react-hook-form';

import styles from './styles';


const tabs = [
  { title: 'Info Cliente', pageNo: 1 },
  { title: 'Primer Aire', pageNo: 2 },
];

function NewAirScreen() {
  const [page, setPage] = useState(1);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: '',
      mail: '',
      role: 'client'
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
    // Lógica de envío de formulario completo
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
                  placeholder="Nombre de Usuario"
                  placeholderTextColor="#666"
                />
              )}
              name="username"
              rules={{ required: true }}
            />
            {errors.username && <Text style={styles.errorText}>Username is required</Text>}

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  secureTextEntry
                />
              )}
              name="password"
              rules={{ required: true }}
            />
            {errors.password && <Text style={styles.errorText}>Password is required</Text>}
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Mail"
                placeholderTextColor="#666"
              />
            )}
            name="mail"
            rules={{ required: true }}
          />
          {errors.mail && <Text style={styles.errorText}>Mail is required</Text>}
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
                  placeholder="Modelo"
                  placeholderTextColor="#666"
                />
              )}
              name="role"
              rules={{ required: true }}
            />
            {errors.role && <Text style={styles.errorText}>Role is required</Text>}

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
              name="role"
              rules={{ required: true }}
            />

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
              name="role"
              rules={{ required: true }}
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Consumo"
                  placeholderTextColor="#666"
                />
              )}
              name="role"
              rules={{ required: true }}
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Presion Alta"
                  placeholderTextColor="#666"
                />
              )}
              name="role"
              rules={{ required: true }}
            />

<Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Presion Baja"
                  placeholderTextColor="#666"
                />
              )}
              name="role"
              rules={{ required: true }}
            />

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
              name="role"
              rules={{ required: true }}
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

export default NewAirScreen;

