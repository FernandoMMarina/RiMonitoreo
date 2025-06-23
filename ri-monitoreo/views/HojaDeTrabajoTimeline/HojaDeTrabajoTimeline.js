import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import axios from 'axios';
import { useSelector } from 'react-redux';


const HojaDeTrabajoTimeline = ({ trabajos = [] }) => {
  const navigation = useNavigation();
  const [clientesMap, setClientesMap] = useState({});
  const { profile } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const idsUnicos = [...new Set(trabajos.map((t) => t.clienteId).filter(Boolean))];
        const respuestas = await Promise.all(
          idsUnicos.map((id) =>
            axios.get(`https://rosensteininstalaciones.com.ar/api/users/user/${id}`)
          )
        );
        const mapa = {};
        respuestas.forEach((res, i) => {
          mapa[idsUnicos[i]] = res.data.username || 'Cliente';
        });
        setClientesMap(mapa);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };

    if (trabajos.length > 0) fetchClientes();
  }, [trabajos]);

const openWhatsApp = () => {
  const nombreTecnico = profile?.username || "Técnico";
  const mensaje = `Hola, soy ${nombreTecnico}, no tengo trabajos asignados. ¿Podrías verificarlo?`;
  const url = `https://wa.me/541132416414?text=${encodeURIComponent(mensaje)}`;

  Linking.openURL(url).catch(() => {
    Alert.alert('Error', 'No se pudo abrir WhatsApp. Verificá si está instalada.');
  });
};

  const trabajosValidos = trabajos.filter((t) => {
    const fecha = new Date(t.fechaInicio);
    return fecha instanceof Date && !isNaN(fecha.getTime());
  });

  if (trabajosValidos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="calendar-outline" size={48} color="#aaa" style={{ marginBottom: 16 }} />
        <Text style={styles.emptyTitle}>Sin trabajos asignados</Text>
        <Text style={styles.emptySubText}>
          No tenés ningún trabajo cargado, hablá con Nacho.
        </Text>
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Icon name="logo-whatsapp" size={24} color="white" />
          <Text style={styles.buttonText}>Enviar Mensaje</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trabajosOrdenados = [
    ...trabajosValidos.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio)),
    {
      _id: 'fin-del-dia',
      fechaInicio: new Date().setHours(18, 0, 0, 0),
      fechaFin: new Date().setHours(18, 0, 0, 0),
      titulo: 'Fin del día',
      icon: 'moon-outline',
      estado: 'info',
      color: '#999',
      isEventoEspecial: true,
    },
  ];

  const renderItem = ({ item }) => {
    const esEspecial = item.isEventoEspecial;
    const fechaInicio = new Date(item.fechaInicio);
    const fechaFin = new Date(item.fechaFin || fechaInicio.getTime() + 3600000);
    const horaInicio = format(fechaInicio, 'HH:mm');
    const horaFin = format(fechaFin, 'HH:mm');
    const duracion = Math.round((fechaFin - fechaInicio) / 60000);

    return (
      <View style={styles.itemContainer}>
        <View style={styles.timelineColumn}>
          <View style={styles.fullLine} />
          <View style={styles.dot} />
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.tiempo}>
            <Text style={styles.hora}>{horaInicio}</Text>
          </View>
          {esEspecial ? (
            <View style={[styles.card, { backgroundColor: '#2F2F2F', borderLeftColor: item.color }]}>
              <View style={styles.cardContent}>
                <View style={[styles.icono, { backgroundColor: item.color }]}>
                  <Icon name={item.icon} size={18} color="#fff" />
                </View>
                <Text style={styles.nombre}>{item.titulo}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('DetalleTrabajo', { trabajo: item })}
            >
              <View style={[styles.card, { borderLeftColor: item.color }]}>
                <View style={styles.cardContent}>
                  <View
                        style={[
                            styles.icono,
                            {
                            backgroundColor:   "#2F80ED",
                            },
                        ]}
                        >
                    <Icon name={item.icon || 'construct-outline'} size={18} color="#fff" />
                  </View>
                  <View style={styles.textos}>
                    <Text style={styles.nombre}>{item.titulo || item.descripcion || "Trabajo"}</Text>
                    <Text style={styles.horario}>
                      {horaInicio} - {horaFin} ({duracion} min)
                    </Text>
                    <Text style={styles.horario}>
                      Cliente: {clientesMap[item.clienteId] || 'Cargando...'}
                    </Text>
                  </View>
                  <Icon
                    name={item.estado === 'completado' ? 'checkbox-outline' : 'square-outline'}
                    size={22}
                    color={item.estado === 'completado' ? '#4CAF50' : '#ccc'}
                  />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text style={styles.titulo}>Trabajos del Día</Text>
      <FlatList
        data={trabajosOrdenados}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  titulo: {
    color: '#FFF',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 24,
    margin: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  whatsappButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineColumn: {
    width: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  fullLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    height:120,
    backgroundColor: '#999',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#bbb',
    zIndex: 2,
    marginTop: 8,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  tiempo: {
    width: 60,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 5,
  },
  hora: {
    color: '#ccc',
    fontSize: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    marginLeft: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textos: {
    flex: 1,
  },
  nombre: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  horario: {
    color: '#aaa',
    fontSize: 10,
  },
});

export default HojaDeTrabajoTimeline;
