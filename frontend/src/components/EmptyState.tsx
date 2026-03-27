import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 24 }}
      className="flex flex-col items-center justify-center py-10 sm:py-16 px-4 sm:px-6"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-3 sm:mb-5 shadow-inner"
      >
        {icon}
      </motion.div>
      <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1 sm:mb-1.5 text-center">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5 text-center max-w-sm leading-relaxed">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
