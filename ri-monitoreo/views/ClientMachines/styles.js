import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF',
      padding: 16,
    },
    listContent: {
      paddingBottom: 16,
    },
    card: {
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    machineName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    lastMaintenance: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
    },
    chip: {
      alignSelf: 'flex-start',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    chipText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
      titleCard: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
      },
      subTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
      },
      chip: {
        alignSelf: 'flex-start',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
      },
      chipText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
      },
      listContainer: {
        paddingBottom: 16,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
  });