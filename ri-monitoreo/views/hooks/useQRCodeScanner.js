import { useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';

export const useQRCodeScanner = () => {
  const [scanned, setScanned] = useState(false);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();
      if (!granted) {
        return Alert.alert("Cámara", "Necesita habilitar el uso de la cámara");
      }
      setModalIsVisible(true);
    } catch (error) {
      console.error(error);
    }
  }

  const handleCloseCamera = () => {
    setModalIsVisible(false);
  };

  return {
    scanned,
    setScanned,
    modalIsVisible,
    handleOpenCamera,
    handleCloseCamera,
    setModalIsVisible,
  };
};
