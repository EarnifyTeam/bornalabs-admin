"use client";

import React, { useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global System Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg text-foreground relative flex items-center justify-center p-4">
      <GlassCard hoverable={false} className="w-full max-w-md flex flex-col items-center gap-6 p-8 text-center border-red/30">
        <div className="w-12 h-12 rounded-xl bg-red/10 border border-red/20 flex items-center justify-center text-red">
          <AlertOctagon className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] font-mono text-red font-bold uppercase tracking-wider">System Failure</span>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white mt-1">Application Exception</h2>
          <p className="text-xs text-muted mt-2">
            An unexpected error occurred in the control center runtime environment.
          </p>
        </div>

        <Button variant="danger" icon={<RefreshCw className="w-4 h-4" />} onClick={reset}>
          Try Again
        </Button>
      </GlassCard>
    </div>
  );
}
