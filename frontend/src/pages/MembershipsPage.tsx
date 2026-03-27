import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Calendar } from "lucide-react";
import { membershipService } from "../services/memberships";
import { memberService } from "../services/members";
import { planService } from "../services/plans";
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
import { formatDate } from "../utils/format";
import type { Membership, MembershipCreate } from "../types";

export default function MembershipsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<MembershipCreate>({ member_id: 0, plan_id: 0, start_date: new Date().toISOString().split("T")[0], auto_renew: false });

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ["memberships"],
    queryFn: () => membershipService.list().then((r) => r.data),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => memberService.list().then((r) => r.data),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => planService.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d: MembershipCreate) => membershipService.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memberships"] });
      toast.success("Membership assigned");
      setShowModal(false);
    },
    onError: () => toast.error("Failed to assign membership"),
  });

  const columns = [
    {
      key: "member_name",
      label: "Member",
      render: (m: Membership) => <span className="font-bold text-gray-900">{m.member_name}</span>,
    },
    { key: "plan_name", label: "Plan" },
    { key: "start_date", label: "Start", render: (m: Membership) => <span className="text-gray-500 tabular-nums">{formatDate(m.start_date)}</span> },
    { key: "end_date", label: "End", render: (m: Membership) => <span className="text-gray-500 tabular-nums">{formatDate(m.end_date)}</span> },
    { key: "status", label: "Status", render: (m: Membership) => <Badge status={m.status} /> },
    {
      key: "auto_renew",
      label: "Auto-Renew",
      render: (m: Membership) => (
        <span className={`text-[11px] font-bold uppercase tracking-wide ${m.auto_renew ? "text-emerald-600" : "text-gray-400"}`}>
          {m.auto_renew ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Memberships"
        subtitle="View and manage member-plan assignments"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Assign Membership
          </Button>
        }
      />

      {isLoading ? (
        <div className="card-premium p-6"><Skeleton.Table /></div>
      ) : memberships.length === 0 ? (
        <div className="card-premium">
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-gray-400" />}
            title="No memberships yet"
            description="Assign a membership plan to a member to get started."
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4" /> Assign Membership
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
          <Table columns={columns} data={memberships} />
        </motion.div>
      )}

      <Modal title="Assign Membership" subtitle="Link a member to a plan" isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-1">
          <Select
            label="Member"
            value={String(form.member_id)}
            onChange={(e) => setForm({ ...form, member_id: Number(e.target.value) })}
            options={[{ value: "0", label: "Select member..." }, ...members.map((m) => ({ value: String(m.id), label: m.full_name }))]}
          />
          <Select
            label="Plan"
            value={String(form.plan_id)}
            onChange={(e) => setForm({ ...form, plan_id: Number(e.target.value) })}
            options={[{ value: "0", label: "Select plan..." }, ...plans.map((p) => ({ value: String(p.id), label: `${p.name} — ${p.duration_days} days` }))]}
          />
          <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          <div className="mb-3 sm:mb-4 flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-surface-50 border border-gray-100/80">
            <input type="checkbox" id="auto_renew" checked={form.auto_renew} onChange={(e) => setForm({ ...form, auto_renew: e.target.checked })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="auto_renew" className="text-sm font-semibold text-gray-700">Auto-renew when membership expires</label>
          </div>
          <div className="pt-3 sm:pt-4 border-t border-gray-100 flex gap-2.5 sm:gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={createMut.isPending} className="flex-1">
              {createMut.isPending ? "Assigning..." : "Assign Membership"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
