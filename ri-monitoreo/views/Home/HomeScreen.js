import React, { useState, useEffect } from 'react';
import { View, Alert, Text, FlatList, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Camera } from 'expo-camera';
import styles from './styles';
import Screen1 from '../Screen1/Screen1';
import Screen2 from '../Screen2/Screen2';


const HomeScreen = () => {
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false); 

  const _renderIcon = (routeName, selectedTab) => {
    let icon = '';
    switch (routeName) {
      case 'Rosenisten Instalaciones - Inicio':
        icon = 'home-outline';
        break;
      case 'Rosenisten Instalaciones - Ajustes':
        icon = 'settings-outline';
        break;
    }
    return (
      <Ionicons
        name={icon}
        size={25}
        color={routeName === selectedTab ? '#1D1936' : 'gray'}
      />
    );
  };

  const renderTabBar = ({ routeName, selectedTab, navigate }) => (
    <TouchableOpacity onPress={() => navigate(routeName)} style={styles.tabbarItem}>
      {_renderIcon(routeName, selectedTab)}
    </TouchableOpacity>
  );
  return (
    <View style={{ flex: 1 }}>
      <CurvedBottomBarExpo.Navigator
        type="DOWN"
        style={styles.bottomBar}
        shadowStyle={styles.shawdow}
        height={55}
        circleWidth={50}
        bgColor="white"
        initialRouteName="Rosenisten Instalaciones - Inicio"
        borderTopLeftRight
        screenOptions={{ headerStatusBarHeight:-80 }} //Aca se esconde el header.
        renderCircle={({ selectedTab, navigate }) => (
          <Animated.View style={styles.btnCircleUp}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => {
                setShowScanner(!showScanner);
                setScanned(false); // Reiniciar el estado al abrir el escáner.
              }}
            >
              <Ionicons name={'qr-code-outline'} color="#1D1936" size={25} />
            </TouchableOpacity>
          </Animated.View>
        )}
        tabBar={renderTabBar}
      >
        <CurvedBottomBarExpo.Screen
          name="Rosenisten Instalaciones - Inicio"
          position="LEFT"
          component={Screen1}
        />
        <CurvedBottomBarExpo.Screen
          name="Rosenisten Instalaciones - Ajustes"
          position="RIGHT"
          component={Screen2}
        />
      </CurvedBottomBarExpo.Navigator>

      {showScanner && (
      <View style={styles.scannerContainer}>
        {hasPermission === null && <Text>Solicitando permiso para usar la cámara...</Text>}
        {hasPermission === false && (
          <Text>No tienes permiso para usar la cámara. Por favor, habilítalo en configuraciones.</Text>
        )}
        {hasPermission === true && (
          <Camera
            style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        )}
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanner(false)}>
          <Ionicons name="close-circle-outline" size={50} color="white" />
        </TouchableOpacity>
      </View>
    )}
    </View>
  );
};

export default HomeScreen;
