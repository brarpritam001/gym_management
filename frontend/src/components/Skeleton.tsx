interface Props {
  className?: string;
}

function Line({ className = "h-4 w-full" }: Props) {
  return <div className={`skeleton ${className}`} />;
}

function Circle({ className = "w-10 h-10" }: Props) {
  return <div className={`skeleton rounded-full ${className}`} />;
}

function Card() {
  return (
    <div className="card-premium p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Circle className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Line className="h-4 w-2/3" />
          <Line className="h-3 w-1/3" />
        </div>
      </div>
      <Line className="h-3 w-full" />
      <Line className="h-3 w-4/5" />
    </div>
  );
}

function Table({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 px-5 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Line key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Line key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function Stats({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-5 space-y-3 skeleton h-28" />
      ))}
    </div>
  );
}

function List({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 skeleton h-16" />
      ))}
    </div>
  );
}

export const Skeleton = { Line, Circle, Card, Table, Stats, List };
