import api from "./api";
import type { Member, MemberCreate } from "../types";

export const memberService = {
  list: () => api.get<Member[]>("/members/"),
  get: (id: number) => api.get<Member>(`/members/${id}`),
  create: (data: MemberCreate) => api.post<Member>("/members/", data),
  update: (id: number, data: Partial<MemberCreate>) => api.put<Member>(`/members/${id}`, data),
  delete: (id: number) => api.delete(`/members/${id}`),
};
