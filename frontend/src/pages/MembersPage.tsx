import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertCircle, Search, Users, X, Sparkles, CalendarDays, IndianRupee, Clock } from "lucide-react";
import { memberService } from "../services/members";
import { planService } from "../services/plans";
import { dashboardService } from "../services/dashboard";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { Skeleton } from "../components/Skeleton";
import toast from "react-hot-toast";
import type { Member, MemberCreate, Plan } from "../types";
import { formatDate, formatCurrency } from "../utils/format";

const emptyForm: MemberCreate = {
  full_name: "",
  email: "",
  phone: "",
  gender: "male",
  address: "",
  emergency_contact: "",
  plan_id: null,
  membership_name: "",
  membership_start_date: new Date().toISOString().split("T")[0],
  membership_end_date: "",
  membership_duration_days: undefined,
  membership_fee: undefined,
};

type FilterTab = "all" | "active" | "expiring" | "expired" | "no-plan";

function getMembershipStatus(m: Member): "active" | "expiring" | "expired" | "no-plan" {
  if (!m.membership_end_date) return "no-plan";
  const end = new Date(m.membership_end_date);
  const now = new Date();
  const sevenDays = new Date();
  sevenDays.setDate(sevenDays.getDate() + 7);
  if (end < now) return "expired";
  if (end <= sevenDays) return "expiring";
  return "active";
}

const tabColors: Record<FilterTab, string> = {
  all: "bg-primary-600 text-white shadow-sm shadow-primary-600/20",
  active: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20",
  expiring: "bg-amber-500 text-white shadow-sm shadow-amber-500/20",
  expired: "bg-red-500 text-white shadow-sm shadow-red-500/20",
  "no-plan": "bg-gray-600 text-white shadow-sm shadow-gray-600/20",
};

export default function MembersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<MemberCreate>({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: () => memberService.list().then((r) => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.stats().then((r) => r.data),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => planService.list().then((r) => r.data),
  });

  const limitReached = stats ? stats.member_limit > 0 && stats.total_members >= stats.member_limit : false;

  const filtered = useMemo(() => {
    let list = members;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.phone?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q)
      );
    }
    if (filterTab !== "all") {
      list = list.filter((m) => getMembershipStatus(m) === filterTab);
    }
    return list;
  }, [members, search, filterTab]);

  const counts = useMemo(() => {
    const c = { all: members.length, active: 0, expiring: 0, expired: 0, "no-plan": 0 };
    members.forEach((m) => { c[getMembershipStatus(m)]++; });
    return c;
  }, [members]);

  const createMut = useMutation({
    mutationFn: (d: MemberCreate) => {
      const payload: any = { ...d };
      if (!payload.plan_id) delete payload.plan_id;
      if (!payload.membership_name) delete payload.membership_name;
      if (!payload.membership_start_date) delete payload.membership_start_date;
      if (!payload.membership_end_date) delete payload.membership_end_date;
      if (!payload.membership_duration_days) delete payload.membership_duration_days;
      if (payload.membership_fee === undefined || payload.membership_fee === null || payload.membership_fee === "") delete payload.membership_fee;
      return memberService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Member added successfully");
      setShowModal(false);
      setForm({ ...emptyForm });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || "Failed to add member";
      toast.error(msg);
    },
  });

  const handlePlanSelect = (planId: string) => {
    if (!planId) {
      setForm((f) => ({ ...f, plan_id: null, membership_name: "", membership_duration_days: undefined, membership_fee: undefined, membership_end_date: "" }));
      return;
    }
    const plan = plans.find((p: Plan) => p.id === Number(planId));
    if (!plan) return;
    const start = form.membership_start_date || new Date().toISOString().split("T")[0];
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + plan.duration_days);
    setForm((f) => ({
      ...f,
      plan_id: plan.id,
      membership_name: plan.name,
      membership_duration_days: plan.duration_days,
      membership_fee: plan.price,
      membership_start_date: start,
      membership_end_date: endDate.toISOString().split("T")[0],
    }));
  };

  const handleStartDateChange = (val: string) => {
    const duration = form.membership_duration_days;
    let endDate = form.membership_end_date;
    if (val && duration) {
      const d = new Date(val);
      d.setDate(d.getDate() + duration);
      endDate = d.toISOString().split("T")[0];
    }
    setForm((f) => ({ ...f, membership_start_date: val, membership_end_date: endDate }));
  };

  const handleDurationChange = (val: string) => {
    const days = val ? Number(val) : undefined;
    let endDate = form.membership_end_date;
    if (days && form.membership_start_date) {
      const d = new Date(form.membership_start_date);
      d.setDate(d.getDate() + days);
      endDate = d.toISOString().split("T")[0];
    }
    setForm((f) => ({ ...f, membership_duration_days: days, membership_end_date: endDate }));
  };

  const hasMembership = !!(form.plan_id || form.membership_name || form.membership_fee);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "expiring", label: "Expiring" },
    { key: "expired", label: "Expired" },
    { key: "no-plan", label: "No Plan" },
  ];

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle="Manage your gym members and memberships"
        badge={
          stats && stats.member_limit > 0 ? (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              limitReached ? "bg-red-50 text-red-600 border border-red-200" : "bg-gray-100 text-gray-500"
            }`}>
              {stats.total_members}/{stats.member_limit}
            </span>
          ) : undefined
        }
        action={
          <Button onClick={() => setShowModal(true)} disabled={limitReached}>
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        }
      />

      {/* Limit Warning */}
      <AnimatePresence>
        {limitReached && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 sm:mb-6 flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200/50 px-3.5 sm:px-5 py-3 sm:py-4"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Member limit reached</p>
              <p className="text-xs text-red-600 mt-0.5">Upgrade your subscription to add more members.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter Card */}
      <div className="card-premium mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-start sm:items-center justify-between border-b border-gray-100/80">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-surface-50 focus:bg-white input-focus outline-none hover:border-gray-300 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Filter Tabs */}
          <div className="flex gap-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200 ${
                  filterTab === tab.key
                    ? tabColors[tab.key]
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 ${filterTab === tab.key ? "opacity-70" : "text-gray-400"}`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        {isLoading ? (
          <div className="p-6">
            <Skeleton.Table rows={5} cols={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8 text-gray-400" />}
            title={search || filterTab !== "all" ? "No members found" : "No members yet"}
            description={search || filterTab !== "all" ? "Try adjusting your search or filter." : "Start by adding your first gym member."}
            action={
              !search && filterTab === "all" && !limitReached ? (
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" /> Add Member
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100/80">
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3.5 bg-surface-50/30">Member</th>
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3.5 bg-surface-50/30">Phone</th>
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3.5 bg-surface-50/30">Membership</th>
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3.5 bg-surface-50/30">Fee</th>
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3.5 bg-surface-50/30">Expires</th>
                    <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3.5 bg-surface-50/30">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/80">
                  {filtered.map((m, i) => {
                    const ms = getMembershipStatus(m);
                    return (
                      <motion.tr
                        key={m.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.02, type: "spring", stiffness: 300, damping: 30 }}
                        onClick={() => navigate(`/members/${m.id}`)}
                        className="table-row-hover cursor-pointer group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0 group-hover:shadow-sm group-hover:scale-105 transition-all duration-200">
                              {m.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{m.full_name}</p>
                              <p className="text-xs text-gray-400 truncate">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{m.phone || <span className="text-gray-300">&mdash;</span>}</td>
                        <td className="px-5 py-3.5">
                          {m.membership_name ? (
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                              {m.membership_name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">No plan</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 font-medium tabular-nums">
                          {m.membership_fee > 0 ? formatCurrency(m.membership_fee) : <span className="text-gray-300">&mdash;</span>}
                        </td>
                        <td className="px-5 py-3.5 text-sm tabular-nums">
                          {m.membership_end_date ? (
                            <span className={
                              ms === "expired" ? "text-red-500 font-bold" :
                              ms === "expiring" ? "text-amber-600 font-bold" :
                              "text-gray-600"
                            }>
                              {formatDate(m.membership_end_date)}
                            </span>
                          ) : (
                            <span className="text-gray-300">&mdash;</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {ms === "active" && <Badge status="active" />}
                          {ms === "expiring" && <Badge status="pending" />}
                          {ms === "expired" && <Badge status="expired" />}
                          {ms === "no-plan" && <Badge status="none" />}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100/80">
              {filtered.map((m) => {
                const ms = getMembershipStatus(m);
                return (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/members/${m.id}`)}
                    className="touch-card px-3 py-2.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {m.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-gray-800 truncate">{m.full_name}</p>
                          <p className="text-[11px] text-gray-400">{m.phone || m.email}</p>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2">
                        {ms === "active" && <Badge status="active" />}
                        {ms === "expiring" && <Badge status="pending" />}
                        {ms === "expired" && <Badge status="expired" />}
                        {ms === "no-plan" && <Badge status="none" />}
                      </div>
                    </div>
                    {m.membership_name && (
                      <div className="mt-1.5 ml-[42px] flex items-center gap-2.5 text-[11px] text-gray-500">
                        <span className="font-medium">{m.membership_name}</span>
                        {m.membership_fee > 0 && <span>{formatCurrency(m.membership_fee)}</span>}
                        {m.membership_end_date && <span>Exp: {formatDate(m.membership_end_date)}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ADD MEMBER MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-900/50 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
              className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-elevation-5 w-full max-w-xl mx-0 sm:mx-4 overflow-hidden"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 via-violet-500 to-primary-500 opacity-60" />

              {/* Mobile drag handle */}
              <div className="sm:hidden flex justify-center pt-2 pb-1">
                <div className="w-8 h-1 rounded-full bg-gray-300/60" />
              </div>

              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Add New Member</h2>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Fill in details to register a new member</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:rotate-90">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="max-h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Section: Personal Info */}
                  <div>
                    <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-800">Personal Information</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Full Name <span className="text-red-400">*</span></label>
                        <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required placeholder="Enter full name" className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-white input-focus outline-none placeholder:text-gray-400 hover:border-gray-300 transition-colors" />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Email <span className="text-red-400">*</span></label>
                          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-white input-focus outline-none placeholder:text-gray-400 hover:border-gray-300 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Phone</label>
                          <input type="text" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-white input-focus outline-none placeholder:text-gray-400 hover:border-gray-300 transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Gender</label>
                        <div className="flex gap-2">
                          {["male", "female", "other"].map((g) => (
                            <button
                              key={g} type="button"
                              onClick={() => setForm({ ...form, gender: g })}
                              className={`flex-1 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold rounded-xl border-2 transition-all duration-200 ${
                                form.gender === g
                                  ? "bg-primary-50 border-primary-400 text-primary-700 shadow-sm shadow-primary-600/10"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Membership */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-800">Membership</h3>
                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium">(optional)</span>
                      </div>
                      {form.plan_id && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                          <Sparkles className="w-3 h-3" /> Auto-filled
                        </span>
                      )}
                    </div>

                    {/* Plan Selector */}
                    <div className="mb-4 sm:mb-5">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Select Plan</label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <button type="button" onClick={() => handlePlanSelect("")}
                          className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl border-2 transition-all ${!form.plan_id ? "bg-gray-900 border-gray-900 text-white" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                          Custom
                        </button>
                        {plans.filter((p: Plan) => p.is_active).map((p: Plan) => (
                          <button key={p.id} type="button" onClick={() => handlePlanSelect(p.id.toString())}
                            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl border-2 transition-all ${form.plan_id === p.id ? "bg-primary-600 border-primary-600 text-white shadow-sm shadow-primary-600/20" : "border-gray-200 text-gray-600 hover:border-primary-300 hover:bg-primary-50"}`}>
                            {p.name} &middot; {formatCurrency(p.price)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Membership Name</label>
                        <input type="text" value={form.membership_name || ""} onChange={(e) => setForm({ ...form, membership_name: e.target.value })} placeholder="e.g. 1 Month, Custom, etc." className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-white input-focus outline-none placeholder:text-gray-400 hover:border-gray-300 transition-colors" />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Start Date</label>
                          <input type="date" value={form.membership_start_date || ""} onChange={(e) => handleStartDateChange(e.target.value)} className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-white input-focus outline-none hover:border-gray-300 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Duration (days)</label>
                          <input type="number" value={form.membership_duration_days?.toString() || ""} onChange={(e) => handleDurationChange(e.target.value)} placeholder="e.g. 30" className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-white input-focus outline-none placeholder:text-gray-400 hover:border-gray-300 transition-colors" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">End Date</label>
                          <input type="date" value={form.membership_end_date || ""} onChange={(e) => setForm({ ...form, membership_end_date: e.target.value })} className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-white input-focus outline-none hover:border-gray-300 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Fee (₹)</label>
                          <input type="number" value={form.membership_fee?.toString() || ""} onChange={(e) => setForm({ ...form, membership_fee: e.target.value ? Number(e.target.value) : undefined })} placeholder="e.g. 1000" className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-white input-focus outline-none placeholder:text-gray-400 hover:border-gray-300 transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* Membership Summary */}
                    {hasMembership && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 flex items-center gap-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100/60"
                      >
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{form.membership_duration_days || "—"} days</span>
                        </div>
                        <div className="w-px h-4 bg-emerald-200" />
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>{form.membership_fee !== undefined ? formatCurrency(form.membership_fee) : "—"}</span>
                        </div>
                        {form.membership_name && (
                          <>
                            <div className="w-px h-4 bg-emerald-200" />
                            <span className="text-xs font-bold text-emerald-700">{form.membership_name}</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-surface-50/50">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMut.isPending} className="flex-1">
                    {createMut.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Plus className="w-4 h-4" /> Add Member
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
