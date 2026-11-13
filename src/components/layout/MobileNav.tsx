import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BellRing,
  BookOpen,
  Building2,
  Calculator,
  ChevronRight,
  History,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageCircle,
  Pill,
  Settings,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { SIDEBAR_ADMIN } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // =====================================================
  // NAVIGATION ITEMS
  // =====================================================

  const layanan = [
    { href: "/obat", label: "Informasi Obat", icon: Pill },
    { href: "/interaksi", label: "Cek Interaksi", icon: Activity },
    { href: "/dosis", label: "Kalkulator Dosis", icon: Calculator },
    { href: "/panduan", label: "Panduan Obat", icon: BookOpen },
    { href: "/apotek", label: "Cari Apotek", icon: Building2 },
    { href: "/tanya", label: "Tanya Apoteker", icon: MessageCircle },
  ];

  const akun = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pengingat", label: "Pengingat Obat", icon: BellRing },
    { href: "/riwayat", label: "Riwayat Konsumsi", icon: History },
    { href: "/profil", label: "Profil Saya", icon: User },
    { href: "/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  const groups = isAuthenticated
    ? [
        { title: "Layanan", items: layanan },
        ...(isAdmin
          ? [
              {
                title: "Admin",
                items: SIDEBAR_ADMIN,
              },
            ]
          : []),
        { title: "Akun", items: akun },
      ]
    : [{ title: "Layanan", items: layanan }];

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
                            ? "bg-[#fff2bf] text-main-text"
                            : "text-main-text hover:bg-accent hover:text-brand",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            active
                              ? "bg-brand text-[#263238]"
                              : "bg-primary-soft text-primary",
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                        </span>

                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>

                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-main-text/60" : "text-secondary-text/60",
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
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-main-text">
                  {user?.fullName}
                </p>
                <p className="truncate text-xs text-secondary-text">
                  {user?.email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-main-text transition-colors hover:bg-accent"
              >
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>

              <Link
                to="/register"
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
              >
                <UserPlus className="h-4 w-4" />
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
