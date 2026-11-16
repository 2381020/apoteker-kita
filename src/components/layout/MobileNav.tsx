import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import {
  PUBLIC_NAV,
  SIDEBAR_ADMIN,
  SIDEBAR_AKUN,
  SIDEBAR_UTAMA,
} from "@/lib/nav-config";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { t, navLabel } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // =====================================================
  // NAVIGATION ITEMS
  // =====================================================

  const akun = [...SIDEBAR_UTAMA, ...SIDEBAR_AKUN];

  const groups = isAuthenticated
    ? [
        ...(isAdmin
          ? [{ title: t("mobile_admin"), items: SIDEBAR_ADMIN }]
          : []),
        { title: t("mobile_account"), items: akun },
        { title: t("sidebar_menu"), items: PUBLIC_NAV },
      ]
    : [{ title: t("sidebar_menu"), items: PUBLIC_NAV }];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";

    if (href === "/admin" || href === "/dashboard") {
      return location.pathname === href;
    }

    return (
      location.pathname === href ||
      location.pathname.startsWith(href + "/")
    );
  };

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/");
  };

  // =====================================================
  // BODY SCROLL & ESCAPE KEY
  // =====================================================

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const raf = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []
      ).filter((element) => element.tabIndex >= 0);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className={cn("fixed inset-0 z-50 lg:hidden", "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* =========================================
          BACKDROP
          Dimulai tepat di bawah navbar
      ========================================= */}

      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-x-0 bottom-0",
          "bg-slate-950/40 backdrop-blur-[2px]",
          "transition-opacity duration-300",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        style={{
          top: "var(--mobile-nav-top, 64px)",
        }}
      />

      {/* =========================================
          DROPDOWN MENU
          Muncul dari atas ke bawah
      ========================================= */}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigasi utama"
        className={cn(
          "fixed left-0 right-0 z-50",
          "flex flex-col",
          "overflow-hidden",
          "rounded-b-2xl",

          "border-b border-border",
          "bg-surface shadow-xl",
          "origin-top",
          "transition-all duration-300",
          "ease-out",
          "motion-reduce:transition-none",

          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0",
        )}
        style={{
          top: "var(--mobile-nav-top, 64px)",
          maxHeight: "calc(100dvh - var(--mobile-nav-top, 64px))",
        }}
        inert={!open}
      >
        {/* =========================================
            PROFIL PENGGUNA
        ========================================= */}

        {isAuthenticated && (
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-4">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center",
                "rounded-full bg-primary-soft text-sm font-semibold text-primary"
              )}
            >
              {initials}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-main-text">
                {user?.fullName ?? "-"}
              </p>
              <p className="truncate text-xs text-secondary-text">
                {user?.email ?? "-"}
              </p>
            </div>

            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                isAdmin
                  ? "bg-[#fff2bf] text-[#8a6d1a]"
                  : "bg-primary-soft text-primary"
              )}
            >
              {isAdmin ? t("auth_demo_admin") : t("auth_demo_patient")}
            </span>
          </div>
        )}

        {/* =========================================
            NAVIGATION LINKS
        ========================================= */}

        <nav
          className={cn(
            "flex-1 overflow-y-auto",
            "overscroll-contain",
            "px-4 py-4",
          )}
          aria-label="Menu utama"
        >
          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.title}>
                <h2 className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary-text">
                  {group.title}
                </h2>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        tabIndex={open ? 0 : -1}
                        className={cn(
                          "flex min-h-12 items-center gap-3",
                          "rounded-xl px-3 py-2.5",
                          "text-[15px] font-medium",
                          "transition-colors duration-200",
                          active
                            ? "bg-[#e6f4f1] text-[#0b6d66]"
                            : "text-main-text hover:bg-accent hover:text-brand",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            active
                              ? "bg-[#078e83] text-white"
                              : "bg-primary-soft text-primary",
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                        </span>

                        <span className="min-w-0 flex-1 truncate">
                          {navLabel(item.href, item.label)}
                        </span>

                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-[#078e83]" : "text-secondary-text/60",
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        {/* =========================================
            FOOTER / AUTH ACTIONS
        ========================================= */}

        <div className="shrink-0 border-t border-border bg-surface px-4 py-3 pb-[calc(0.75rem+var(--safe-bottom))]">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "inline-flex min-h-11 w-full items-center justify-center gap-2",
                "rounded-xl border border-destructive/30 px-3",
                "text-sm font-semibold text-destructive",
                "transition-colors hover:bg-destructive/10"
              )}
            >
              <LogOut className="h-4 w-4" />
              {t("navbar_logout")}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-main-text transition-colors hover:bg-accent"
              >
                <LogIn className="h-4 w-4" />
                {t("navbar_login")}
              </Link>

              <Link
                to="/register"
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
              >
                <UserPlus className="h-4 w-4" />
                {t("navbar_register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
