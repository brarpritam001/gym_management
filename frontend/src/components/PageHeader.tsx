import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  badge?: ReactNode;
}

export default function PageHeader({ title, subtitle, action, badge }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8"
    >
      <div className="space-y-0.5 sm:space-y-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </motion.div>
  );
}
