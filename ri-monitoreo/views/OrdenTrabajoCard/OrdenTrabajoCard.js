// OrdenTrabajoTabs.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import DetalleTab from './DetalleTab';
import HerramientasTab from './HerramientasTab';
import ActualizacionTab from './ActualizacionTab';

const Tab = createMaterialTopTabNavigator();

export default function OrdenTrabajoCard({ route }) {
  const { trabajo } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let iconName;
          switch (route.name) {
            case 'Detalle':
              iconName = 'information-circle';
              break;
            case 'Herramientas':
              iconName = 'construct-outline';
              break;
            case 'Actualización':
              iconName = 'create-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }
          return <Ionicons name={iconName} size={22} color={focused ? '#007bff' : '#999'} />;
        },
        tabBarIndicatorStyle: { backgroundColor: '#007bff' },
      })}
    >
      <Tab.Screen name="Detalle" children={() => <DetalleTab trabajo={trabajo} />} />
      <Tab.Screen name="Herramientas" children={() => <HerramientasTab trabajo={trabajo} />} />
      <Tab.Screen name="Actualización" children={() => <ActualizacionTab trabajo={trabajo} />} />
    </Tab.Navigator>
  );
}
