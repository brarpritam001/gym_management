import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Dumbbell, Mail, Phone } from "lucide-react";
import { trainerService } from "../services/trainers";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/format";
import type { TrainerCreate } from "../types";

export default function TrainersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TrainerCreate>({ full_name: "", email: "", phone: "", specialization: "", salary: 0 });

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ["trainers"],
    queryFn: () => trainerService.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d: TrainerCreate) => trainerService.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trainers"] });
      toast.success("Trainer added");
      setShowModal(false);
      setForm({ full_name: "", email: "", phone: "", specialization: "", salary: 0 });
    },
    onError: () => toast.error("Failed to add trainer"),
  });

  return (
    <div>
      <PageHeader
        title="Trainers"
        subtitle="Manage your gym's training staff"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Add Trainer
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton.Stats count={3} />
      ) : trainers.length === 0 ? (
        <div className="card-premium">
          <EmptyState
            icon={<Dumbbell className="w-8 h-8 text-gray-400" />}
            title="No trainers yet"
            description="Add your first trainer to start managing your staff."
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4" /> Add Trainer
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {trainers.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.06, type: "spring", stiffness: 280, damping: 24 }}
              className="card-elevated p-4 sm:p-6 group"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 flex items-center justify-center text-base sm:text-lg font-extrabold shrink-0 group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                  {t.full_name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">{t.full_name}</h3>
                    <Badge status={t.is_active ? "active" : "expired"} />
                  </div>
                  {t.specialization && (
                    <p className="text-sm text-primary-600 font-semibold mt-0.5">{t.specialization}</p>
                  )}
                </div>
              </div>

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100/80 space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                  <span className="truncate">{t.email}</span>
                </div>
                {t.phone && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                    <span>{t.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1.5 sm:pt-2">
                  <span className="text-[11px] sm:text-xs text-gray-400 font-semibold">Salary</span>
                  <span className="text-sm sm:text-base font-extrabold text-gray-900 tabular-nums">{formatCurrency(t.salary)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal title="Add Trainer" subtitle="Register a new trainer on your team" isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-1">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required placeholder="Trainer's full name" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="trainer@example.com" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            <Input label="Specialization" value={form.specialization || ""} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Yoga, CrossFit" />
          </div>
          <Input label="Salary (₹)" type="number" value={form.salary || 0} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} placeholder="Monthly salary" />
          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={createMut.isPending} className="flex-1">
              {createMut.isPending ? "Adding..." : "Add Trainer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
