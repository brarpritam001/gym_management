import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/MobileBottomNav";
import AnimatedPage from "../components/AnimatedPage";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Subtle mesh gradient on the main background */}
      <div className="fixed inset-0 bg-mesh pointer-events-none opacity-60" />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-72 min-h-screen flex flex-col relative">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 lg:p-8 pb-20 md:pb-8">
          <AnimatePresence mode="wait">
            <AnimatedPage key={location.pathname}>
              <Outlet />
            </AnimatedPage>
          </AnimatePresence>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
