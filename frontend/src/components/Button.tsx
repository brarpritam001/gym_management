import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-colored-primary active:bg-primary-800 btn-shine",
  secondary:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-elevation-2",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md hover:shadow-red-600/20 active:bg-red-800 btn-shine",
  ghost:
    "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-base gap-2 rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 btn-press disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
