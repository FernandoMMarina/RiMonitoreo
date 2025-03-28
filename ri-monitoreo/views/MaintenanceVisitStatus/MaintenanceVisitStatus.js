import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../../redux/slices/userSlice';
import { fetchVisits } from '../../redux/slices/visitsSlice';
import styles from './styles';

// Componente para mostrar cuando no hay visitas programadas
const NoVisits = ({ onOpenWhatsApp }) => (
  <View style={styles.card}>
    <Text style={styles.message}>No hay ninguna visita programada, ¿agendamos una?</Text>
    <TouchableOpacity
      style={styles.whatsappButton}
      onPress={() =>
        onOpenWhatsApp('+541141651335', 'Hola, necesito agendar un mantenimiento para mi máquina.')
      }
    >
      <Ionicons style={styles.icon} name="logo-whatsapp" color="white" size={25} />
      <Text style={styles.buttonText}>Enviar Mensaje</Text>
    </TouchableOpacity>
  </View>
);

// Obtener el estilo basado en el estado
const getStatusStyle = (status) => {
  switch (status) {
    case 'pendiente':
      return { backgroundColor: '#FFA500' }; // Naranja
    case 'reprogramado':
      return { backgroundColor: '#1E90FF' }; // Azul
    case 'completado':
      return { backgroundColor: '#32CD32' }; // Verde
    default:
      return { backgroundColor: '#A9A9A9' }; // Gris
  }
};

// Componente para mostrar una visita
const UpcomingVisit = ({ visit, onOpenWhatsApp }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Próxima visita</Text>
    <Text style={styles.detail}>Tipo de trabajo: {visit.tipoDeTrabajo}</Text>
    <Text style={styles.detail}>Fecha: {new Date(visit.date).toLocaleDateString()}</Text>
    <Text style={styles.detail}>Hora: {new Date(visit.date).toLocaleTimeString()}</Text>
    <View style={styles.subTitleContainer}>
      <Text style={styles.detail}>Estado:</Text>
      <View style={[styles.chip, getStatusStyle(visit.estado)]}>
        <Text style={styles.chipText}>{visit.estado}</Text>
      </View>
    </View>
    <View style={styles.separator} />
    <Text style={styles.message}>¿Necesitas reprogramar? ¡Mándanos un mensaje!</Text>
    <TouchableOpacity
      style={styles.whatsappButton}
      onPress={() =>
        onOpenWhatsApp('+541141651335', 'Hola, necesito reprogramar mi visita.')
      }
    >
      <Ionicons style={styles.icon} name="logo-whatsapp" color="white" size={25} />
      <Text style={styles.buttonText}>Enviar Mensaje</Text>
    </TouchableOpacity>
  </View>
);

// Componente de carga
const Loading = () => (
  <View style={styles.loading}>
    <Text style={styles.loadingText}>Cargando...</Text>
  </View>
);

// Componente principal
const MaintenanceVisitStatus = () => {
  const dispatch = useDispatch();

  // Estados globales desde Redux
  const { profile } = useSelector((state) => state.user);
  const { visits, loading, error } = useSelector((state) => state.visits);

  // Obtener datos al montar el componente
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchVisits(profile.id));
    }
  }, [dispatch, profile?.id]);

  const openWhatsApp = (phoneNumber, message) => {
    const url = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

     Linking.openURL(url)
        .catch((err) => {
          console.error('Error al abrir WhatsApp:', err);
          Alert.alert('Error', 'No se pudo abrir WhatsApp. Por favor, asegúrate de que la aplicación esté instalada.');
        });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={{ marginTop: 20 }}>
        <NoVisits onOpenWhatsApp={openWhatsApp} /> 
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {visits.length > 0 ? (
        visits.map((visit) => (
          <UpcomingVisit key={visit._id} visit={visit} onOpenWhatsApp={openWhatsApp} />
        ))
      ) : (
        <NoVisits onOpenWhatsApp={openWhatsApp} />
      )}
    </View>
  );
};

export default MaintenanceVisitStatus;