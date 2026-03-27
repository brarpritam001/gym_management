import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  ClipboardList,
  Dumbbell,
  Settings,
  LogOut,
  X,
  UserCheck,
  Bell,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const mainLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/plans", label: "Plans", icon: ClipboardList },
  { to: "/memberships", label: "Memberships", icon: Calendar },
];

const manageLinks = [
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/attendance", label: "Attendance", icon: UserCheck },
  { to: "/trainers", label: "Trainers", icon: Dumbbell },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

function NavItem({ link, isActive, onClose }: { link: typeof mainLinks[0]; isActive: boolean; onClose: () => void }) {
  return (
    <NavLink
      to={link.to}
      end={link.to === "/"}
      onClick={onClose}
      className="relative group block"
    >
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? "bg-primary-600/15 text-white"
            : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary-400"
            style={{ boxShadow: "0 0 16px rgba(99,102,241,0.5), 0 0 4px rgba(99,102,241,0.3)" }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        )}
        <link.icon className={`w-[18px] h-[18px] transition-all duration-200 ${
          isActive ? "text-primary-400" : "group-hover:text-gray-300"
        }`} />
        <span>{link.label}</span>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
          />
        )}
      </div>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }: Props) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-dark-800 flex flex-col transition-transform duration-300 ease-smooth lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/[0.04] via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">GymPro</span>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Management</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
          {/* Main section */}
          <div className="mb-6">
            <p className="px-4 mb-2 text-[10px] font-bold text-gray-500/60 uppercase tracking-widest">Overview</p>
            <div className="space-y-0.5">
              {mainLinks.map((link) => (
                <NavItem key={link.to} link={link} isActive={isActive(link.to)} onClose={onClose} />
              ))}
            </div>
          </div>

          {/* Manage section */}
          <div className="mb-6">
            <p className="px-4 mb-2 text-[10px] font-bold text-gray-500/60 uppercase tracking-widest">Manage</p>
            <div className="space-y-0.5">
              {manageLinks.map((link) => (
                <NavItem key={link.to} link={link} isActive={isActive(link.to)} onClose={onClose} />
              ))}
            </div>
          </div>

          {/* Settings */}
          <div>
            <div className="mx-3 mb-3 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            <NavItem link={{ to: "/settings", label: "Settings", icon: Settings }} isActive={isActive("/settings")} onClose={onClose} />
          </div>
        </nav>

        {/* User + Logout */}
        <div className="relative p-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center text-primary-400 text-sm font-bold shrink-0 ring-1 ring-primary-500/10">
              {user?.full_name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name || "Admin"}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-gray-500 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
