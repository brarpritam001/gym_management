import api from "./api";
import type { Trainer, TrainerCreate } from "../types";

export const trainerService = {
  list: () => api.get<Trainer[]>("/trainers/"),
  get: (id: number) => api.get<Trainer>(`/trainers/${id}`),
  create: (data: TrainerCreate) => api.post<Trainer>("/trainers/", data),
  update: (id: number, data: Partial<TrainerCreate>) => api.put<Trainer>(`/trainers/${id}`, data),
  delete: (id: number) => api.delete(`/trainers/${id}`),
};
