import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1D1936",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    color: "#333",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  userSection: {
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  userInfoContainer: {
    marginTop: 8,
  },
  userInfo: {
    fontSize: 14,
    color: "#555",
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  selectedInfo: {
    fontSize: 14,
    color: "#1D1936",
    marginTop: 4,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: '#1D1936',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});