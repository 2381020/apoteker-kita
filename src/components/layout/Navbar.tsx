import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  BellRing,
  History,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PUBLIC_NAV, isDashboardPath, isAdminPath, SIDEBAR_ADMIN, SIDEBAR_AKUN } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-2.5 transition-opacity hover:opacity-80",
        className
      )}
    >
      <img
        src="/images/logo.png"
        alt="ApotekerKita"
        className="h-9 w-9 rounded-xl"
      />

      <span className="text-lg font-bold tracking-tight text-main-text">
        Apoteker<span className="text-brand-text">Kita</span>
      </span>
    </Link>
  );
}

interface NavbarProps {
  withTopBar?: boolean;
}

export function Navbar({ withTopBar = true }: NavbarProps = {}) {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showSidebar =
    isDashboardPath(location.pathname) ||
    isAdminPath(location.pathname);

  const showPublicNav = !showSidebar;

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

  const userMenuLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pengingat", label: "Pengingat Obat", icon: BellRing },
    { href: "/riwayat", label: "Riwayat Konsumsi", icon: History },
    { href: "/tanya", label: "Tanya Apoteker", icon: MessageCircle },
  ];

  const accountLinks = SIDEBAR_AKUN;
  const adminLinks = isAdmin ? SIDEBAR_ADMIN : [];

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <header
        className={cn(
          "sticky z-40 border-b border-border bg-surface/95 backdrop-blur-md",
          withTopBar ? "top-[var(--topbar-h)] mt-[var(--topbar-h)]" : "top-0"
        )}
      >
        <div
          className={cn(
            "flex h-[var(--navbar-h)] w-full items-center justify-between px-4 sm:px-6",
            showPublicNav && "mx-auto max-w-[var(--layout-max)]"
          )}
        >

          {/* Logo dan tombol mobile */}
          <div className="flex shrink-0 items-center gap-3 lg:gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-secondary-text transition-colors hover:text-main-text lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Logo />
          </div>

          {/* Navigasi utama */}
          {showPublicNav && (
            <nav
              className="mx-auto flex shrink-0 items-center gap-1 lg:flex"
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
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
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

          {/* Menu pengguna */}
          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface min-h-[44px] pl-1.5 pr-3 text-sm font-medium text-main-text shadow-sm transition-colors hover:bg-accent"
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

                    <div className="animate-fade-in absolute right-2 left-2 mt-2 max-w-[calc(100vw-1rem)] rounded-xl border border-border bg-surface p-1.5 shadow-popover">

                      {/* Informasi pengguna */}
                      <div className="border-b border-border px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-main-text">
                          {user?.fullName}
                        </p>

                        <p className="truncate text-xs text-secondary-text">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu utama */}
                      {(isAdmin ? adminLinks : userMenuLinks).map((l) => {
                        const Icon = l.icon;
                        const active = isActive(l.href);

                        return (
                          <Link
                            key={l.href}
                            to={l.href}
                            onClick={() => setUserMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
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

                      {/* Menu akun */}
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
                                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
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

                      {/* Logout */}
                      <div className="mt-1 border-t border-border pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                            navigate("/");
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
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
                  className="inline-flex"
                >
                  <Link to="/login">Masuk</Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="bg-brand text-brand-foreground hover:bg-brand-hover"
                >
                  <Link to="/register">Daftar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Navigasi mobile */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}
