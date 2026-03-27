import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Clock, IndianRupee } from "lucide-react";
import { planService } from "../services/plans";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Badge from "../components/Badge";
import { Skeleton } from "../components/Skeleton";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/format";
import type { PlanCreate } from "../types";

export default function PlansPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PlanCreate>({ name: "", description: "", duration_days: 30, price: 0 });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => planService.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d: PlanCreate) => planService.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan created");
      setShowModal(false);
      setForm({ name: "", description: "", duration_days: 30, price: 0 });
    },
    onError: () => toast.error("Failed to create plan"),
  });

  return (
    <div>
      <PageHeader
        title="Membership Plans"
        subtitle="Define pricing and duration for your memberships"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Add Plan
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton.Stats count={3} />
      ) : plans.length === 0 ? (
        <div className="card-premium">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-4 shadow-inner">
              <IndianRupee className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1.5">No plans yet</h3>
            <p className="text-sm text-gray-500 mb-5">Create your first membership plan to get started.</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4" /> Create Plan
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.06, type: "spring", stiffness: 280, damping: 24 }}
              className="card-elevated p-4 sm:p-6 group"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900">{plan.name}</h3>
                <Badge status={plan.is_active ? "active" : "expired"} />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 sm:min-h-[40px] leading-relaxed">{plan.description || "No description"}</p>

              <div className="flex items-end justify-between pt-3 sm:pt-4 border-t border-gray-100/80">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-gradient tracking-tight">
                    {formatCurrency(plan.price)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-gray-400">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="text-[11px] sm:text-xs font-semibold">{plan.duration_days} days</span>
                  </div>
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 font-bold tabular-nums">
                  {Math.round(plan.price / (plan.duration_days / 30))}/mo
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal title="Create Plan" subtitle="Add a new membership pricing tier" isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-1">
          <Input label="Plan Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Monthly, Quarterly" required />
          <Input label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this plan" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Duration (days)" type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })} required />
            <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
          </div>
          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={createMut.isPending} className="flex-1">
              {createMut.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
