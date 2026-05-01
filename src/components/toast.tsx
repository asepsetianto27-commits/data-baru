"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, XCircleIcon } from "@/components/ui/icons";

type ToastVariant = "default" | "success" | "error";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (t: Omit<Toast, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const show = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-card backdrop-blur",
              t.variant === "success" && "border-emerald-200",
              t.variant === "error" && "border-rose-200",
              t.variant === "default" && "border-slate-200",
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                t.variant === "success" && "bg-emerald-100 text-emerald-700",
                t.variant === "error" && "bg-rose-100 text-rose-700",
                t.variant === "default" && "bg-slate-100 text-slate-700",
              )}
            >
              {t.variant === "error" ? (
                <XCircleIcon size={16} />
              ) : (
                <CheckCircleIcon size={16} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  {t.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
