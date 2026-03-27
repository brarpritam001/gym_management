import api from "./api";
import type { Payment, PaymentCreate } from "../types";

export const paymentService = {
  list: () => api.get<Payment[]>("/payments/"),
  create: (data: PaymentCreate) => api.post<Payment>("/payments/", data),
  byMember: (memberId: number) => api.get<Payment[]>(`/payments/member/${memberId}`),
};
