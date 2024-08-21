import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1D1936',
      },
      contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Constants.statusBarHeight,
        paddingHorizontal: 20,
        padding: 8,
        backgroundColor: '#1D1936',
      },
      errorText: {
        color: 'red',
        marginLeft: 20,
      },
      input: {
        width: "80%",
        backgroundColor: 'white',
        height: 40,
        padding: 8,
        borderRadius: 4,
        margin: 15,
      },
      tinyLogo: {
        marginTop: 0,
        width: 200,
        height: 200,
      },
      loginScreenButton: {
        width: "40%",
        marginRight: 40,
        marginLeft: 40,
        marginTop: 30,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#161616',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#161616',
      },
      loginText: {
        color: '#fff',
        textAlign: 'center',
        paddingLeft: 10,
        paddingRight: 10,
      }

});