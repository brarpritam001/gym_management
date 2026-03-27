import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LogIn, LogOut, UserCheck, Clock } from "lucide-react";
import { attendanceService } from "../services/attendance";
import { memberService } from "../services/members";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import Button from "../components/Button";
import Select from "../components/Select";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/format";
import type { Attendance } from "../types";

export default function AttendancePage() {
  const qc = useQueryClient();
  const [memberId, setMemberId] = useState(0);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => attendanceService.list().then((r) => r.data),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => memberService.list().then((r) => r.data),
  });

  const checkInMut = useMutation({
    mutationFn: (id: number) => attendanceService.checkIn(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); toast.success("Checked in"); },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Check-in failed"),
  });

  const checkOutMut = useMutation({
    mutationFn: (id: number) => attendanceService.checkOut(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); toast.success("Checked out"); },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Check-out failed"),
  });

  const columns = [
    {
      key: "member_name",
      label: "Member",
      render: (a: Attendance) => <span className="font-bold text-gray-900">{a.member_name}</span>,
    },
    {
      key: "check_in",
      label: "Check In",
      render: (a: Attendance) => (
        <div className="flex items-center gap-1.5">
          <LogIn className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-gray-600 tabular-nums">{formatDateTime(a.check_in)}</span>
        </div>
      ),
    },
    {
      key: "check_out",
      label: "Check Out",
      render: (a: Attendance) =>
        a.check_out ? (
          <div className="flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-600 tabular-nums">{formatDateTime(a.check_out)}</span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50 uppercase tracking-wide">
            <Clock className="w-3 h-3" /> In Gym
          </span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Track member check-ins and check-outs" />

      {/* Quick Check-in/out Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, type: "spring", stiffness: 300, damping: 26 }}
        className="card-elevated p-4 sm:p-6 mb-4 sm:mb-6"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary-50 flex items-center justify-center">
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">Quick Action</h3>
            <p className="text-[10px] sm:text-[11px] text-gray-400">Check members in or out</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
          <div className="flex-1 w-full">
            <Select
              label="Select Member"
              value={String(memberId)}
              onChange={(e) => setMemberId(Number(e.target.value))}
              options={[{ value: "0", label: "Choose a member..." }, ...members.map((m) => ({ value: String(m.id), label: m.full_name }))]}
            />
          </div>
          <div className="flex gap-2 pb-3 sm:pb-4 shrink-0">
            <Button onClick={() => memberId && checkInMut.mutate(memberId)} disabled={!memberId || checkInMut.isPending}>
              <LogIn className="w-4 h-4" /> Check In
            </Button>
            <Button variant="secondary" onClick={() => memberId && checkOutMut.mutate(memberId)} disabled={!memberId || checkOutMut.isPending}>
              <LogOut className="w-4 h-4" /> Check Out
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Records */}
      {isLoading ? (
        <div className="card-premium p-6"><Skeleton.Table /></div>
      ) : records.length === 0 ? (
        <div className="card-premium">
          <EmptyState
            icon={<UserCheck className="w-8 h-8 text-gray-400" />}
            title="No attendance records"
            description="Check-in records will appear here after members use the facility."
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card-premium overflow-hidden"
        >
          <Table columns={columns} data={records} />
        </motion.div>
      )}
    </div>
  );
}
