import * as React from "react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface DropdownMenuItem { label: React.ReactNode; onSelect: () => void; disabled?: boolean; }

interface DropdownMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
}

export function DropdownMenu({ open, onOpenChange, trigger, items }: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative inline-block">
      <button className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); onOpenChange(!open); }}>
        {trigger}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-surface shadow-xl z-50">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); item.onSelect(); onOpenChange(false); }}
              disabled={item.disabled}
              className={cn("w-full text-left px-4 py-2 text-sm", item.disabled ? "opacity-50 cursor-not-allowed" : "text-main-text hover:bg-accent", "transition-colors")}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
