import { Menu, Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";

interface Props {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/members": "Members",
  "/plans": "Plans",
  "/memberships": "Memberships",
  "/payments": "Payments",
  "/attendance": "Attendance",
  "/trainers": "Trainers",
  "/settings": "Settings",
  "/notifications": "Notifications",
};

const pageSubtitles: Record<string, string> = {
  "/": "Overview of your gym",
  "/members": "Manage members",
  "/plans": "Pricing tiers",
  "/memberships": "Member plans",
  "/payments": "Transactions",
  "/attendance": "Check-ins",
  "/trainers": "Staff",
  "/settings": "Account",
  "/notifications": "Recent alerts",
};

export default function Navbar({ onMenuClick }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  const currentPage =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/members/") ? "Member Profile" : "");
  const currentSubtitle =
    pageSubtitles[location.pathname] || "";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/60">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-8 h-14 sm:h-16">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-[15px] font-bold text-gray-900 leading-tight">{currentPage}</h2>
            {currentSubtitle && (
              <p className="text-[11px] text-gray-400 font-medium">{currentSubtitle}</p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Search button */}
          <button className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-all duration-200 text-sm border border-gray-100/80 hover:border-gray-200">
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Search...</span>
            <kbd className="ml-4 hidden xl:inline text-[10px] font-semibold bg-white px-1.5 py-0.5 rounded-md border border-gray-200 text-gray-400 shadow-sm">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-gray-100 mx-1.5" />

          {/* User */}
          <button className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-primary-600/20 group-hover:shadow-md group-hover:shadow-primary-600/30 transition-shadow">
              {user?.full_name?.charAt(0) || "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {user?.full_name || "Admin"}
              </p>
              <p className="text-[11px] text-gray-400 leading-tight capitalize">{user?.role || "admin"}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
