import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, IndianRupee, Shield, Clock } from "lucide-react";
import { memberService } from "../services/members";
import { paymentService } from "../services/payments";
import Card from "../components/Card";
import Table from "../components/Table";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { Skeleton } from "../components/Skeleton";
import { formatDate, formatCurrency, formatDateTime } from "../utils/format";
import type { Payment } from "../types";

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const memberId = Number(id);

  const { data: member, isLoading } = useQuery({
    queryKey: ["member", memberId],
    queryFn: () => memberService.get(memberId).then((r) => r.data),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments", "member", memberId],
    queryFn: () => paymentService.byMember(memberId).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 skeleton rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton.Card />
          <div className="lg:col-span-2"><Skeleton.Table rows={4} cols={4} /></div>
        </div>
      </div>
    );
  }
  if (!member) return <p className="text-red-500 p-8 font-bold">Member not found</p>;

  const paymentCols = [
    { key: "amount", label: "Amount", render: (p: Payment) => <span className="font-extrabold text-gray-900 tabular-nums">{formatCurrency(p.amount)}</span> },
    { key: "payment_method", label: "Method", render: (p: Payment) => <span className="capitalize font-semibold">{p.payment_method}</span> },
    { key: "status", label: "Status", render: (p: Payment) => <Badge status={p.status} /> },
    { key: "paid_at", label: "Date", render: (p: Payment) => <span className="text-gray-500 tabular-nums">{formatDateTime(p.paid_at)}</span> },
  ];

  return (
    <div>
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate("/members")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" /> Back to Members
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 280, damping: 24 }}
        >
          <div className="card-elevated p-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-3xl font-extrabold mx-auto mb-4 shadow-lg shadow-primary-600/25">
                {member.full_name.charAt(0)}
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">{member.full_name}</h2>
              <div className="mt-2">
                <Badge status={member.is_active ? "active" : "expired"} />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {[
                { icon: Mail, value: member.email },
                { icon: Phone, value: member.phone || "N/A" },
                { icon: MapPin, value: member.address || "N/A" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600 p-2.5 rounded-xl hover:bg-surface-50 transition-colors group">
                  <div className="p-1.5 rounded-lg bg-surface-100 group-hover:bg-surface-200 transition-colors">
                    <item.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="truncate">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100/80 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Gender</span>
                <span className="font-bold text-gray-700 capitalize">{member.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Joined</span>
                <span className="font-bold text-gray-700 tabular-nums">{formatDate(member.joined_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Emergency</span>
                <span className="font-bold text-gray-700">{member.emergency_contact || "N/A"}</span>
              </div>
            </div>

            {member.membership_name && (
              <div className="mt-5 pt-5 border-t border-gray-100/80">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <h3 className="text-sm font-bold text-gray-900">Membership</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Plan</span>
                    <span className="font-bold text-gray-700">{member.membership_name}</span>
                  </div>
                  {member.membership_start_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Start</span>
                      <span className="font-bold text-gray-700 tabular-nums">{formatDate(member.membership_start_date)}</span>
                    </div>
                  )}
                  {member.membership_end_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">End</span>
                      <span className="font-bold text-gray-700 tabular-nums">{formatDate(member.membership_end_date)}</span>
                    </div>
                  )}
                  {member.membership_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Fee</span>
                      <span className="font-extrabold text-primary-600 tabular-nums">{formatCurrency(member.membership_fee)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 280, damping: 24 }}
          className="lg:col-span-2"
        >
          <div className="card-elevated">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100/80">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-primary-500" />
                <h3 className="text-base font-bold text-gray-900">Payment History</h3>
                <span className="text-xs text-gray-400 ml-1 font-bold">{payments.length} records</span>
              </div>
            </div>
            <div className="p-2">
              <Table columns={paymentCols} data={payments} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
