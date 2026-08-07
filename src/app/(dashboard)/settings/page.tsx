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
  Sliders,
  CreditCard,
  QrCode
} from "lucide-react";

export default function SettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "smtp" | "telemetry" | "payment">("general");
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

    // Extension & Branding
    developer_name: "BornaLabs",
    default_trial_prompts: "1000",
    whatsapp_link: "https://wa.me/919876543210",
    instagram_link: "https://instagram.com/bornalabs",
    facebook_link: "https://facebook.com/bornalabs",

    // Payment Methods
    enable_manual_upi_payment: "true",
    enable_online_payment: "false",
    upi_id: "bornalabs@upi",
    upi_qr_url: "",
    bank_name: "HDFC Bank",
    bank_account_number: "50100012345678",
    bank_ifsc: "HDFC0001234",
    whatsapp_payment_number: "+919876543210",
    stripe_publishable_key: "",
    stripe_secret_key: "",
    razorpay_key_id: "",
    razorpay_key_secret: "",

    // Live Header Announcement Bar Ticker Settings
    enable_announcement: "false",
    announcement_title: "Special Offer",
    announcement_message: "Welcome to BornaLabs! Check out our new 7-Day Free Trial and Lifetime License deals.",
    announcement_link: "/products",
  });

  // Secret Activation Code Generator State for Admin
  const [adminGeneratedCode, setAdminGeneratedCode] = useState<string | null>(null);
  const [customerEmailForCode, setCustomerEmailForCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  const handleGenerateActivationCode = () => {
    const code = `BL-ACTV-${Math.floor(100000 + Math.random() * 900000)}`;
    setAdminGeneratedCode(code);
    setCodeCopied(false);
  };

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

        // Extension & Branding
        { key: "developer_name", value: settings.developer_name, category: "extension" },
        { key: "default_trial_prompts", value: settings.default_trial_prompts, category: "extension" },
        { key: "whatsapp_link", value: settings.whatsapp_link, category: "extension" },
        { key: "instagram_link", value: settings.instagram_link, category: "extension" },
        { key: "facebook_link", value: settings.facebook_link, category: "extension" },

        // Payment Methods
        { key: "enable_manual_upi_payment", value: settings.enable_manual_upi_payment, category: "payment" },
        { key: "enable_online_payment", value: settings.enable_online_payment, category: "payment" },
        { key: "upi_id", value: settings.upi_id, category: "payment" },
        { key: "upi_qr_url", value: settings.upi_qr_url, category: "payment" },
        { key: "bank_name", value: settings.bank_name, category: "payment" },
        { key: "bank_account_number", value: settings.bank_account_number, category: "payment" },
        { key: "bank_ifsc", value: settings.bank_ifsc, category: "payment" },
        { key: "whatsapp_payment_number", value: settings.whatsapp_payment_number, category: "payment" },
        { key: "stripe_publishable_key", value: settings.stripe_publishable_key, category: "payment" },
        { key: "stripe_secret_key", value: settings.stripe_secret_key, category: "payment" },
        { key: "razorpay_key_id", value: settings.razorpay_key_id, category: "payment" },
        { key: "razorpay_key_secret", value: settings.razorpay_key_secret, category: "payment" },
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
            { id: "payment", label: "Payments & UPI", icon: CreditCard },
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

            {/* PAYMENTS & UPI TAB */}
            {activeTab === "payment" && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bricolage font-bold text-sm text-white">Payment Gateways & Manual UPI Settings</h3>
                    <p className="text-[10px] text-muted">Toggle payment methods, update UPI QR Code, Bank details, WhatsApp number & Online Gateways.</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={settings.enable_manual_upi_payment === "true" ? "active" : "neutral"}>
                      Manual UPI: {settings.enable_manual_upi_payment === "true" ? "ACTIVE" : "OFF"}
                    </Badge>
                    <Badge variant={settings.enable_online_payment === "true" ? "active" : "neutral"}>
                      Online Gateways: {settings.enable_online_payment === "true" ? "ACTIVE" : "OFF"}
                    </Badge>
                  </div>
                </div>

                {/* Toggle Switches */}
                <div className="grid grid-cols-2 gap-6 p-4 rounded-md bg-surface2/30 border border-border">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enable_manual_upi_payment"
                      checked={settings.enable_manual_upi_payment === "true"}
                      onChange={(e) => handleChange("enable_manual_upi_payment", e.target.checked ? "true" : "false")}
                      className="accent-cyan w-5 h-5 rounded cursor-pointer"
                    />
                    <div>
                      <label htmlFor="enable_manual_upi_payment" className="text-xs font-bold text-white cursor-pointer">
                        Enable Manual UPI / QR Code / Bank / WhatsApp Payment
                      </label>
                      <p className="text-[10px] text-muted">Allows customers to submit payment screenshots, UTR / TxID, or contact WhatsApp.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enable_online_payment"
                      checked={settings.enable_online_payment === "true"}
                      onChange={(e) => handleChange("enable_online_payment", e.target.checked ? "true" : "false")}
                      className="accent-violet w-5 h-5 rounded cursor-pointer"
                    />
                    <div>
                      <label htmlFor="enable_online_payment" className="text-xs font-bold text-white cursor-pointer">
                        Enable Automated Online Payment Gateways (Stripe / Razorpay)
                      </label>
                      <p className="text-[10px] text-muted">Enables 1-click automatic instant checkout via Stripe or Razorpay.</p>
                    </div>
                  </div>
                </div>

                {/* Secret Activation Code Generator Box for Manual Payments */}
                <div className="p-4 rounded-md bg-surface2/60 border border-cyan/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-cyan font-mono flex items-center gap-1.5">
                        <span>🔑</span> Admin Manual Payment Activation Code Generator
                      </h5>
                      <p className="text-[11px] text-muted">
                        Generate a Secret Activation Code to give to customers after verifying their UPI/Bank payment screenshot.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateActivationCode}
                      className="border-cyan text-cyan hover:bg-cyan/20 text-xs font-bold shrink-0"
                    >
                      Generate New Secret Code
                    </Button>
                  </div>

                  {adminGeneratedCode && (
                    <div className="p-3 rounded bg-bg/80 border border-border flex items-center justify-between gap-4 font-mono">
                      <div>
                        <span className="text-[10px] text-muted block uppercase">Secret Activation Code for Customer</span>
                        <span className="text-sm font-extrabold text-cyan">{adminGeneratedCode}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(adminGeneratedCode);
                            setCodeCopied(true);
                            setTimeout(() => setCodeCopied(false), 2000);
                          }}
                          className="px-3 py-1.5 rounded bg-surface2 text-xs font-bold text-white hover:bg-cyan hover:text-black transition-colors"
                        >
                          {codeCopied ? "✓ Copied" : "Copy Code"}
                        </button>

                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Hello! Your Manual Payment has been verified. Here is your Secret Activation Code: ${adminGeneratedCode}. Go to your Customer Dashboard (My Licenses) and click "Activate Product with Code" to unlock your software.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                        >
                          Send via WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Header Announcement Bar Ticker Box */}
                <div className="p-4 rounded-md bg-surface2/60 border border-violet/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-violet font-mono flex items-center gap-1.5">
                        <span>📢</span> Live Top Header Running Announcement Ticker
                      </h5>
                      <p className="text-[11px] text-muted">
                        Publish an auto-running scrolling ticker message on the live website top header bar.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enable_announcement_toggle"
                        checked={settings.enable_announcement === "true"}
                        onChange={(e) => handleChange("enable_announcement", e.target.checked ? "true" : "false")}
                        className="accent-violet w-5 h-5 rounded cursor-pointer"
                      />
                      <label htmlFor="enable_announcement_toggle" className="text-xs font-bold text-white cursor-pointer">
                        Enable Running Ticker Bar
                      </label>
                    </div>
                  </div>

                  {settings.enable_announcement === "true" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/60">
                      <Input
                        label="Announcement Title (e.g. Special Offer / New Release)"
                        value={settings.announcement_title || ""}
                        onChange={(e) => handleChange("announcement_title", e.target.value)}
                        placeholder="Title..."
                      />
                      <Input
                        label="Announcement Message (Auto-scrolling Text)"
                        value={settings.announcement_message || ""}
                        onChange={(e) => handleChange("announcement_message", e.target.value)}
                        placeholder="Full running message..."
                      />
                      <Input
                        label="Target Link (Optional URL / Page)"
                        value={settings.announcement_link || ""}
                        onChange={(e) => handleChange("announcement_link", e.target.value)}
                        placeholder="e.g. /products or /checkout"
                      />
                    </div>
                  )}
                </div>

                {/* Extension Developer & Social Media Links */}
                <div className="flex flex-col gap-4 pt-2">
                  <h4 className="font-bold text-xs text-cyan uppercase tracking-wider">1. Extension Developer & Social Media Links (Live Chrome Extension Sync)</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Developer Name (Displayed in Extension)"
                      value={settings.developer_name || ""}
                      onChange={(e) => handleChange("developer_name", e.target.value)}
                      placeholder="e.g. BornaLabs (or Earnify Labs)"
                    />

                    <Input
                      label="Default Trial Prompt Credit Quota"
                      type="number"
                      value={settings.default_trial_prompts || "1000"}
                      onChange={(e) => handleChange("default_trial_prompts", e.target.value)}
                      placeholder="e.g. 50, 100, 500, or 1000"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="WhatsApp Button Link"
                      value={settings.whatsapp_link || ""}
                      onChange={(e) => handleChange("whatsapp_link", e.target.value)}
                      placeholder="e.g. https://wa.me/919876543210"
                    />

                    <Input
                      label="Instagram Button Link"
                      value={settings.instagram_link || ""}
                      onChange={(e) => handleChange("instagram_link", e.target.value)}
                      placeholder="e.g. https://instagram.com/bornalabs"
                    />

                    <Input
                      label="Facebook Button Link"
                      value={settings.facebook_link || ""}
                      onChange={(e) => handleChange("facebook_link", e.target.value)}
                      placeholder="e.g. https://facebook.com/bornalabs"
                    />
                  </div>
                </div>

                {/* Manual UPI & Bank Details Section */}
                <div className="flex flex-col gap-4 pt-2 border-t border-border">
                  <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider">2. Manual Payment Configuration (UPI / Bank / WhatsApp)</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="UPI ID / VPA Address"
                      value={settings.upi_id || ""}
                      onChange={(e) => handleChange("upi_id", e.target.value)}
                      placeholder="e.g. bornalabs@upi"
                    />

                    <Input
                      label="WhatsApp Contact Number (for Payment Verification)"
                      value={settings.whatsapp_payment_number || ""}
                      onChange={(e) => handleChange("whatsapp_payment_number", e.target.value)}
                      placeholder="e.g. +919876543210"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <Input
                      label="Bank Name"
                      value={settings.bank_name || ""}
                      onChange={(e) => handleChange("bank_name", e.target.value)}
                      placeholder="e.g. HDFC Bank"
                    />

                    <Input
                      label="Bank Account Number"
                      value={settings.bank_account_number || ""}
                      onChange={(e) => handleChange("bank_account_number", e.target.value)}
                      placeholder="e.g. 50100012345678"
                    />

                    <Input
                      label="Bank IFSC Code"
                      value={settings.bank_ifsc || ""}
                      onChange={(e) => handleChange("bank_ifsc", e.target.value)}
                      placeholder="e.g. HDFC0001234"
                    />
                  </div>

                  <Input
                    label="UPI QR Code Image URL"
                    value={settings.upi_qr_url || ""}
                    onChange={(e) => handleChange("upi_qr_url", e.target.value)}
                    placeholder="https://yourdomain.com/qr-code.png or Google Drive / Cloudinary image link"
                  />
                </div>

                {/* Online Payment Gateways API Keys Section */}
                <div className="flex flex-col gap-4 pt-4 border-t border-border">
                  <h4 className="font-bold text-xs text-violet uppercase tracking-wider">2. Online Payment Gateway API Credentials</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Stripe Publishable Key"
                      value={settings.stripe_publishable_key || ""}
                      onChange={(e) => handleChange("stripe_publishable_key", e.target.value)}
                      placeholder="pk_live_..."
                    />

                    <Input
                      label="Stripe Secret Key"
                      type="password"
                      value={settings.stripe_secret_key || ""}
                      onChange={(e) => handleChange("stripe_secret_key", e.target.value)}
                      placeholder="sk_live_..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Razorpay Key ID"
                      value={settings.razorpay_key_id || ""}
                      onChange={(e) => handleChange("razorpay_key_id", e.target.value)}
                      placeholder="rzp_live_..."
                    />

                    <Input
                      label="Razorpay Key Secret"
                      type="password"
                      value={settings.razorpay_key_secret || ""}
                      onChange={(e) => handleChange("razorpay_key_secret", e.target.value)}
                      placeholder="Secret Key..."
                    />
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
