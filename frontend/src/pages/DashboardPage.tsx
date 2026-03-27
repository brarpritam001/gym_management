import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, AlertTriangle, IndianRupee, Dumbbell, UserCheck, TrendingUp, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { dashboardService } from "../services/dashboard";
import StatCard from "../components/StatCard";
import AnimatedCounter from "../components/AnimatedCounter";
import { Skeleton } from "../components/Skeleton";
import { formatCurrency } from "../utils/format";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.stats().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <Skeleton.Stats count={6} />
      </div>
    );
  }

  const usagePercent = stats?.member_limit
    ? Math.min(100, Math.round((stats.total_members / stats.member_limit) * 100))
    : 0;
  const limitReached = stats ? stats.member_limit > 0 && stats.total_members >= stats.member_limit : false;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 28 }}
      >
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          {greeting()}, {user?.full_name?.split(" ")[0] || "Admin"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 font-medium">Here's what's happening with your gym today</p>
      </motion.div>

      {/* SaaS Plan Usage Banner */}
      {stats?.current_plan && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 280, damping: 26 }}
          className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3.5 sm:p-5 ${
            limitReached
              ? "bg-gradient-to-r from-red-50 via-red-50/80 to-red-100/50 border border-red-200/50"
              : "bg-gradient-to-r from-primary-50 via-violet-50/50 to-primary-50/30 border border-primary-200/30"
          }`}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-sm" />
          <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 blur-sm" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl shadow-sm ${limitReached ? "bg-red-100" : "bg-primary-100"}`}>
                <TrendingUp className={`w-5 h-5 ${limitReached ? "text-red-600" : "text-primary-600"}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{stats.current_plan} Plan</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    limitReached ? "bg-red-100 text-red-700" : "bg-primary-100 text-primary-700"
                  }`}>
                    {stats.total_members} / {stats.member_limit} members
                  </span>
                </div>
                {limitReached && (
                  <p className="text-sm text-red-600 font-semibold mt-1">
                    Upgrade your plan to add more members
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 sm:min-w-[220px]">
              <div className="flex-1 bg-white/60 rounded-full h-2.5 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercent}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className={`h-full rounded-full ${
                    limitReached ? "bg-red-500" : usagePercent > 80 ? "bg-amber-500" : "bg-primary-500"
                  }`}
                />
              </div>
              <span className="text-xs font-bold text-gray-600 whitespace-nowrap tabular-nums">{usagePercent}%</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard
          title="Total Members"
          value={stats?.total_members ?? 0}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          gradient="stat-gradient-blue"
          delay={0}
        />
        <StatCard
          title="Active Memberships"
          value={stats?.active_memberships ?? 0}
          icon={<Calendar className="w-5 h-5 text-emerald-600" />}
          gradient="stat-gradient-green"
          delay={0.05}
        />
        <StatCard
          title="Expiring Soon"
          value={stats?.expiring_soon ?? 0}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          gradient="stat-gradient-amber"
          delay={0.1}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthly_revenue ?? 0)}
          icon={<IndianRupee className="w-5 h-5 text-violet-600" />}
          gradient="stat-gradient-purple"
          delay={0.15}
        />
        <StatCard
          title="Trainers"
          value={stats?.total_trainers ?? 0}
          icon={<Dumbbell className="w-5 h-5 text-orange-600" />}
          gradient="stat-gradient-orange"
          delay={0.2}
        />
        <StatCard
          title="Today's Check-ins"
          value={stats?.today_check_ins ?? 0}
          icon={<UserCheck className="w-5 h-5 text-teal-600" />}
          gradient="stat-gradient-teal"
          delay={0.25}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, type: "spring", stiffness: 260, damping: 24 }}
      >
        <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Add Member", to: "/members", icon: Users, color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-100/50", shadow: "hover:shadow-colored-blue" },
            { label: "Record Payment", to: "/payments", icon: IndianRupee, color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-100/50", shadow: "hover:shadow-colored-violet" },
            { label: "Check In", to: "/attendance", icon: UserCheck, color: "text-teal-600", bg: "bg-teal-50 hover:bg-teal-100 border-teal-100/50", shadow: "hover:shadow-colored-emerald" },
            { label: "View Plans", to: "/plans", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-100/50", shadow: "hover:shadow-colored-emerald" },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => navigate(item.to)}
              className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 group ${item.bg} ${item.shadow}`}
            >
              <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${item.color} group-hover:scale-110 transition-transform duration-200`} />
              <span className="text-xs sm:text-sm font-semibold text-gray-700">{item.label}</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-auto text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 hidden sm:block" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
