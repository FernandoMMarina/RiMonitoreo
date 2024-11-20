import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D1936',
    padding: 10,
  },
  listContainer: {
    paddingBottom: 20,
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
  cardHeader: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  chipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandedContent: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#EFEFEF',
    borderRadius: 5,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noHistory: {
    fontSize: 14,
    color: '#999',
  },
  maintenanceItem: {
    marginBottom: 10,
  },
  maintenanceDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  maintenanceDescription: {
    fontSize: 14,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
