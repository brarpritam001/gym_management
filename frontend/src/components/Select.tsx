import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, options, className = "", ...props }: Props) {
  return (
    <div className="mb-3 sm:mb-4">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 input-focus outline-none appearance-none pr-10 hover:border-gray-300 transition-colors duration-200 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
