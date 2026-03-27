import { ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  mobileRender?: (item: T) => React.ReactNode;
}

export default function Table<T extends { id: number }>({
  columns,
  data,
  onRowClick,
  mobileRender,
}: Props<T>) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3.5 bg-surface-50/50 first:rounded-tl-lg last:rounded-tr-lg sticky top-0"
                >
                  {col.label}
                </th>
              ))}
              {onRowClick && <th className="w-10 bg-surface-50/50 sticky top-0" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/80">
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (onRowClick ? 1 : 0)}
                  className="py-16 text-center text-gray-400 text-sm"
                >
                  No data found
                </td>
              </tr>
            )}
            {data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`table-row-hover ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
                {onRowClick && (
                  <td className="px-3 py-3.5">
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100/80">
        {data.length === 0 && (
          <div className="py-10 text-center text-gray-400 text-xs">No data found</div>
        )}
        {data.map((item) =>
          mobileRender ? (
            <div
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`touch-card px-3 py-2.5 ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {mobileRender(item)}
            </div>
          ) : (
            <div
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`touch-card px-3 py-2.5 space-y-1.5 ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.filter((c) => !c.hideOnMobile).map((col) => (
                <div key={col.key} className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-400 text-[11px] font-medium">{col.label}</span>
                  <span className="text-gray-700 font-medium">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}
