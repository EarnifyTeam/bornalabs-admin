import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-bg2/45 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-cyan/10 border border-cyan/20 text-cyan px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider">
              Control Center
            </span>
            <span className="text-[10px] text-muted">• Production Mode</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted">System Time: {new Date().toLocaleDateString()}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-green pulse-green" title="Services fully operational"></div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
