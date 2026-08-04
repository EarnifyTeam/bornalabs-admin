"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => triggerToast(msg, "success"), [triggerToast]);
  const error = useCallback((msg: string) => triggerToast(msg, "error"), [triggerToast]);
  const info = useCallback((msg: string) => triggerToast(msg, "info"), [triggerToast]);

  return (
    <ToastContext.Provider value={{ toast: triggerToast, success, error, info }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              className={cn(
                "pointer-events-auto rounded-lg border p-4 shadow-xl flex items-start gap-3 backdrop-blur-md transition-all duration-300",
                t.type === "success" && "bg-green/10 border-green/20 text-green",
                t.type === "error" && "bg-red/10 border-red/20 text-red",
                t.type === "info" && "bg-cyan/10 border-cyan/20 text-cyan"
              )}
            >
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {t.type === "info" && <Info className="w-5 h-5 flex-shrink-0" />}

              <div className="flex-1 text-xs font-semibold leading-tight pt-0.5">
                {t.message}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-muted hover:text-foreground transition-colors p-0.5 -mt-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
