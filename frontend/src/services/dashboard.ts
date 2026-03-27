import api from "./api";
import type { DashboardStats } from "../types";

export const dashboardService = {
  stats: () => api.get<DashboardStats>("/dashboard/stats"),
};
