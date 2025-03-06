import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MenuOption } from 'react-native-popup-menu';

const NotificationView2 = () => {
    const [notifications, setNotifications] = useState([
        { id: '1', title: 'Notification 1', body: 'This is the first notification', read: false },
        { id: '2', title: 'Notification 2', body: 'This is the second notification', read: true },
        { id: '3', title: 'Notification 3', body: 'This is the third notification', read: false },
    ]);

    const markAllAsRead = () => {
        const updatedNotifications = notifications.map(notification => ({
            ...notification,
            read: true
        }));
        setNotifications(updatedNotifications);
        Alert.alert('All notifications marked as read');
    };

    return (
        <View style={styles.container}>
            
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <MenuOption onSelect={() => Alert.alert('Notificación', item.body)}>
                        <View style={styles.notificationItem}>
                            <Ionicons
                                style={styles.icon}
                                name="notifications-outline"
                                color={item.read ? 'gray' : 'black'}
                                size={20}
                            />
                            <Text style={styles.notificationText}>{item.title}</Text>
                        </View>
                    </MenuOption>
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
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        padding: 10,
    },
    icon: {
        marginRight: 8,
        color:"white"
    },
    notificationText: {
        fontSize: 18,
        color:"white"
    },
    markAllButton: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#e7e7e7',
        marginBottom:30
    },
    markAllButtonText: {
        fontSize: 13,
        color: 'blue',

    },
});

export default NotificationView2;