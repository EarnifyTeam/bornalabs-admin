"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Mail, 
  Activity, 
  Save, 
  RefreshCw,
  Lock,
  Globe,
  Sliders
} from "lucide-react";

export default function SettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "smtp" | "telemetry">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State Form Values
  const [settings, setSettings] = useState<Record<string, string>>({
    // General
    site_title: "BornaLabs Control Center",
    admin_email: "admin@bornalabs.com",
    maintenance_mode: "false",
    default_license_days: "30",

    // Security
    session_timeout_minutes: "60",
    max_login_attempts: "5",
    enforce_ssl: "true",

    // SMTP Email
    smtp_host: "smtp.sendgrid.net",
    smtp_port: "587",
    smtp_user: "apikey",
    smtp_from_email: "noreply@bornalabs.com",
    smtp_from_name: "BornaLabs Control Center",

    // Telemetry
    heartbeat_interval_minutes: "15",
    enforce_hw_binding: "true",
    auto_expire_trials: "true",
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (res.ok && data.settingsMap) {
        setSettings((prev) => ({
          ...prev,
          ...data.settingsMap,
        }));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Map dictionary into settings array with categories
      const settingsPayload = [
        // General
        { key: "site_title", value: settings.site_title, category: "general" },
        { key: "admin_email", value: settings.admin_email, category: "general" },
        { key: "maintenance_mode", value: settings.maintenance_mode, category: "general" },
        { key: "default_license_days", value: settings.default_license_days, category: "general" },

        // Security
        { key: "session_timeout_minutes", value: settings.session_timeout_minutes, category: "security" },
        { key: "max_login_attempts", value: settings.max_login_attempts, category: "security" },
        { key: "enforce_ssl", value: settings.enforce_ssl, category: "security" },

        // SMTP Email
        { key: "smtp_host", value: settings.smtp_host, category: "email" },
        { key: "smtp_port", value: settings.smtp_port, category: "email" },
        { key: "smtp_user", value: settings.smtp_user, category: "email" },
        { key: "smtp_from_email", value: settings.smtp_from_email, category: "email" },
        { key: "smtp_from_name", value: settings.smtp_from_name, category: "email" },

        // Telemetry
        { key: "heartbeat_interval_minutes", value: settings.heartbeat_interval_minutes, category: "telemetry" },
        { key: "enforce_hw_binding", value: settings.enforce_hw_binding, category: "telemetry" },
        { key: "auto_expire_trials", value: settings.auto_expire_trials, category: "telemetry" },
      ];

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsPayload }),
      });

      if (res.ok) {
        toast.success("System settings updated & saved in database!");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (err) {
      toast.error("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">System Settings</h2>
          <p className="text-xs text-muted">Global control center properties, security parameters, and SMTP gateway settings in Supabase DB.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />}
            onClick={fetchSettings}
          >
            Reload
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={saving}
            icon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSaveSettings}
          >
            {saving ? "Saving Changes..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <GlassCard hoverable={false} className="py-3 px-6 flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: "general", label: "General", icon: Globe },
            { id: "security", label: "Security", icon: Lock },
            { id: "smtp", label: "SMTP Email", icon: Mail },
            { id: "telemetry", label: "Telemetry", icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-xs transition-all ${
                  isActive
                    ? "bg-surface border border-border-active text-cyan shadow-sm"
                    : "bg-surface2/20 border border-border text-muted hover:text-foreground"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan" : "text-muted"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <Badge variant="active">Supabase Persisted</Badge>
      </GlassCard>

      {/* Settings Form Sections */}
      <GlassCard className="flex flex-col gap-6 p-6">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading system parameters...</div>
        ) : (
          <>
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bricolage font-bold text-sm text-white">General Platform Settings</h3>
                  <p className="text-[10px] text-muted">Core branding and default license validity parameters.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Control Center Title"
                    value={settings.site_title || ""}
                    onChange={(e) => handleChange("site_title", e.target.value)}
                  />

                  <Input
                    label="Administrator Contact Email"
                    type="email"
                    value={settings.admin_email || ""}
                    onChange={(e) => handleChange("admin_email", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Default License Validity (Days)"
                    type="number"
                    value={settings.default_license_days || "30"}
                    onChange={(e) => handleChange("default_license_days", e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted font-bold text-[10px] uppercase">Maintenance Mode State</label>
                    <select
                      value={settings.maintenance_mode || "false"}
                      onChange={(e) => handleChange("maintenance_mode", e.target.value)}
                      className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
                    >
                      <option value="false">Disabled (Normal Operations)</option>
                      <option value="true">Enabled (Maintenance Lock)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bricolage font-bold text-sm text-white">Security & Authentication Parameters</h3>
                  <p className="text-[10px] text-muted">Session inactivity timeouts and login attempt locks.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Session Inactivity Timeout (Minutes)"
                    type="number"
                    value={settings.session_timeout_minutes || "60"}
                    onChange={(e) => handleChange("session_timeout_minutes", e.target.value)}
                  />

                  <Input
                    label="Max Failed Login Attempts Before Lockout"
                    type="number"
                    value={settings.max_login_attempts || "5"}
                    onChange={(e) => handleChange("max_login_attempts", e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="enforce_ssl"
                    checked={settings.enforce_ssl === "true"}
                    onChange={(e) => handleChange("enforce_ssl", e.target.checked ? "true" : "false")}
                    className="accent-cyan w-4 h-4 rounded-sm border-border cursor-pointer"
                  />
                  <label htmlFor="enforce_ssl" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-green" />
                    Enforce HTTPS / SSL Encrypted Client Handshakes
                  </label>
                </div>
              </div>
            )}

            {/* SMTP TAB */}
            {activeTab === "smtp" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bricolage font-bold text-sm text-white">SMTP Email Gateway Configuration</h3>
                  <p className="text-[10px] text-muted">Mail server parameters for password resets and notification dispatch.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="SMTP Hostname"
                    value={settings.smtp_host || ""}
                    onChange={(e) => handleChange("smtp_host", e.target.value)}
                    placeholder="smtp.sendgrid.net"
                  />

                  <Input
                    label="SMTP Port"
                    type="number"
                    value={settings.smtp_port || "587"}
                    onChange={(e) => handleChange("smtp_port", e.target.value)}
                    placeholder="587"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Sender Display Name"
                    value={settings.smtp_from_name || ""}
                    onChange={(e) => handleChange("smtp_from_name", e.target.value)}
                    placeholder="BornaLabs Control Center"
                  />

                  <Input
                    label="Sender From Email"
                    type="email"
                    value={settings.smtp_from_email || ""}
                    onChange={(e) => handleChange("smtp_from_email", e.target.value)}
                    placeholder="noreply@bornalabs.com"
                  />
                </div>
              </div>
            )}

            {/* TELEMETRY TAB */}
            {activeTab === "telemetry" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bricolage font-bold text-sm text-white">Client Telemetry & Validation Rules</h3>
                  <p className="text-[10px] text-muted">Client software check-in interval and hardware fingerprint binding.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Client Heartbeat Validation Interval (Minutes)"
                    type="number"
                    value={settings.heartbeat_interval_minutes || "15"}
                    onChange={(e) => handleChange("heartbeat_interval_minutes", e.target.value)}
                  />

                  <div className="flex flex-col gap-3 justify-center">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enforce_hw_binding"
                        checked={settings.enforce_hw_binding === "true"}
                        onChange={(e) => handleChange("enforce_hw_binding", e.target.checked ? "true" : "false")}
                        className="accent-violet w-4 h-4 rounded-sm border-border cursor-pointer"
                      />
                      <label htmlFor="enforce_hw_binding" className="text-xs font-semibold text-foreground cursor-pointer">
                        Strict Hardware Fingerprint Binding
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto_expire_trials"
                        checked={settings.auto_expire_trials === "true"}
                        onChange={(e) => handleChange("auto_expire_trials", e.target.checked ? "true" : "false")}
                        className="accent-gold w-4 h-4 rounded-sm border-border cursor-pointer"
                      />
                      <label htmlFor="auto_expire_trials" className="text-xs font-semibold text-foreground cursor-pointer">
                        Auto-Expire Trial Keys Upon Capacity Limit
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
}
