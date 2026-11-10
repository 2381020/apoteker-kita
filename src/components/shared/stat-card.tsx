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
    <Card className={cn("p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft", className)}>
      <div className="flex items-center gap-4">
        <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl", accentMap[accent])}>
          <Icon className="h-6 w-6" />
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
