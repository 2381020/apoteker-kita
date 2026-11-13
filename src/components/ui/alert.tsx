import * as React from "react";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "default" | "destructive" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const variantConfig: Record<AlertVariant, { classes: string; Icon: React.ElementType }> = {
  default: { classes: "border-border bg-surface text-main-text", Icon: Info },
  destructive: { classes: "border-destructive/30 bg-destructive/10 text-destructive", Icon: XCircle },
  success: { classes: "border-success/30 bg-success/10 text-[#166534]", Icon: CheckCircle2 },
  warning: { classes: "border-warning/30 bg-warning/10 text-[#92400E]", Icon: AlertTriangle },
  info: { classes: "border-primary/30 bg-primary-soft text-secondary", Icon: Info },
};

export function Alert({ variant = "default", title, description, className, children }: AlertProps) {
  const { classes, Icon } = variantConfig[variant];
  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      aria-live={variant === "destructive" ? "assertive" : "polite"}
      className={cn("flex items-start gap-3 rounded-xl border p-4", classes, className)}
    >
      {children ?? <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />}
      {(title || description) && (
        <div className="flex flex-col">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>
      )}
    </div>
  );
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="font-semibold">{children}</h5>;
}
export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm opacity-90">{children}</p>;
}
