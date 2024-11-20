import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from './styles';

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

  return (
    <View style={styles.card}>
      <Text style={styles.message}>{visitMessage}</Text>
    </View>
  );
};

export default MaintenanceVisitStatus;
