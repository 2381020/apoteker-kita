import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  accent?: "primary" | "secondary" | "success";
  className?: string;
}

const accentMap = {
  primary: "bg-primary-soft text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
};

export function StatCard({ title, value, icon: Icon, description, accent = "primary", className }: StatCardProps) {
  return (
    <Card className={cn("p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft sm:p-5", className)}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12", accentMap[accent])}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-secondary-text">{title}</p>
          <p className="text-xl font-bold text-main-text sm:text-2xl">{value}</p>
          {description && <p className="truncate text-xs text-secondary-text sm:text-sm">{description}</p>}
        </div>
      </div>
    </Card>
  );
}
