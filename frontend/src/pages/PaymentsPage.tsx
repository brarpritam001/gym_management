import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, IndianRupee } from "lucide-react";
import { paymentService } from "../services/payments";
import { memberService } from "../services/members";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import toast from "react-hot-toast";
import { formatCurrency, formatDateTime } from "../utils/format";
import type { Payment, PaymentCreate } from "../types";

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PaymentCreate>({ member_id: 0, amount: 0, payment_method: "cash", notes: "" });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentService.list().then((r) => r.data),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => memberService.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d: PaymentCreate) => paymentService.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment recorded");
      setShowModal(false);
    },
    onError: () => toast.error("Failed to record payment"),
  });

  const columns = [
    {
      key: "member_name",
      label: "Member",
      render: (p: Payment) => <span className="font-bold text-gray-900">{p.member_name}</span>,
    },
    {
      key: "amount",
      label: "Amount",
      render: (p: Payment) => <span className="font-extrabold text-gray-900 tabular-nums">{formatCurrency(p.amount)}</span>,
    },
    {
      key: "payment_method",
      label: "Method",
      render: (p: Payment) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-50 border border-gray-100/60 text-[11px] font-bold text-gray-600 capitalize">
          {p.payment_method}
        </span>
      ),
    },
    { key: "status", label: "Status", render: (p: Payment) => <Badge status={p.status} /> },
    { key: "notes", label: "Notes", render: (p: Payment) => <span className="text-gray-500 truncate max-w-[150px] block">{p.notes || "—"}</span> },
    { key: "paid_at", label: "Date", render: (p: Payment) => <span className="text-gray-500 tabular-nums">{formatDateTime(p.paid_at)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Track and record all payment transactions"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Record Payment
          </Button>
        }
      />

      {isLoading ? (
        <div className="card-premium p-6"><Skeleton.Table /></div>
      ) : payments.length === 0 ? (
        <div className="card-premium">
          <EmptyState
            icon={<IndianRupee className="w-8 h-8 text-gray-400" />}
            title="No payments yet"
            description="Record your first payment to start tracking revenue."
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4" /> Record Payment
              </Button>
            }
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="card-premium overflow-hidden"
        >
          <Table columns={columns} data={payments} />
        </motion.div>
      )}

      <Modal title="Record Payment" subtitle="Log a new payment transaction" isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-1">
          <Select
            label="Member"
            value={String(form.member_id)}
            onChange={(e) => setForm({ ...form, member_id: Number(e.target.value) })}
            options={[{ value: "0", label: "Select member..." }, ...members.map((m) => ({ value: String(m.id), label: m.full_name }))]}
          />
          <Input label="Amount (₹)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required placeholder="Enter amount" />
          <Select
            label="Payment Method"
            value={form.payment_method || "cash"}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            options={[
              { value: "cash", label: "Cash" },
              { value: "card", label: "Card" },
              { value: "upi", label: "UPI" },
              { value: "online", label: "Online" },
            ]}
          />
          <Input label="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional payment notes" />
          <div className="pt-3 sm:pt-4 border-t border-gray-100 flex gap-2.5 sm:gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={createMut.isPending} className="flex-1">
              {createMut.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
