import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';

const NotificationView2 = () => {

    return (
        <>
        <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MenuOption onSelect={() => Alert.alert('Notificación', item.body)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                    <Ionicons
                      style={{ marginRight: 8 }}
                      name="notifications-outline"
                      color={item.read ? 'gray' : 'black'}
                      size={20}
                    />
                    <Text style={{ fontSize: 13 }}>{item.title}</Text>
                  </View>
                </MenuOption>
              )}
            />
            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 ,textAlign:"center" }}>Notificaciones</Text>
            </View>
            <Text style={{ fontSize: 13, textAlign: 'center', color: 'blue' }}>
                Marcar todas como leídas
            </Text>
        </>
    );
}

export default NotificationView2;