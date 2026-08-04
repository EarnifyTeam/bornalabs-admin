import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg text-foreground relative flex items-center justify-center p-4">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-violet/5 blur-[100px] pointer-events-none" />

      <GlassCard hoverable={false} className="w-full max-w-md flex flex-col items-center gap-6 p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan shadow-lg shadow-cyan/10">
          <FileQuestion className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] font-mono text-cyan font-bold uppercase tracking-wider">Error 404</span>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white mt-1">Page Not Found</h2>
          <p className="text-xs text-muted mt-2">
            The requested control center page or telemetry endpoint does not exist or has been relocated.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
            Return to Executive Overview
          </Button>
        </Link>
      </GlassCard>
    </div>
  );
}
