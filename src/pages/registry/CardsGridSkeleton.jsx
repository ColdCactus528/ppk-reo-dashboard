import { Skeleton } from "../../components/Skeleton";

export default function CardsGridSkeleton({ count = 12 }) {
  return (
    <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="border border-eco-border rounded-xl p-4 bg-white">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-28 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
