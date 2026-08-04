import { GlassCard } from "@/components/glass-card";
import { 
  Settings, 
  Mail, 
  Key, 
  Database, 
  ShieldCheck, 
  Sliders, 
  EyeOff, 
  Save,
  Server
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h2 className="font-bricolage font-bold text-2xl tracking-tight">System Configuration</h2>
        <p className="text-xs text-muted">Adjust SMTP relays, security parameters, cloud binary storage links, and telemetry keys.</p>
      </div>

      {/* Main Settings Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Config Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* SMTP Configurations */}
          <GlassCard hoverable={false} className="flex flex-col gap-4">
            <div className="border-b border-border pb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan" />
              <div>
                <h3 className="font-bricolage font-bold text-sm">SMTP Gateway Configuration</h3>
                <p className="text-[10px] text-muted">Used for dynamic license delivery and password resets.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">SMTP Host</label>
                <input type="text" defaultValue="smtp.sendgrid.net" className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">SMTP Port</label>
                <input type="number" defaultValue={587} className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Sender Email Address</label>
                <input type="email" defaultValue="noreply@bornalabs.com" className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Sender Display Name</label>
                <input type="text" defaultValue="BornaLabs Support" className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-muted font-bold text-[10px] uppercase">SMTP Password / API Key</label>
                <div className="relative">
                  <input type="password" value="••••••••••••••••••••••••••••" className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none w-full pr-10" readOnly />
                  <EyeOff className="w-4 h-4 text-muted absolute right-3 top-2.5 cursor-pointer hover:text-foreground" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Cloud Storage Configurations */}
          <GlassCard hoverable={false} className="flex flex-col gap-4">
            <div className="border-b border-border pb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-violet" />
              <div>
                <h3 className="font-bricolage font-bold text-sm">Binary Storage Bucket Settings</h3>
                <p className="text-[10px] text-muted">Cloud storage credentials for uploading extensions ZIPs and desktop binaries.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">S3 / Supabase Storage Bucket</label>
                <input type="text" defaultValue="bornalabs-release-assets" className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Region</label>
                <input type="text" defaultValue="us-east-1" className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-muted font-bold text-[10px] uppercase">Access Key ID</label>
                <input type="text" defaultValue="AKIAIOSFODNN7EXAMPLE" className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-muted font-bold text-[10px] uppercase">Secret Access Key</label>
                <div className="relative">
                  <input type="password" value="••••••••••••••••••••••••••••••••••••" className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none w-full pr-10" readOnly />
                  <EyeOff className="w-4 h-4 text-muted absolute right-3 top-2.5 cursor-pointer hover:text-foreground" />
                </div>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right Column: Security Configurations */}
        <div className="flex flex-col gap-6">
          
          {/* Security Rules */}
          <GlassCard hoverable={false} className="flex flex-col gap-4">
            <div className="border-b border-border pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <div>
                <h3 className="font-bricolage font-bold text-sm">Security & Rate Limiting</h3>
                <p className="text-[10px] text-muted">Core verification parameters configuration.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              {/* Telemetry Rate Limiter */}
              <div className="flex flex-col gap-2">
                <label className="text-muted font-bold text-[10px] uppercase">Telemetry Request Rate Limit</label>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={15} className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none w-20" />
                  <span className="text-muted text-[11px]">Requests / Minute per IP</span>
                </div>
              </div>

              {/* Maintenance Toggle */}
              <div className="flex items-center justify-between p-3 border border-border bg-surface2/10 rounded-sm">
                <div className="flex flex-col gap-0.5 max-w-[160px]">
                  <span className="font-bold text-[10px] text-foreground uppercase tracking-wider flex items-center gap-1">
                    <Server className="w-3.5 h-3.5" />
                    Maintenance Mode
                  </span>
                  <span className="text-[9px] text-muted leading-tight">Deny license verification requests while upgrading databases.</span>
                </div>
                <input type="checkbox" className="w-4 h-4 rounded border-border bg-surface text-cyan focus:ring-0 cursor-pointer animate-pulse" />
              </div>

              {/* RSA Keys Vault */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-muted font-bold text-[10px] uppercase">Telemetry RSA Private Key</label>
                <textarea 
                  rows={4} 
                  readOnly 
                  className="bg-surface2/40 border border-border rounded-sm p-2 text-[10px] font-mono text-muted focus:outline-none resize-none"
                  value="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0G9s3wIDAQABAoIBAGYwW7y+9V8lK0P4J2V2...\n-----END RSA PRIVATE KEY-----"
                />
              </div>
            </div>
          </GlassCard>

          {/* Action Trigger */}
          <button 
            type="button" 
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet py-3 rounded-sm shadow-md hover:opacity-90 transition-all"
            data-toast-msg="System parameters updated successfully."
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>

        </div>

      </div>
    </div>
  );
}
