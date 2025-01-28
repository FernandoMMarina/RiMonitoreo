import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 15,
    backgroundColor: '#FFF',
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center', // Centra el texto horizontalmente
    marginBottom: 8,
  },  
  detail: {
    fontSize: 16,
    marginBottom: 4,
    alignItems:"flex-end"
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center', // Asegura que se alinee correctamente en el centro
    backgroundColor: '#FFA500', // Ejemplo de color por defecto
    marginLeft: 8, // Añade separación respecto al texto de "Estado:"
  },
  chipText: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  subTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  separator: {
    height: 1, // Altura de la línea
    backgroundColor: '#ddd', // Color de la línea
    marginVertical: 10, // Espaciado arriba y abajo de la línea
    width: '100%', // Asegura que ocupe todo el ancho del contenedor
  },
  
});
