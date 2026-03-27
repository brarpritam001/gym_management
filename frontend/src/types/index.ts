/* Shared TypeScript types mirroring backend schemas. */

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  gym_id: number | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Member {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  emergency_contact: string;
  is_active: boolean;
  membership_name: string;
  membership_start_date: string | null;
  membership_end_date: string | null;
  membership_fee: number;
  joined_date: string;
  created_at: string;
}

export interface MemberCreate {
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  plan_id?: number | null;
  membership_name?: string;
  membership_start_date?: string;
  membership_end_date?: string;
  membership_duration_days?: number;
  membership_fee?: number;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface PlanCreate {
  name: string;
  description?: string;
  duration_days: number;
  price: number;
}

export interface Membership {
  id: number;
  member_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: string;
  auto_renew: boolean;
  created_at: string;
  member_name?: string;
  plan_name?: string;
}

export interface MembershipCreate {
  member_id: number;
  plan_id: number;
  start_date: string;
  auto_renew?: boolean;
}

export interface Payment {
  id: number;
  member_id: number;
  membership_id: number | null;
  amount: number;
  payment_method: string;
  status: string;
  notes: string;
  paid_at: string;
  created_at: string;
  member_name?: string;
}

export interface PaymentCreate {
  member_id: number;
  membership_id?: number;
  amount: number;
  payment_method?: string;
  notes?: string;
}

export interface Attendance {
  id: number;
  member_id: number;
  check_in: string;
  check_out: string | null;
  member_name?: string;
}

export interface Trainer {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  salary: number;
  is_active: boolean;
  created_at: string;
}

export interface TrainerCreate {
  full_name: string;
  email: string;
  phone?: string;
  specialization?: string;
  salary?: number;
}

export interface DashboardStats {
  total_members: number;
  active_memberships: number;
  expiring_soon: number;
  monthly_revenue: number;
  total_trainers: number;
  today_check_ins: number;
  member_limit: number;
  current_plan: string;
}

/* SaaS subscription types */
export interface SubscriptionPlan {
  id: number;
  name: string;
  member_limit: number;
  price: number;
  duration_days: number;
  features: string;
  is_active: boolean;
}

export interface GymSubscription {
  id: number;
  gym_id: number;
  plan_id: number;
  plan_name: string;
  member_limit: number;
  start_date: string;
  end_date: string;
  status: string;
  current_members: number;
}

export interface Notification {
  id: number;
  gym_id: number | null;
  user_id: number | null;
  member_id: number | null;
  membership_id: number | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
