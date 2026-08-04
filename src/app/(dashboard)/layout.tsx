import React from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Check server-side Supabase authentication if credentials configured
  if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  }

  return (
    <div className="min-h-screen bg-bg text-foreground relative flex">
      {/* Background aurora blurs */}
      <div className="fixed -top-[250px] -left-[200px] w-[500px] h-[500px] rounded-full bg-cyan/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-[250px] -right-[200px] w-[500px] h-[500px] rounded-full bg-violet/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20 pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 pl-64 relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
