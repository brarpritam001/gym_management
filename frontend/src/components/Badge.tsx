const config: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50 border-emerald-200/60", text: "text-emerald-700", dot: "bg-emerald-500" },
  expired: { bg: "bg-red-50 border-red-200/60", text: "text-red-700", dot: "bg-red-500" },
  cancelled: { bg: "bg-gray-100 border-gray-200/60", text: "text-gray-600", dot: "bg-gray-400" },
  completed: { bg: "bg-blue-50 border-blue-200/60", text: "text-blue-700", dot: "bg-blue-500" },
  pending: { bg: "bg-amber-50 border-amber-200/60", text: "text-amber-700", dot: "bg-amber-500" },
  failed: { bg: "bg-red-50 border-red-200/60", text: "text-red-700", dot: "bg-red-500" },
  trial: { bg: "bg-violet-50 border-violet-200/60", text: "text-violet-700", dot: "bg-violet-500" },
  none: { bg: "bg-gray-50 border-gray-200/60", text: "text-gray-500", dot: "bg-gray-300" },
};

export default function Badge({ status }: { status: string }) {
  const s = config[status] || config.none;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
