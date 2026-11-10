import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon = SearchX, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center ${className ?? ""}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-main-text">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-secondary-text">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
