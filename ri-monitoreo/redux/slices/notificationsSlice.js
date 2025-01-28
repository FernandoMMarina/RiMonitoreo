import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [], // Lista de notificaciones
    unreadCount: 0,    // Número de notificaciones no leídas
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
      state.unreadCount += 1;
    },
    markAllAsRead: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
