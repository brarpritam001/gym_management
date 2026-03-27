import api from "./api";
import type { Plan, PlanCreate } from "../types";

export const planService = {
  list: () => api.get<Plan[]>("/plans/"),
  get: (id: number) => api.get<Plan>(`/plans/${id}`),
  create: (data: PlanCreate) => api.post<Plan>("/plans/", data),
  update: (id: number, data: Partial<PlanCreate>) => api.put<Plan>(`/plans/${id}`, data),
  delete: (id: number) => api.delete(`/plans/${id}`),
};
