import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCheck,
  Settings,
  Bell,
} from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/plans", label: "Plans", icon: ClipboardList },
  { to: "/attendance", label: "Attend", icon: UserCheck },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/settings", label: "More", icon: Settings },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/40 md:hidden shadow-elevation-3">
      <div className="flex items-center justify-around h-[52px] px-1">
        {items.map((item) => {
          const isActive =
            item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="relative flex flex-col items-center justify-center gap-0.5 w-full h-full"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -inset-2 rounded-xl bg-primary-50 border border-primary-100/50"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                <item.icon
                  className={`relative w-[18px] h-[18px] transition-all duration-200 ${
                    isActive ? "text-primary-600" : "text-gray-400"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[9px] font-bold transition-colors duration-200 ${
                  isActive ? "text-primary-600" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
      {/* Safe area for notch phones */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white/95" />
    </nav>
  );
}
