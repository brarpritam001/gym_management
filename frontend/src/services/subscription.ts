import api from "./api";
import type { SubscriptionPlan, GymSubscription } from "../types";

export const subscriptionService = {
  plans: () => api.get<SubscriptionPlan[]>("/subscription/plans"),
  current: () => api.get<GymSubscription>("/subscription/current"),
  upgrade: (plan_id: number) => api.post<GymSubscription>("/subscription/upgrade", { plan_id }),
};
