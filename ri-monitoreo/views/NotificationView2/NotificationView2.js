import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const NotificationView2 = ({ route }) => {
  const { userId } = route.params; // Recibe el userId como prop
  const [notifications, setNotifications] = useState([]);

  // Cargar notificaciones al iniciar
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem('notifications');
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    loadNotifications();
  }, []);

  // Escuchar notificaciones en primer plano
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(handleNotification);
    return () => subscription.remove();
  }, []);

  // Manejar una nueva notificación
  const handleNotification = (notification) => {
    const newNotification = {
      id: notification.request.identifier || Date.now().toString(),
      title: notification.request.content.title,
      body: notification.request.content.body,
      read: false,
    };
    saveNotification(newNotification);
  };

  // Guardar una notificación en AsyncStorage
  const saveNotification = async (notification) => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      const notificationsArray = storedNotifications ? JSON.parse(storedNotifications) : [];
      notificationsArray.unshift(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notificationsArray));
      setNotifications(notificationsArray);
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    Alert.alert('Éxito', 'Todas las notificaciones han sido marcadas como leídas.');
  };

  // Marcar una notificación como leída
  const markAsRead = async (id) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Eliminar una notificación
  const deleteNotification = async (id) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    Alert.alert('Éxito', 'La notificación ha sido eliminada.');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Menu>
            <MenuTrigger>
              <View style={[styles.notificationItem, item.read && styles.readNotification]}>
                <Ionicons
                  style={styles.icon}
                  name="notifications-outline"
                  color={item.read ? 'gray' : 'white'}
                  size={20}
                />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationBody}>{item.body}</Text>
                </View>
              </View>
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={() => markAsRead(item.id)}>
                <Text style={styles.menuOptionText}>Marcar como leída</Text>
              </MenuOption>
              <MenuOption onSelect={() => deleteNotification(item.id)}>
                <Text style={[styles.menuOptionText, styles.deleteOption]}>Eliminar</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        )}
      />
      <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
        <Text style={styles.markAllButtonText}>Marcar todas como leídas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1936",
    padding: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#2E2A4F',
    borderRadius: 10,
  },
  readNotification: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 14,
    color: 'white',
  },
  markAllButton: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    marginVertical: 10,
  },
  markAllButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  menuOptionText: {
    fontSize: 16,
    padding: 10,
  },
  deleteOption: {
    color: 'red',
  },
});

export default NotificationView2;