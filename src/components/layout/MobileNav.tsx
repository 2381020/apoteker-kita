
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ShieldCheck, HeartPulse } from "lucide-react";

import { SidebarNav } from "@/components/layout/SidebarNav";
import { useAuth } from "@/hooks/useAuth";
import {
  PUBLIC_NAV,
  SIDEBAR_ADMIN,
  SIDEBAR_UTAMA,
  SIDEBAR_AKUN,
} from "@/lib/nav-config";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const groups = isAdmin
    ? [
        { title: "ADMINISTRASI", items: SIDEBAR_ADMIN },
        { title: "PREFERENSI AKUN", items: SIDEBAR_AKUN },
      ]
    : isAuthenticated
      ? [
          { title: "MENU UTAMA", items: SIDEBAR_UTAMA },
          { title: "PREFERENSI AKUN", items: SIDEBAR_AKUN },
        ]
      : [{ title: "MENU UTAMA", items: PUBLIC_NAV }];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] lg:hidden",
        !open && "pointer-events-none"
      )}
    >
      {/* BACKDROP */}
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Tutup navigasi"
        onClick={onClose}
        className={cn(
          "absolute inset-0 cursor-default bg-slate-900/60",
          "backdrop-blur-[8px]",
          "transition-opacity duration-300 ease-out",
          "motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* SIDEBAR DRAWER */}
      <aside
        role="dialog"
        aria-modal={open ? "true" : undefined}
        aria-label="Navigasi ApotekerKita"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "absolute inset-y-0 left-0",
          "flex flex-col",
          "w-[min(22rem,88vw)]",
          "overflow-hidden",
          "border-r border-slate-200/80",
          "bg-surface",
          "shadow-[12px_0_50px_rgba(15,23,42,0.12)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* HEADER */}
        <div className="relative shrink-0 border-b border-border bg-surface px-5 pb-5 pt-[calc(1.25rem+env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={onClose}
              className="group flex min-w-0 items-center gap-3"
            >
              {/* LOGO */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
                <HeartPulse className="h-6 w-6" strokeWidth={2.3} />
              </div>

              {/* BRAND NAME */}
              <div className="min-w-0">
                <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-main-text">
                  ApotekerKita
                </h2>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-secondary-text">
                  Healthcare Platform
                </p>
              </div>
            </Link>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup navigasi"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center",
                "rounded-xl border border-border",
                "bg-surface text-secondary-text",
                "transition-all duration-200",
                "hover:border-border hover:bg-accent hover:text-main-text",
                "active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              )}
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* ACCOUNT STATUS */}
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-accent/50 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-main-text">
                {isAdmin
                  ? "Administrator"
                  : isAuthenticated
                    ? "Pengguna ApotekerKita"
                    : "Pengunjung"}
              </p>
              <p className="mt-0.5 text-[10px] text-secondary-text">
                {isAdmin
                  ? "Akses pengelolaan sistem"
                  : isAuthenticated
                    ? "Akses akun dan layanan"
                    : "Jelajahi layanan kami"}
              </p>
            </div>

            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* NAVIGATION CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <SidebarNav
            groups={groups}
            onNavigate={onClose}
          />
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-border bg-surface px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-main-text">
                ApotekerKita
              </p>
              <p className="mt-0.5 text-[10px] text-secondary-text">
                Your health, our priority.
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
