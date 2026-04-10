import api from './api';

/* ─────────────────────────────────────────────
   NOTIFICATIONS SERVICE — REST calls to backend
   Mirrors the backend NotificationsController:
     GET    /notifications
     PATCH  /notifications/read-all
     PATCH  /notifications/:id/read
     DELETE /notifications/:id
───────────────────────────────────────────── */

/** Shape returned by the backend */
export interface BackendNotification {
  id: string;
  message: string;
  title?: string | null;
  read: boolean;
  type: string;             // 'info' | 'success' | 'warning' | 'achievement' | 'badge'
  targetType?: string | null;  // 'project' | 'client'
  targetId?: string | null;
  createdAt: string;
}

export const notificationsService = {
  async fetchAll(): Promise<BackendNotification[]> {
    const { data } = await api.get<BackendNotification[]>('/notifications');
    return data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
