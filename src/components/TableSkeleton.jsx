import { Skeleton } from "./Skeleton";

export default function TableSkeleton({ rows = 10, template, rowHeight = 52 }) {
  return (
    <div>
      <div
        className="grid px-3 py-2 text-sm bg-eco-bg text-eco-mute border-b border-eco-border"
        style={{ gridTemplateColumns: template }}
      >
        {[...Array(template.split(" ").length)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>

      <div style={{ height: 520, width: "100%" }} className="overflow-x-hidden">
        {[...Array(rows)].map((_, r) => (
          <div
            key={r}
            className="grid items-center px-3 border-b border-eco-border"
            style={{ gridTemplateColumns: template, height: rowHeight }}
          >
            {[...Array(template.split(" ").length)].map((__, c) => (
              <Skeleton key={c} className="h-4 w-[70%]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
