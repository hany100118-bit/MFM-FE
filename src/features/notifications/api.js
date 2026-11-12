import { api } from '../../shared/api';

export const notificationsApi = {
  list: ({ limit = 30, offset = 0 } = {}) => api.get('/notifications', { query: { limit, offset } }),
  markRead: (id) => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch('/notifications/read-all', {}),
};
