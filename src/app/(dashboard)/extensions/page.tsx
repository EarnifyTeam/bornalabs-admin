import { GlassCard } from "@/components/glass-card";
import { 
  Chrome, 
  Upload, 
  ArrowLeftRight, 
  FileArchive, 
  AlertTriangle,
  History,
  CheckCircle2,
  Undo2
} from "lucide-react";

export default function ExtensionsPage() {
  const versions = [
    { version: "v1.4.2", uploadedAt: "Yesterday, 14:15", browsers: ["Chrome", "Edge", "Brave"], size: "2.4 MB", type: "CRX", force: true },
    { version: "v1.4.1", uploadedAt: "1 week ago", browsers: ["Chrome", "Edge", "Brave", "Opera"], size: "2.3 MB", type: "ZIP", force: false },
    { version: "v1.4.0", uploadedAt: "3 weeks ago", browsers: ["Chrome", "Brave"], size: "2.1 MB", type: "CRX", force: false },
    { version: "v1.3.9", uploadedAt: "1 month ago", browsers: ["Chrome", "Edge", "Brave", "Opera"], size: "2.0 MB", type: "ZIP", force: false },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h2 className="font-bricolage font-bold text-2xl tracking-tight">Chrome Extension Manager</h2>
        <p className="text-xs text-muted">Upload and publish builds, trigger force updates, and rollback browser extension releases.</p>
      </div>

      {/* Main Grid: Upload Panel + Version History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form Panel */}
        <GlassCard hoverable={false} className="lg:col-span-1 flex flex-col gap-5">
          <div className="border-b border-border pb-3">
            <h3 className="font-bricolage font-bold text-sm">Upload New Build</h3>
            <p className="text-[10px] text-muted">Publish ZIP or CRX packages to extension stores.</p>
          </div>

          <form className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Select Extension</label>
              <select className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none">
                <option>SEO Panda Extractor</option>
                <option>PandaPrompt Helper</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Release Version</label>
              <input 
                type="text" 
                placeholder="e.g. 1.4.3" 
                className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none placeholder:text-muted/40"
              />
            </div>

            {/* Binary Drag and Drop Area */}
            <div className="border border-dashed border-border hover:border-border-active bg-surface2/10 rounded-sm p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
              <Upload className="w-6 h-6 text-muted" />
              <div className="flex flex-col items-center text-center">
                <span className="font-semibold text-[11px]">Click to upload binary file</span>
                <span className="text-[9px] text-muted">Supports .ZIP or .CRX packages (Max 15MB)</span>
              </div>
            </div>

            {/* Browsers Checklist */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Supported Browsers</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {["Chrome", "Edge", "Brave", "Opera"].map((browser, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-[11px] text-muted cursor-pointer hover:text-foreground">
                    <input type="checkbox" defaultChecked className="rounded border-border bg-surface text-cyan focus:ring-0" />
                    {browser}
                  </label>
                ))}
              </div>
            </div>

            {/* Force Update Trigger */}
            <div className="flex items-center justify-between p-3 border border-red/20 bg-red/5 rounded-sm">
              <div className="flex flex-col gap-0.5 max-w-[180px]">
                <span className="font-bold text-[10px] text-red uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Force Update
                </span>
                <span className="text-[9px] text-muted leading-tight">Force client extensions to download build immediately.</span>
              </div>
              <input type="checkbox" className="w-4 h-4 rounded border-red bg-surface text-red focus:ring-0 cursor-pointer" />
            </div>

            <button 
              type="button" 
              className="w-full text-center text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet py-2.5 rounded-sm shadow-md hover:opacity-90 transition-all mt-2"
              data-toast-msg="Extension release package upload sequence started."
            >
              Publish Release Build
            </button>
          </form>
        </GlassCard>

        {/* Versions History & Rollbacks */}
        <GlassCard hoverable={false} className="lg:col-span-2 flex flex-col gap-4">
          <div className="border-b border-border pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bricolage font-bold text-sm">Release Version History</h3>
              <p className="text-[10px] text-muted">Audit logs of all browser extension package publications.</p>
            </div>
            <span className="text-[9px] text-muted flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              Logs updated
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {versions.map((v, idx) => (
              <div key={idx} className="p-4 rounded-sm bg-surface2/20 border border-border flex justify-between items-start text-xs">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan text-[13px]">{v.version}</span>
                    <span className="text-[9px] text-muted">{v.uploadedAt}</span>
                    {idx === 0 && (
                      <span className="text-[8px] bg-green/10 border border-green/20 text-green font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        Active Release
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-muted text-[10px]">
                    <span className="flex items-center gap-1 font-semibold">
                      <FileArchive className="w-3.5 h-3.5" />
                      {v.type} • {v.size}
                    </span>
                    <span>•</span>
                    <span>Browsers: {v.browsers.join(", ")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {v.force && (
                    <span className="text-[8px] bg-red/10 border border-red/20 text-red font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      Force Trigger
                    </span>
                  )}
                  {idx > 0 && (
                    <button 
                      className="flex items-center gap-1.5 text-[10px] font-bold border border-border bg-surface2/30 px-3 py-1.5 rounded-sm text-muted hover:text-foreground hover:bg-surface/30 transition-all"
                      data-toast-msg={`Initiating version rollback sequence to ${v.version}.`}
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      Rollback
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
