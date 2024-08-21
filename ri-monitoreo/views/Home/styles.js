import { StyleSheet } from 'react-native';

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
      title: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 1,
        color:"#FFF"
      },
      stockText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        color: "#197008"
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
      screen1: {
        flex: 1,
        backgroundColor: '#BFEFFF',
      },
      screen2: {
        flex: 1,
        backgroundColor: '#FFEBCD',
      }, shawdow: {
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
});