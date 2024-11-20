import { View, Text } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://ec2-44-211-67-52.compute-1.amazonaws.com:5000/api';

const PlusButtonWithMenu = () => {
  const [role, setRole] = useState(null);

  // Obtener datos del perfil de usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRole(response.data.role); // Establecer el rol
        } else {
          console.log('Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
      }
    };
    fetchUser();
  }, []);

  const navigation = useNavigation();

  return (
    <Menu>
      <MenuTrigger>
        <Ionicons name={'add-outline'} color="black" size={30} />
      </MenuTrigger>
      <MenuOptions
        optionsContainerStyle={{
          marginTop: 50, // Ajustar para separarlo del botón
          alignSelf: 'flex-end', // Alinea el menú al lado derecho
          marginRight: 15, // Mueve el menú hacia el borde derecho
          width: 200, // Ancho del menú para ajustarlo visualmente
        }}
      >
        {role === 'user' && (
          <MenuOption onSelect={() => navigation.navigate('NotificationView')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons style={{ marginRight: 8 }} name="notifications-outline" color="black" size={20} />
              <Text style={{ fontSize: 13 }}>Notificaciones</Text>
            </View>
          </MenuOption>
        )}
        {role !== 'user' && role && (
          <>
            <MenuOption onSelect={() => navigation.navigate('NewUserScreen')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="person-add-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Nuevo Cliente</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('NewAirScreen')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="snow-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Nuevo Aire</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('NewMaintence')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="clipboard-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Nuevo Mantenimiento</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('NotificationView')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="notifications-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Notificaciones</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('OrdersList')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="clipboard-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Hoja de Trabajo</Text>
              </View>
            </MenuOption>
          </>
        )}
      </MenuOptions>
    </Menu>
  );
};

export default PlusButtonWithMenu;
