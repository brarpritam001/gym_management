import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { notificationService } from "../services/notifications";
import PageHeader from "../components/PageHeader";
import { Skeleton } from "../components/Skeleton";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", { page: "full" }],
    queryFn: () => notificationService.list(0, 50).then((r) => r.data),
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Notifications" subtitle="Stay on top of recent activity." />
        <Skeleton.List count={4} />
      </div>
    );
  }

  const notifications = data?.items || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Notifications" subtitle="Stay on top of recent activity." />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">No notifications yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li key={n.id} className="p-4 flex items-start gap-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${n.is_read ? "bg-gray-200" : "bg-primary-500"}`} />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{n.type.replace("_", " ")}</p>
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600 leading-snug">{n.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button
                    className="p-2 rounded-lg hover:bg-primary-50 text-primary-600"
                    onClick={() => markRead.mutate(n.id)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
