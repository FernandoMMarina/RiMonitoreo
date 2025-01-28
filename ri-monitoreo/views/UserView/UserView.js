import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import MaintenanceVisitStatus from '../MaintenanceVisitStatus/MaintenanceVisitStatus';
import MachineTypeCards from '../Home/card/MachineTypeCard';
import ClientMachines from '../ClientMachines/ClientMachines';
import styles from './styles';

const UserView = ({ idCliente, machines, userId, navigation }) => {
  
  return (
    <View>
      {/* Estado de visitas */}
      <MaintenanceVisitStatus clienteId={idCliente} />

      {/* Mantenimiento de equipos */}
      <View>
        <Text style={styles.titleMaquinas}>Mantenimiento de mis equipos</Text>
        <View style={{ flexDirection: 'row' }}>
          <MachineTypeCards machines={machines || []} navigation={navigation} />
        </View>
      </View>

      {/* Últimos mantenimientos */}
      <View>
        <Text style={styles.titleMaquinas}>Últimos mantenimientos</Text>
        <ScrollView
          style={{ marginTop: 20, marginBottom: 80 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          <ClientMachines machines={userId} />
        </ScrollView>
      </View>
    </View>
  );
};

export default UserView;
