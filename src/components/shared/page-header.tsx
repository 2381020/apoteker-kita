import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, className, children }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="hidden sm:flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-main-text sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-secondary-text sm:text-base">{description}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
