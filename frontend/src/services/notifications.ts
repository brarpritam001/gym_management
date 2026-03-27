import api from "./api";
import type { Notification } from "../types";

export interface NotificationListResponse {
  items: Notification[];
  total: number;
}

export const notificationService = {
  list: (skip = 0, limit = 20) =>
    api.get<NotificationListResponse>(`/notifications`, { params: { skip, limit } }),
  markRead: (id: number) => api.patch<Notification>(`/notifications/${id}/read`),
};
