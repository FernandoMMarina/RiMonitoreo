import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import HomeScreen from "./views/Home/HomeScreen";
import LoginScreen from './views/Login/LoginScreen';
import NewUserScreen from './views/NewUser/NewUserScreen';
import NewAirScreen from './views/NewAir/NewAirScreen';
import PlusButtonWithMenu from './views/PlusButtonWithMenu';
import MachineDetailsScreen from './views/MachineDetails/MachineDetailsScreen';
import NewMaintence from './views/NewMaintence/NewMaintence';
import MachinesList from './views/MachineList/MachineList';
import OrdersList from './views/OrdersList/OrdersList.js';
import NotificationView from './views/NotificationView/NotificationView.js';
import NotificationView2 from './views/NotificationView2/NotificationView2.js';
import WorkDetailsScreen from './views/WorkDetails/WorkDetailsScreen.js';
import ClientMachines from './views/ClientMachines/ClientMachines.js';
import MachineListScreen from './views/MachineListScreen/MachineListScreen';
import CotizationForm from './views/CotizationForm/CotizationForm.js';
import AddTareaCard from './views/AddTarea/AddTareaCard.js';
import MachineSearchComponent from './views/MachineSearchComponent/machineSearchComponent.js';
import { navigationRef } from './utils/navigationRef';
import DetalleTrabajo from './views/HojaDeTrabajoTimeline/DetalleTrabajo';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const LoadingScreen = () => null;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {isAuthenticated === null ? (
          <Stack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{ headerShown: false }}
          />
        ) : isAuthenticated ? (
          <>
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={{
                headerShown: true,
                headerTitle: "Rosenstein Instalaciones",
                headerRight: () => <PlusButtonWithMenu />,
              }}
            />
            <Stack.Screen name="NewUserScreen" component={NewUserScreen} options={{ headerTitle: "Nuevo Cliente" }} />
            <Stack.Screen name="NewAirScreen" component={NewAirScreen} options={{ headerTitle: "Nuevo Maquina" }} />
            <Stack.Screen name="MachineDetails" component={MachineDetailsScreen} options={{ headerTitle: "Detalles del Equipo" }} />
            <Stack.Screen name="NewMaintence" component={NewMaintence} options={{ headerTitle: "Nuevo Mantenimiento" }} />
            <Stack.Screen name="MachinesList" component={MachinesList} options={{ headerTitle: "Todas mis maquinas" }} />
            <Stack.Screen name="NotificationView" component={NotificationView} options={{ headerTitle: "Menu Notificaciones" }} />
            <Stack.Screen name="NotificationView2" component={NotificationView2} options={{ headerTitle: "Notificaciones" }} />
            <Stack.Screen name="OrdersList" component={OrdersList} options={{ headerTitle: "Hoja de Trabajo" }} />
            <Stack.Screen name="DetallesTrabajo" component={WorkDetailsScreen} options={{ headerTitle: "Detalles del Trabajo" }} />
            <Stack.Screen name="DetalleTrabajo" component={DetalleTrabajo} options={{ headerTitle: "Detalles del Trabajo" }} />
            <Stack.Screen name="ClientMachines" component={ClientMachines} options={{ headerTitle: "Máquinas del Cliente" }} />
            <Stack.Screen name="MachineListScreen" component={MachineListScreen} options={{ headerTitle: "Lista de Máquinas" }} />
            <Stack.Screen name="AsignarQR" component={MachineSearchComponent} options={{ headerTitle: "Asignar QR" }} />
            <Stack.Screen name="CotizationForm" component={CotizationForm} options={{ headerTitle: "Cotizacion" }} />
            <Stack.Screen name="AddTarea" component={AddTareaCard} options={{ headerTitle: "Tareas" }} />
          </>
        ) : (
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
