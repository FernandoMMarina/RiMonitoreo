import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Alert} from 'react-native';
import styles from './styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Share, Linking } from 'react-native';

const MaintenanceVisitStatus = ({ visits }) => {
  const [visitMessage, setVisitMessage] = useState('');

  useEffect(() => {
    const today = new Date();
    let upcomingVisit = null;

    if (visits && visits.length > 0) {
      // Ordenar las visitas por fecha
      const sortedVisits = visits
        .map((visit) => ({
          ...visit,
          date: new Date(visit.date),
        }))
        .sort((a, b) => a.date - b.date);

      // Buscar la próxima visita después de hoy
      for (let visit of sortedVisits) {
        if (visit.date >= today) {
          upcomingVisit = visit;
          break;
        }
      }
    }

    // Generar el mensaje basado en la próxima visita
    if (!upcomingVisit) {
      setVisitMessage("No hay ninguna visita programada, ¿agendamos una?");
    } else if (
      upcomingVisit.date.toDateString() === today.toDateString()
    ) {
      setVisitMessage("Tu visita es hoy");
    } else {
      setVisitMessage(`Tu próxima visita es el ${upcomingVisit.date.toLocaleDateString()}`);
    }
  }, [visits]);
   const openWhatsApp = (phoneNumber, message) => {
      const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            Alert.alert('Error', 'WhatsApp no está instalado en este dispositivo');
          }
        })
        .catch(err => console.error('Error al abrir WhatsApp:', err));
    };

  return (
    <View style={styles.card}>
      <Text style={styles.message}>{visitMessage}</Text>
      <TouchableOpacity 
              style={styles.whatsappButton} 
              onPress={() => openWhatsApp('+541141651335', 'Hola, necesito agendar un mantenimiento para mi máquina.')}
            >
              <Ionicons style={styles.icon} name={'logo-whatsapp'} color={"white"} size={25}/>
              <Text style={styles.buttonText}>Enviar Mensaje</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MaintenanceVisitStatus;
