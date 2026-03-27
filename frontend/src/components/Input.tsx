import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({ label, error, hint, className = "", ...props }: Props) {
  return (
    <div className="mb-3 sm:mb-4">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
          {label}
          {props.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 input-focus outline-none transition-colors duration-200 hover:border-gray-300 ${
          error ? "border-red-300 focus:border-red-400" : "border-gray-200"
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
