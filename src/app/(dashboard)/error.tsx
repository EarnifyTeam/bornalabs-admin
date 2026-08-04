"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-12 flex justify-center">
      <GlassCard hoverable={false} className="w-full max-w-lg flex flex-col items-center gap-6 p-8 text-center border-red/20">
        <div className="w-10 h-10 rounded-lg bg-red/10 border border-red/20 flex items-center justify-center text-red">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div>
          <h3 className="font-bricolage font-bold text-lg text-white">Section View Error</h3>
          <p className="text-xs text-muted mt-1">
            Failed to render this section of the control center.
          </p>
        </div>

        <Button variant="danger" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={reset}>
          Reload Dashboard View
        </Button>
      </GlassCard>
    </div>
  );
}
