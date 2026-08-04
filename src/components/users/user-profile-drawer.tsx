"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, User as UserIcon, Mail, Phone, Globe, Clock, Shield, Key, Smartphone, Calendar, Package } from "lucide-react";

interface UserProfileDrawerProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileDrawer({ userId, isOpen, onClose }: UserProfileDrawerProps) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !isOpen) return;

    async function fetchUserProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        if (res.ok) {
          setUserData(data.user);
        }
      } catch (err) {
        console.error("Failed to load user profile details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-surface border-l border-border h-full flex flex-col shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan to-violet flex items-center justify-center font-bold text-white text-sm">
              {userData?.profile?.fullName?.slice(0, 2)?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col">
              <h2 className="font-bricolage font-bold text-base text-white">{userData?.profile?.fullName || "User Profile"}</h2>
              <span className="text-xs text-muted font-mono">{userData?.email}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-white hover:bg-surface2/50 rounded-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted">Loading user profile breakdown...</div>
        ) : userData ? (
          <div className="flex flex-col gap-6 pt-4 text-xs">
            {/* Quick Status Bar */}
            <div className="flex items-center justify-between p-3 bg-surface2/30 border border-border rounded-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted font-bold text-[10px] uppercase">Account Role:</span>
                <span className="font-bold text-cyan text-xs">{userData.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted font-bold text-[10px] uppercase">Status:</span>
                <Badge variant={userData.status === "ACTIVE" ? "active" : "danger"}>{userData.status}</Badge>
              </div>
            </div>

            {/* Personal Info */}
            <div className="flex flex-col gap-3 border-b border-border pb-4">
              <h3 className="font-bold text-cyan text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase">Phone</span>
                  <span className="text-foreground">{userData.profile?.phone || "Not set"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase">Country</span>
                  <span className="text-foreground">{userData.profile?.country || "Global"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase">Timezone</span>
                  <span className="text-foreground">{userData.profile?.timezone || "UTC"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase">Joined Date</span>
                  <span className="text-foreground">{new Date(userData.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Assigned Licenses & Products */}
            <div className="flex flex-col gap-3 border-b border-border pb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-cyan text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Assigned Products & Licenses ({userData.licenses?.length || 0})
                </h3>
              </div>

              {userData.licenses?.length === 0 ? (
                <div className="text-muted text-[11px] py-3 text-center">No license keys assigned to this customer yet.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {userData.licenses?.map((lic: any) => (
                    <div key={lic.id} className="p-3 bg-surface2/40 border border-border rounded-sm flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{lic.product?.name || "Product"}</span>
                        <Badge variant={lic.status === "ACTIVE" ? "active" : "danger"}>{lic.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center font-mono text-[10px]">
                        <span className="text-cyan font-bold">{lic.licenseKey}</span>
                        <span className="text-muted">Limit: {lic.devices?.length || 0} / {lic.deviceLimit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Notes */}
            {userData.notes && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-muted uppercase">Admin Internal Notes</span>
                <p className="p-3 bg-surface2/30 border border-border rounded-sm text-muted text-xs">{userData.notes}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
