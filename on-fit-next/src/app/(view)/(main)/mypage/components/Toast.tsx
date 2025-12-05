"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

type Toast = { id: number; message: string; duration?: number };
type ToastContextValue = { show: (message: string, duration?: number) => void };

const ToastCtx = createContext<ToastContextValue | null>(null);
let seq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, duration = 2000) => {
    const id = ++seq;
    setToasts((prev) => [...prev, { id, message, duration }]);
    window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }, []);
    
    const dismiss = useCallback((id: number) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value = useMemo<ToastContextValue>(() => ({ show }), [show]);

    return (
      <ToastCtx.Provider value={value}>
        {children}
        <div className = "pointer-events-none fixed inset-x-0 bottom-6 z-100 flex justify-center px-4">
          <div className = "flex w-full max-w-md flex-col gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={clsx(
                  "pointer-events-auto",
                  "rounded-lg border border-border bg-popover/95 shadow-lg",
                  "px-4 py-3 text-sm text-foreground",
                  "flex items-center justify-between gap-3"
                )}
                role="status"
                aria-live="polite"
                >
                  <span>{t.message}</span>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-foreground/5"
                    aria-label="닫기"
                    >
                      <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
          </div>
        </div>
      </ToastCtx.Provider>
    );
  }
  
  export function useToast() {
    const ctx = useContext(ToastCtx);
    if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
    return ctx;
  }