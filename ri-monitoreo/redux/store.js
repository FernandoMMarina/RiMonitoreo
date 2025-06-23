import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import machineReducer from './slices/machineSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import notificationsReducer from './slices/notificationsSlice';
import visitsReducer from './slices/visitsSlice';
import ordersReducer from './slices/ordersSlice';
import authReducer from './slices/authSlice'; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    machines: machineReducer,
    maintenances: maintenanceReducer,
    notifications: notificationsReducer,
    visits: visitsReducer,
    orders: ordersReducer,
  },
  devTools: process.env.NODE_ENV !== 'production', // Habilita DevTools solo en desarrollo
});

export default store;
