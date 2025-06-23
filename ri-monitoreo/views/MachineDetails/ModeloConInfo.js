import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tooltip, Icon } from 'react-native-elements';

export default function ModeloConInfo({ modelo }) {
  return (
    <View style={styles.row}>
      <Text style={styles.modelo}>{modelo}</Text>
      <Tooltip
        popover={<Text style={styles.popoverText}>Este es el modelo exacto del equipo</Text>}
        backgroundColor="#333"
        height={60}
        width={220}
        withOverlay={false}
        skipAndroidStatusBar={true}
        pointerColor="#333"
        containerStyle={styles.tooltipContainer}
      >
        <Icon name="info" type="feather" color="#007AFF" containerStyle={styles.icon} />
      </Tooltip>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  modelo: {
    color: '#ffffff',
    fontSize: 18,
    marginRight: 6,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  icon: {
    marginLeft: 4,
  },
  popoverText: {
    color: '#fff',
    fontSize: 14,
  },
  tooltipContainer: {
    borderRadius: 8,
    zIndex: 999,
  },
});
