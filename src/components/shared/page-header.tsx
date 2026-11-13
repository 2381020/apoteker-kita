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
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary sm:h-11 sm:w-11">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-main-text sm:text-2xl lg:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-secondary-text sm:text-base">{description}</p>}
        </div>
      </div>
      {children && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">{children}</div>}
    </div>
  );
}
