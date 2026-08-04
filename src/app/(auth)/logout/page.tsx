"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut();
      router.push("/login");
      router.refresh();
    };

    handleLogout();
  }, [router, signOut]);

  return (
    <div className="min-h-screen bg-bg text-foreground flex items-center justify-center text-xs text-muted">
      Ending Supabase Auth Session...
    </div>
  );
}
