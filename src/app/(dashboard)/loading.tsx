import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-8 w-36" />
      </div>

      {/* Metrics skeleton grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i} hoverable={false} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </GlassCard>
        ))}
      </div>

      {/* Main details skeleton grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard hoverable={false} className="lg:col-span-2 flex flex-col gap-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full" />
            ))}
          </div>
        </GlassCard>

        <GlassCard hoverable={false} className="flex flex-col gap-4">
          <Skeleton className="h-6 w-36" />
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full" />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
