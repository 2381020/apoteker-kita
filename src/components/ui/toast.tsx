import * as React from "react";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive" | "success" | "warning";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toasts: ToastItem[];
  add: (o: { title: string; description?: string; variant?: ToastVariant }) => void;
  remove: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType>({ toasts: [], add: () => {}, remove: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const add = React.useCallback((o: { title: string; description?: string; variant?: ToastVariant }) => {
    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, variant: o.variant ?? "default", ...o }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const remove = React.useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
      <div className="pointer-events-none fixed left-4 right-4 top-4 z-[70] flex flex-col items-stretch gap-2 sm:left-auto sm:right-4 sm:items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const icons = { default: <AlertTriangle className="h-4 w-4" />, destructive: <AlertTriangle className="h-4 w-4" />, success: <CheckCircle className="h-4 w-4" />, warning: <AlertTriangle className="h-4 w-4" /> };
  const color = { default: "bg-surface text-main-text border-border", destructive: "bg-destructive text-destructive-foreground border-destructive", success: "bg-success text-white border-success", warning: "bg-warning text-white border-warning" };
  return (
    <div className={cn("pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right duration-200", color[toast.variant])}>
      <span className="mt-0.5 shrink-0">{icons[toast.variant]}</span>
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium">{toast.title}</p>
        {toast.description && <p className="mt-0.5 break-words text-xs opacity-90">{toast.description}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-50 hover:opacity-100" aria-label="Tutup notifikasi">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  return { add: ctx.add, remove: ctx.remove };
}
