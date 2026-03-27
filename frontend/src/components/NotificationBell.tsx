import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle, Loader2 } from "lucide-react";
import { notificationService } from "../services/notifications";
import type { Notification } from "../types";

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", { page: 1 }],
    queryFn: () => notificationService.list(0, 10).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const unreadCount = useMemo(
    () => (data?.items || []).filter((n) => !n.is_read).length,
    [data],
  );

  const markRead = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const items = data?.items || [];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
      >
        <Bell className="w-[18px] h-[18px] text-gray-500 group-hover:text-gray-700 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary-500 text-white text-[11px] rounded-full flex items-center justify-center font-bold shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white shadow-lg rounded-2xl border border-gray-100 p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">Notifications</p>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>

          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-500">You're all caught up!</div>
            )}
            {items.map((n) => (
              <div key={n.id} className="py-2.5 flex items-start gap-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${n.is_read ? "bg-gray-200" : "bg-primary-500"}`} />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{n.type.replace("_", " ")}</p>
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600 leading-snug">{n.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button
                    className="p-1 rounded-md hover:bg-primary-50 text-primary-600"
                    onClick={() => markRead.mutate(n.id)}
                    title="Mark as read"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
