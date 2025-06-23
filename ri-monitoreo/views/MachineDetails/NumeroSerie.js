import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tooltip, Icon } from 'react-native-elements';

export default function NumeroSerie({ serial }) {
  return (
    <View style={styles.row}>
      <Text style={styles.serial}>{serial}</Text>
      <Tooltip
        popover={<Text style={styles.popoverText}>Este es el número de serie único del equipo</Text>}
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
  label: {
    fontWeight: 'bold',
    color: '#444',
  },
  serial: {
    color: '#ffffff',
    fontSize:18,
    marginLeft:6,
    marginRight: 6,
    fontWeight: 'bold',
    marginBottom:15,
  },
  icon: {
    marginLeft: 4,
  },
  tool:{
    flex:1,
    width:500,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  serial: {
    color: '#ffffff',
    fontSize: 18,
    marginLeft: 6,
    marginRight: 6,
    fontWeight: 'bold',
    marginBottom: 30,
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
