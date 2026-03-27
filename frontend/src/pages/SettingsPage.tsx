import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Crown, Zap, Check, Shield } from "lucide-react";
import { subscriptionService } from "../services/subscription";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Badge from "../components/Badge";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/format";

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currentSub } = useQuery({
    queryKey: ["subscription-current"],
    queryFn: () => subscriptionService.current().then((r) => r.data),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionService.plans().then((r) => r.data),
  });

  const upgradeMut = useMutation({
    mutationFn: (planId: number) => subscriptionService.upgrade(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-current"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Plan upgraded successfully!");
    },
    onError: () => toast.error("Failed to upgrade plan"),
  });

  const usagePercent = currentSub
    ? Math.min(100, Math.round((currentSub.current_members / currentSub.member_limit) * 100))
    : 0;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and subscription" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 280, damping: 24 }}
          className="card-elevated p-4 sm:p-6"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary-50">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">Profile</h3>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xl sm:text-2xl font-extrabold shadow-lg shadow-primary-600/20">
              {user?.full_name?.charAt(0) || "A"}
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-gray-900">{user?.full_name}</h4>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100/80">
            {[
              { label: "Full Name", value: user?.full_name },
              { label: "Email", value: user?.email },
              { label: "Role", value: user?.role },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                <span className="text-sm font-bold text-gray-800 capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Current Subscription */}
        {currentSub && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.05, type: "spring", stiffness: 280, damping: 24 }}
            className="card-elevated p-4 sm:p-6"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-50">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Current Subscription</h3>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <span className="text-lg sm:text-xl font-extrabold text-gray-900">{currentSub.plan_name}</span>
              <Badge status={currentSub.status === "trial" ? "trial" : "active"} />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 font-medium">Member Usage</span>
                  <span className="text-sm font-bold text-gray-700 tabular-nums">
                    {currentSub.current_members} / {currentSub.member_limit}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                    className={`h-full rounded-full ${
                      usagePercent >= 100 ? "bg-red-500" : usagePercent > 80 ? "bg-amber-500" : "bg-primary-500"
                    }`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100/80">
                <span className="text-gray-500 font-medium">Period</span>
                <span className="font-bold text-gray-700 tabular-nums">{currentSub.start_date} — {currentSub.end_date}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Available Plans */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 280, damping: 24 }}
          className="card-elevated p-4 sm:p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-violet-50">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">Available Plans</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {plans.map((plan, i) => {
              const isCurrent = currentSub?.plan_id === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.15 + i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
                  className={`relative rounded-xl sm:rounded-2xl border-2 p-4 sm:p-5 transition-all duration-300 ${
                    isCurrent
                      ? "border-primary-400 bg-primary-50/50 shadow-glow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-elevation-3"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-4 inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 bg-primary-100 px-2.5 py-1 rounded-full border border-primary-200/60 uppercase tracking-wide">
                      <Check className="w-3 h-3" /> Current
                    </div>
                  )}

                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-extrabold text-gray-900">{plan.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">
                      Up to {plan.member_limit >= 999999 ? "Unlimited" : plan.member_limit} members
                    </p>
                  </div>

                  <div className="mb-5">
                    <span className="text-3xl font-extrabold text-gradient">
                      {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
                    </span>
                    {plan.price > 0 && <span className="text-sm text-gray-400 ml-1 font-semibold">/mo</span>}
                  </div>

                  {isCurrent ? (
                    <div className="w-full py-2.5 text-center text-sm font-bold text-primary-600 bg-primary-100 rounded-xl">
                      Active Plan
                    </div>
                  ) : (
                    <Button
                      onClick={() => upgradeMut.mutate(plan.id)}
                      disabled={upgradeMut.isPending}
                      className="w-full"
                    >
                      {upgradeMut.isPending ? "..." : "Upgrade"}
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2, type: "spring", stiffness: 280, damping: 24 }}
          className="card-elevated p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gray-100">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Application</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Version</span>
              <span className="font-bold text-gray-700">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Product</span>
              <span className="font-bold text-gray-700">GymPro</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Type</span>
              <span className="font-bold text-gray-700">SaaS Platform</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
