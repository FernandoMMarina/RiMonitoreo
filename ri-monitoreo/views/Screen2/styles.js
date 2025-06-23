import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';

export default StyleSheet.create({

    container: {
        flex: 1,
        width: "100%",
        backgroundColor: '#1D1936',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      },
      flatListContent: {
        flex: 1,
        paddingTop: 8,
        paddingBottom: 16,
      },
      card: {
        backgroundColor: '#FFF',
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        marginTop:20,
      },
      image: {
        width: 100,
        height: 100,
        marginRight: 16,
        borderRadius: 8,
      },
      details: {
        flex: 1,
      },
      titleCard: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 1,
        color:"#161616"
      },
      stockText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        color: "#161616"
      },
      quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 13,
        marginRight: 5,
        height: 50,
        width: 100
      },
      quantity: {
        fontSize: 16,
        marginHorizontal: 8,
      },
      price: {
        fontSize: 20,
        marginTop: 5,
        marginBottom: 5
      },
      button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: 'black',
        width: 100,
        height: 50
      },
      text: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
      },
      bottomBar: {
        backgroundColor: '#1D1936',
      },
      btnCircle: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        bottom: 25,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
      },
      btnCircleUp: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8E8E8',
        bottom: 30,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 1,
      },
      imgCircle: {
        width: 30,
        height: 30,
        tintColor: 'gray',
      },
      tabbarItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      img: {
        width: 30,
        height: 30,
      },

     shawdow: {
        shadowColor: '#DDDDDD',
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 5,
      },
      button: {
        flex: 1,
        justifyContent: 'center',
      },
      bottomBar: {},   
      scannerContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
      },
      closeButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 50,
      },
      closeButtonText: {
        color: 'white',
        fontSize: 18,
      }, 
      screen2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1D1936',
      },
      profileContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      initialsCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      },
      initialsText: {
        fontSize: 40,
        color: '#1D1936',
        fontWeight: 'bold',
      },
      usernameText: {
        fontSize: 20,
        color: '#FFF',
      },
      settingsButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#161616',
        borderRadius: 5,
      },
      settingsText: {
        color: '#FFF',
        fontSize: 16,
      },

      container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1D1936',
      },
      clearButton: {
        marginLeft:250,
        marginTop: 20,
        padding: 10,
        backgroundColor: '#161616',
        borderRadius: 5,
        alignItems: 'center',
      },
      clearButtonText: {
        color: '#FFF',
        fontSize: 16,
      },
      flatListContent: {
        paddingBottom: 20,
      },
      recentSearchHeader: {
        flexDirection: 'row',  // Para alinear el título y el botón "Limpiar" en la misma fila
        justifyContent: 'space-between',  // Pone el título a la izquierda y el botón a la derecha
        alignItems: 'center',
        marginTop: 40,
      },
      title: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
      },
      clearButtonText: {
        color: '#FFF',
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: 'bold',
      },
      flatListContent: {
        marginTop: 10,
      },

      titleCScreen1:{
        color:"#FFF",
        fontSize:30,
        marginTop:Platform.select({
          ios:30,
          android:30
        }),
        textAlign:"center"
      },
      titleMaquinas:{
        color:"#FFF",
        fontSize:20,
        marginTop:15,
        fontWeight:"bold"
      },
      card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
      },
      titleCard: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
      },
      subTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
      },
      chip: {
        alignSelf: 'flex-start',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginTop: 10,
      },
      chipText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },
      editText: {
        marginTop: 20,
        fontSize: 16,
        color: "#4CAF50",
        fontWeight: "bold",
        textAlign: "center",
      },
      infoText: {
        fontSize: 16,
        color: "#D1D1D1",
        marginBottom: 5,
        textAlign: "center",
      },
      screen2: {
        flex: 1,
        backgroundColor: '#1D1936',
        padding: 20,
      },
      header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 30
      },
      initialsCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
      },
      initialsText: {
        color: '#1D1936',
        fontSize: 32,
        fontWeight: 'bold',
      },
      usernameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
      },
      infoText: {
        fontSize: 16,
        color: '#fff',
      },
      formContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginBottom:150
      },
      formLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        marginTop: 15,
      },
      input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
      },
      saveButton: {
        backgroundColor: '#1D1936',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
      },
      saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      errorText: {
        color: 'red',
        marginTop: 15,
        textAlign: 'center',
      },
      logoutButton: {
        backgroundColor: '#D32F2F',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
      },
      logoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
      },

});