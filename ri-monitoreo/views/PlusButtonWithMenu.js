import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert ,TouchableOpacity} from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../redux/slices/userSlice';
import { markAllAsRead } from '../redux/slices/notificationsSlice';
import { useNavigation } from '@react-navigation/native';

const PlusButtonWithMenu = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Estados globales desde Redux
  const { profile, loading, error } = useSelector((state) => state.user);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  // Obtener perfil del usuario al montar
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Text>
          Error al cargar perfil: {typeof error === 'object' ? JSON.stringify(error) : error}
        </Text>
      </View>
    );
  }
  

  return (
    <>
    {profile?.role === 'user' && (
      <>
        <TouchableOpacity onPress={() => navigation.navigate('NotificationView2')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }} >
            <Ionicons style={{ marginRight: 8 }} name="notifications-outline" color="black" size={25} />
          </View>
        </TouchableOpacity>
        
      </>
    )}

    {profile?.role === 'technical'  && (
    <Menu>
      <MenuTrigger>
        <View>
          <Ionicons
            name={profile?.role === 'user' ? 'notifications-outline' : 'add-outline'}
            color="black"
            size={30}
          />
          {profile?.role === 'user' && unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: 'red',
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </MenuTrigger>
      <MenuOptions
        optionsContainerStyle={{
          marginTop: 60,
          alignSelf: 'flex-end',
          marginRight: 150,
          marginLeft:50,
          width: 350,
        }}
      >
         
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
                <Text style={{ fontSize: 13 }}>Nuevo Equipo</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('AsignarQR')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="qr-code-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Asignar QR</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('NewMaintence')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="clipboard-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Nuevo Mantenimiento</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('NotificationView2')}>
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
            <MenuOption onSelect={() => navigation.navigate('CotizationForm')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="clipboard-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Cotizacion</Text>
              </View>
            </MenuOption>
          </>
      </MenuOptions>
    </Menu>
    )}

    {profile?.role === 'admin'  && (
    <Menu>
      <MenuTrigger>
        <View>
          <Ionicons
            name={profile?.role === 'user' ? 'notifications-outline' : 'add-outline'}
            color="black"
            size={30}
          />
          {profile?.role === 'user' && unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: 'red',
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </MenuTrigger>
      <MenuOptions
        optionsContainerStyle={{
          marginTop: 60,
          alignSelf: 'flex-end',
          marginRight: 150,
          marginLeft:50,
          width: 350,
        }}
      >
         
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
                <Text style={{ fontSize: 13 }}>Nuevo Equipo</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('AsignarQR')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="qr-code-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Asignar QR</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('NewMaintence')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="clipboard-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Nuevo Mantenimiento</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('NotificationView2')}>
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
            <MenuOption onSelect={() => navigation.navigate('CotizationForm')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="clipboard-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Cotizacion</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('AddTarea')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons style={{ marginRight: 8 }} name="clipboard-outline" color="black" size={20} />
                <Text style={{ fontSize: 13 }}>Agregar Tarea</Text>
              </View>
            </MenuOption>
          </>
      </MenuOptions>
    </Menu>
    )}
    </>
  );
};

export default PlusButtonWithMenu;
