import { type ReactNode } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  gradient: string;
  delay?: number;
  prefix?: string;
}

export default function StatCard({ title, value, icon, gradient, delay = 0, prefix }: Props) {
  const isNumber = typeof value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3.5 sm:p-5 ${gradient} group cursor-default`}
    >
      {/* Decorative layers */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-700 ease-out" />
      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/[0.06] group-hover:scale-110 transition-transform duration-700 ease-out delay-75" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1 sm:space-y-2">
          <p className="text-[11px] sm:text-[13px] font-semibold text-gray-500/80 tracking-wide">{title}</p>
          {isNumber ? (
            <AnimatedCounter
              value={value}
              prefix={prefix}
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight"
              duration={1}
            />
          ) : (
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
          )}
        </div>
        <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/70 shadow-sm backdrop-blur-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
