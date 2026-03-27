import type { ReactNode } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  action?: ReactNode;
}

export default function Card({
  title,
  subtitle,
  children,
  className = "",
  noPadding,
  action,
}: Props) {
  return (
    <div className={`card-premium ${className}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between ${noPadding ? "px-6 pt-6" : "mb-1"}`}>
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}
