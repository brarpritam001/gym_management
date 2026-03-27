import api from "./api";
import type { Membership, MembershipCreate } from "../types";

export const membershipService = {
  list: () => api.get<Membership[]>("/memberships/"),
  get: (id: number) => api.get<Membership>(`/memberships/${id}`),
  create: (data: MembershipCreate) => api.post<Membership>("/memberships/", data),
  update: (id: number, data: { status?: string; auto_renew?: boolean }) =>
    api.put<Membership>(`/memberships/${id}`, data),
};
