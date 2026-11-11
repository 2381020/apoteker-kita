
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  BellRing,
  History,
  MessageCircle,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  PUBLIC_NAV,
  isDashboardPath,
  isAdminPath,
  SIDEBAR_ADMIN,
  SIDEBAR_AKUN,
} from "@/lib/nav-config";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import type { CSSProperties } from "react";

// =====================================================
// LOGO
// =====================================================

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex shrink-0 items-center gap-2",
        "transition-opacity hover:opacity-80",
        className
      )}
    >
      <img
        src="/images/logo.png"
        alt="ApotekerKita"
        className="h-8 w-8 rounded-xl sm:h-9 sm:w-9"
      />

      <span className="whitespace-nowrap text-base font-bold tracking-tight text-main-text sm:text-lg">
        Apoteker<span className="text-brand-text">Kita</span>
      </span>
    </Link>
  );
}

// =====================================================
// NAVBAR
// =====================================================

interface NavbarProps {
  withTopBar?: boolean;
}

export function Navbar({ withTopBar = true }: NavbarProps = {}) {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Tutup menu ketika berpindah halaman
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Escape untuk menutup dropdown akun
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // =====================================================
  // NAVIGATION CONFIGURATION
  // =====================================================

  const showSidebar =
    isDashboardPath(location.pathname) ||
    isAdminPath(location.pathname);

  const showPublicNav = !showSidebar;

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }

    if (href === "/admin" || href === "/dashboard") {
      return location.pathname === href;
    }

    return (
      location.pathname === href ||
      location.pathname.startsWith(href + "/")
    );
  };

  // =====================================================
  // USER MENU
  // =====================================================

  const userMenuLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/pengingat",
      label: "Pengingat Obat",
      icon: BellRing,
    },
    {
      href: "/riwayat",
      label: "Riwayat Konsumsi",
      icon: History,
    },
    {
      href: "/tanya",
      label: "Tanya Apoteker",
      icon: MessageCircle,
    },
  ];

  const accountLinks = SIDEBAR_AKUN;
  const adminLinks = isAdmin ? SIDEBAR_ADMIN : [];

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // =====================================================
  // MOBILE NAV POSITION
  // =====================================================

  const mobileNavStyle: CSSProperties = {
    "--mobile-nav-top": withTopBar
      ? "calc(var(--topbar-h) + var(--navbar-h))"
      : "var(--navbar-h)",
  } as CSSProperties;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <header
        className={cn(
          "sticky z-40 border-b border-border",
          "bg-surface/95 backdrop-blur-md",
          withTopBar
            ? "top-[var(--topbar-h)] mt-[var(--topbar-h)]"
            : "top-0"
        )}
      >
        <div
          className={cn(
            "relative flex h-[var(--navbar-h)] w-full",
            "min-w-0 items-center justify-between",
            "gap-2 px-3 sm:gap-4 sm:px-6",
            showPublicNav && "mx-auto max-w-[var(--layout-max)]"
          )}
        >
          {/* =========================================
              LOGO DAN HAMBURGER MENU
          ========================================= */}

          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center",
                "rounded-lg text-secondary-text",
                "transition-colors hover:bg-accent hover:text-main-text",
                "lg:hidden"
              )}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Logo />
          </div>

          {/* =========================================
              NAVIGASI DESKTOP
              PENTING: hidden pada mobile
          ========================================= */}

          {showPublicNav && (
            <nav
              className={cn(
                "mx-auto hidden shrink-0 items-center gap-1",
                "lg:flex"
              )}
              aria-label="Navigasi utama"
            >
              {PUBLIC_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg",
                      "px-3 py-2 text-sm font-medium",
                      "transition-colors duration-200",
                      active
                        ? "text-[#263238]"
                        : "text-secondary-text hover:text-[#263238]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors duration-200",
                        active
                          ? "text-[#263238]"
                          : "text-secondary-text"
                      )}
                    />

                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* =========================================
              MENU PENGGUNA
          ========================================= */}

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  className={cn(
                    "flex min-h-[40px] items-center gap-2",
                    "rounded-full border border-border",
                    "bg-surface pl-1.5 pr-2 sm:pr-3",
                    "text-sm font-medium text-main-text",
                    "shadow-sm transition-colors hover:bg-accent"
                  )}
                >
                  <Avatar className="h-7 w-7">
                    {user?.profilePicture && (
                      <img src={user.profilePicture} alt="" />
                    )}

                    <AvatarFallback className="text-xs">
                      {initials ?? "U"}
                    </AvatarFallback>
                  </Avatar>

                  <span className="hidden max-w-28 truncate sm:block">
                    {user?.fullName}
                  </span>

                  <ChevronDown className="h-4 w-4 text-secondary-text" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />

                    <div
                      className={cn(
                        "animate-fade-in absolute right-0 z-50",
                        "mt-2 w-64 max-w-[calc(100vw-1.5rem)]",
                        "rounded-xl border border-border",
                        "bg-surface p-1.5 shadow-popover"
                      )}
                    >
                      {/* INFORMASI PENGGUNA */}

                      <div className="border-b border-border px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-main-text">
                          {user?.fullName}
                        </p>

                        <p className="truncate text-xs text-secondary-text">
                          {user?.email}
                        </p>
                      </div>

                      {/* MENU UTAMA */}

                      {(isAdmin ? adminLinks : userMenuLinks).map((l) => {
                        const Icon = l.icon;
                        const active = isActive(l.href);

                        return (
                          <Link
                            key={l.href}
                            to={l.href}
                            onClick={() => setUserMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg",
                              "px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-accent text-main-text"
                                : "text-secondary-text hover:text-main-text"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {l.label}
                          </Link>
                        );
                      })}

                      {/* MENU AKUN */}

                      <div className="mt-1 border-t border-border pt-1">
                        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-secondary-text">
                          Akun
                        </p>

                        {accountLinks.map((l) => {
                          const Icon = l.icon;
                          const active = isActive(l.href);

                          return (
                            <Link
                              key={l.href}
                              to={l.href}
                              onClick={() => setUserMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg",
                                "px-3 py-2 text-sm transition-colors",
                                active
                                  ? "bg-accent text-main-text"
                                  : "text-secondary-text hover:text-main-text"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {l.label}
                            </Link>
                          );
                        })}
                      </div>

                      {/* LOGOUT */}

                      <div className="mt-1 border-t border-border pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                            navigate("/");
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5",
                            "rounded-lg px-3 py-2 text-sm",
                            "text-destructive transition-colors",
                            "hover:bg-destructive/10"
                          )}
                        >
                          <LogOut className="h-4 w-4" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="px-2.5 text-xs sm:px-3 sm:text-sm"
                >
                  <Link to="/login">Masuk</Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="bg-brand px-2.5 text-xs text-brand-foreground hover:bg-brand-hover sm:px-3 sm:text-sm"
                >
                  <Link to="/register">Daftar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================
          MOBILE DROPDOWN NAVIGATION
          Variabel posisi diwariskan ke MobileNav
      ========================================= */}

      <div style={mobileNavStyle}>
        <MobileNav
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      </div>
    </>
  );
}
