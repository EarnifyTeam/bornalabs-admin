"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { 
  Mail, 
  Database, 
  ShieldCheck, 
  Save,
  Server,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";

export default function SettingsPage() {
  // SMTP settings
  const [smtpHost, setSmtpHost] = useState("smtp.sendgrid.net");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpEmail, setSmtpEmail] = useState("noreply@bornalabs.com");
  const [smtpName, setSmtpName] = useState("BornaLabs Support");
  const [smtpPass, setSmtpPass] = useState("api-key-sample");

  // Storage settings
  const [s3Bucket, setS3Bucket] = useState("bornalabs-release-assets");
  const [s3Region, setS3Region] = useState("us-east-1");
  const [s3AccessKey, setS3AccessKey] = useState("AKIAIOSFODNN7EXAMPLE");
  const [s3SecretKey, setS3SecretKey] = useState("secret-access-key-sample");

  // Security settings
  const [rateLimit, setRateLimit] = useState("15");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [rsaPrivateKey, setRsaPrivateKey] = useState("-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0G9s3wIDAQABAoIBAGYwW7y+9V8lK0P4J2V2...\n-----END RSA PRIVATE KEY-----");

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (response.ok && data.settings) {
        // Map database list to state
        data.settings.forEach((item: { key: string; value: string }) => {
          switch (item.key) {
            case "smtp_host": setSmtpHost(item.value); break;
            case "smtp_port": setSmtpPort(item.value); break;
            case "smtp_email": setSmtpEmail(item.value); break;
            case "smtp_name": setSmtpName(item.value); break;
            case "smtp_pass": setSmtpPass(item.value); break;
            case "s3_bucket": setS3Bucket(item.value); break;
            case "s3_region": setS3Region(item.value); break;
            case "s3_access_key": setS3AccessKey(item.value); break;
            case "s3_secret_key": setS3SecretKey(item.value); break;
            case "rate_limit": setRateLimit(item.value); break;
            case "maintenance_mode": setMaintenanceMode(item.value === "true"); break;
            case "rsa_private_key": setRsaPrivateKey(item.value); break;
          }
        });
      }
    } catch (err) {
      console.error("Error loading configurations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      settings: [
        { key: "smtp_host", value: smtpHost, category: "SMTP" },
        { key: "smtp_port", value: smtpPort, category: "SMTP" },
        { key: "smtp_email", value: smtpEmail, category: "SMTP" },
        { key: "smtp_name", value: smtpName, category: "SMTP" },
        { key: "smtp_pass", value: smtpPass, category: "SMTP" },
        { key: "s3_bucket", value: s3Bucket, category: "STORAGE" },
        { key: "s3_region", value: s3Region, category: "STORAGE" },
        { key: "s3_access_key", value: s3AccessKey, category: "STORAGE" },
        { key: "s3_secret_key", value: s3SecretKey, category: "STORAGE" },
        { key: "rate_limit", value: rateLimit, category: "SECURITY" },
        { key: "maintenance_mode", value: maintenanceMode ? "true" : "false", category: "SECURITY" },
        { key: "rsa_private_key", value: rsaPrivateKey, category: "SECURITY" }
      ]
    };

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("System configurations successfully saved to database!");
      } else {
        const data = await response.json();
        alert("Failed to save: " + data.error);
      }
    } catch (err) {
      alert("Network error saving configurations.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs relative">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">System Configuration</h2>
          <p className="text-xs text-muted">Adjust SMTP relays, security parameters, cloud binary storage links, and telemetry keys.</p>
        </div>
        <button 
          onClick={fetchSettings}
          className="flex items-center gap-2 text-xs font-bold text-white bg-surface border border-border px-4 py-2.5 rounded-sm hover:bg-surface/60 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />
          Reload
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading settings registry from database...</div>
      ) : (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Config Forms */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* SMTP Configurations */}
            <GlassCard hoverable={false} className="flex flex-col gap-4">
              <div className="border-b border-border pb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan" />
                <div>
                  <h3 className="font-bricolage font-bold text-sm text-white">SMTP Gateway Configuration</h3>
                  <p className="text-[10px] text-muted">Used for dynamic license delivery and password resets.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[10px] uppercase">SMTP Host</label>
                  <input 
                    type="text" 
                    value={smtpHost} 
                    onChange={(e) => setSmtpHost(e.target.value)} 
                    className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none focus:border-border-active transition-all" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[10px] uppercase">SMTP Port</label>
                  <input 
                    type="number" 
                    value={smtpPort} 
                    onChange={(e) => setSmtpPort(e.target.value)} 
                    className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none focus:border-border-active transition-all" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[10px] uppercase">Sender Email Address</label>
                  <input 
                    type="email" 
                    value={smtpEmail} 
                    onChange={(e) => setSmtpEmail(e.target.value)} 
                    className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none focus:border-border-active transition-all" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[10px] uppercase">Sender Display Name</label>
                  <input 
                    type="text" 
                    value={smtpName} 
                    onChange={(e) => setSmtpName(e.target.value)} 
                    className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none focus:border-border-active transition-all" 
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-muted font-bold text-[10px] uppercase">SMTP Password / API Key</label>
                  <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"} 
                      value={smtpPass} 
                      onChange={(e) => setSmtpPass(e.target.value)} 
                      className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none w-full pr-10 focus:border-border-active transition-all" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-2.5 text-muted hover:text-white"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Cloud Storage Configurations */}
            <GlassCard hoverable={false} className="flex flex-col gap-4">
              <div className="border-b border-border pb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-violet" />
                <div>
                  <h3 className="font-bricolage font-bold text-sm text-white">Binary Storage Bucket Settings</h3>
                  <p className="text-[10px] text-muted">Cloud storage credentials for uploading extensions ZIPs and desktop binaries.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[10px] uppercase">S3 / Supabase Storage Bucket</label>
                  <input 
                    type="text" 
                    value={s3Bucket} 
                    onChange={(e) => setS3Bucket(e.target.value)} 
                    className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none focus:border-border-active transition-all" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[10px] uppercase">Region</label>
                  <input 
                    type="text" 
                    value={s3Region} 
                    onChange={(e) => setS3Region(e.target.value)} 
                    className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none focus:border-border-active transition-all" 
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-muted font-bold text-[10px] uppercase">Access Key ID</label>
                  <input 
                    type="text" 
                    value={s3AccessKey} 
                    onChange={(e) => setS3AccessKey(e.target.value)} 
                    className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none focus:border-border-active transition-all font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-muted font-bold text-[10px] uppercase">Secret Access Key</label>
                  <div className="relative">
                    <input 
                      type={showSecret ? "text" : "password"} 
                      value={s3SecretKey} 
                      onChange={(e) => setS3SecretKey(e.target.value)} 
                      className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none w-full pr-10 focus:border-border-active transition-all font-mono" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-2.5 text-muted hover:text-white"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
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
                  <h3 className="font-bricolage font-bold text-sm text-white">Security & Rate Limiting</h3>
                  <p className="text-[10px] text-muted">Core verification parameters configuration.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Telemetry Rate Limiter */}
                <div className="flex flex-col gap-2">
                  <label className="text-muted font-bold text-[10px] uppercase">Telemetry Request Rate Limit</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={rateLimit} 
                      onChange={(e) => setRateLimit(e.target.value)} 
                      className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none w-20 focus:border-border-active transition-all" 
                    />
                    <span className="text-muted text-[11px]">Requests / Minute per IP</span>
                  </div>
                </div>

                {/* Maintenance Toggle */}
                <div className="flex items-center justify-between p-3 border border-border bg-surface2/10 rounded-sm">
                  <div className="flex flex-col gap-0.5 max-w-[160px]">
                    <span className="font-bold text-[10px] text-white uppercase tracking-wider flex items-center gap-1">
                      <Server className="w-3.5 h-3.5" />
                      Maintenance Mode
                    </span>
                    <span className="text-[9px] text-muted leading-tight">Deny license verification requests while upgrading databases.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-surface text-cyan focus:ring-0 cursor-pointer" 
                  />
                </div>

                {/* RSA Keys Vault */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-muted font-bold text-[10px] uppercase">Telemetry RSA Private Key</label>
                  <textarea 
                    rows={4} 
                    value={rsaPrivateKey}
                    onChange={(e) => setRsaPrivateKey(e.target.value)}
                    className="bg-surface2/40 border border-border rounded-sm p-2 text-[10px] font-mono text-muted focus:outline-none resize-none focus:border-border-active transition-all"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Action Trigger */}
            <button 
              type="submit" 
              disabled={saving}
              className="w-full text-center text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet py-3 rounded-sm shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Configurations..." : "Save System Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
