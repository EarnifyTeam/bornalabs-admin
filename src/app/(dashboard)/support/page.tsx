"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  LifeBuoy, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  X,
  ChevronRight
} from "lucide-react";

interface SupportMessage {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  supportMessages?: SupportMessage[];
}

export default function CustomerSupportPage() {
  const toast = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Form State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/support");
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load support tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, priority }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Support ticket submitted successfully! Our engineers will review it shortly.");
        setIsModalOpen(false);
        setSubject("");
        setMessage("");
        fetchTickets();
      } else {
        toast.error(data.message || "Failed to submit support ticket.");
      }
    } catch (err) {
      toast.error("Error submitting support ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="warning">OPEN</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">IN PROGRESS</Badge>;
      case "RESOLVED":
        return <Badge variant="active">RESOLVED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Customer Support & Helpdesk</h2>
          <p className="text-xs text-muted">Create support tickets and communicate directly with BornaLabs technical engineers.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Support Ticket
        </Button>
      </div>

      {/* Main Grid: Ticket List & Conversation Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket List */}
        <GlassCard className="md:col-span-1 flex flex-col gap-4 p-4">
          <h3 className="font-bricolage font-bold text-sm text-white border-b border-border pb-3 flex items-center justify-between">
            <span>Your Tickets</span>
            <span className="text-xs text-muted font-mono">{tickets.length}</span>
          </h3>

          {loading ? (
            <div className="text-center py-12 text-muted">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-muted flex flex-col items-center gap-2">
              <LifeBuoy className="w-8 h-8 text-muted/50" />
              <span>No support tickets submitted yet.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-sm border text-left flex flex-col gap-1.5 transition-all ${
                    selectedTicket?.id === t.id
                      ? "bg-surface border-cyan/40 shadow-sm"
                      : "bg-surface2/30 border-border hover:border-border-active"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white line-clamp-1 text-xs">{t.subject}</span>
                    {getStatusBadge(t.status)}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted">
                    <span>Priority: {t.priority}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Conversation Viewer */}
        <GlassCard className="md:col-span-2 flex flex-col gap-4 p-6">
          {selectedTicket ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <div>
                  <h3 className="font-bricolage font-bold text-base text-white">{selectedTicket.subject}</h3>
                  <span className="text-[10px] text-muted font-mono">Ticket #{selectedTicket.id.slice(0, 8)}</span>
                </div>
                {getStatusBadge(selectedTicket.status)}
              </div>

              {/* Message Thread */}
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto my-2 p-2">
                {selectedTicket.supportMessages?.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-sm bg-surface2/40 border border-border flex flex-col gap-1 text-xs"
                  >
                    <div className="flex justify-between items-center text-[10px] text-muted">
                      <span className="font-bold text-cyan">Customer Request</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-muted flex flex-col items-center justify-center gap-2">
              <MessageSquare className="w-8 h-8 text-muted/40" />
              <span>Select a ticket from the left panel to view thread details.</span>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <GlassCard hoverable={false} className="w-full max-w-lg flex flex-col gap-6 p-6 border-cyan/20">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bricolage font-bold text-base text-white">Create Support Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="flex flex-col gap-4 text-xs">
              <Input
                label="Issue Subject *"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. PromptX License Activation Help"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground text-xs focus:outline-none w-full"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High Urgent</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Message Details *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or technical inquiry..."
                  className="bg-surface2/40 border border-border rounded-sm p-3 text-foreground text-xs focus:outline-none w-full"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
