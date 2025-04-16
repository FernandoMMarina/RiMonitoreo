import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#1D1936',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color:"#fff",
      textAlign:"center"
    },
    machineItem: {
      marginBottom: 10,
    },
    machineCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#fff',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    machineInfo: {
      marginLeft: 12,
    },
    machineName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    machineDetails: {
      fontSize: 14,
      color: '#666',
    },
    machineSubText: {
      fontSize: 12,
      color: '#666',
    },
    
  });
  export default styles;
