import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        height: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#1D1936',
      },
      progressBarContainer: {
        marginTop: 0,
        marginBottom: 30,
        width: '100%',
      },
      formContainer: {
        width: '100%',
        alignItems: 'center',
      },
      input: {
        height: 40,
        width: '80%',
        borderColor: '#FFF',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        color: '#fff',
      },
      errorText: {
        color: 'red',
        marginBottom: 10,
      },
      siguienteButton: {
        width: '60%',
        paddingVertical: 10,
        backgroundColor: '#161616',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#161616',
        alignItems: 'center',
        marginTop: 20,
      },
      siguienteText: {
        color: '#FFF',
      },
});