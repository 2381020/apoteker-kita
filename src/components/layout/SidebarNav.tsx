 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { NavGroup } from "@/lib/nav-config";

interface SidebarNavProps {
  groups: NavGroup[];
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({
  groups,
  onNavigate,
  className,
}: SidebarNavProps) {
  const { user, isAdmin, logout } = useAuth();
  const { t, navLabel } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const allItems = groups.flatMap((group) => group.items);

  const activeHref = allItems
    .filter(
      (item) =>
        location.pathname === item.href ||
        (item.href !== "/" &&
          location.pathname.startsWith(`${item.href}/`))
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const isActive = (href: string) => href === activeHref;

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  const handleLogout = () => {
    logout();
    navigate("/");
    onNavigate?.();
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-white",
        className
      )}
    >
      {/* Profil pengguna */}
      <div className="shrink-0 border-b border-[#eef2f2] px-4 py-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center",
              "rounded-full bg-[#e6f4f1] text-sm font-semibold text-[#078e83]"
            )}
          >
            {initials}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#263b3b]">
              {user?.fullName ?? "-"}
            </p>
            <p className="truncate text-xs text-[#758494]">
              {user?.email ?? "-"}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "mt-3 inline-flex items-center rounded-full px-2 py-0.5",
            "text-[10px] font-semibold uppercase tracking-wide",
            isAdmin
              ? "bg-[#fff2bf] text-[#8a6d1a]"
              : "bg-[#e6f4f1] text-[#078e83]"
          )}
        >
          {isAdmin ? t("auth_demo_admin") : t("auth_demo_patient")}
        </span>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Navigasi utama"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4"
      >
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.title}>
              {/* Group title */}
              {group.title && (
                <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#758494]">
                  {group.title}
                </h3>
              )}

              {/* Menu items */}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex min-h-10 w-full items-center gap-3",
                          "rounded-xl px-3 py-2",
                          "text-sm font-medium transition-colors duration-150",
                          "focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-[#15968b] focus-visible:ring-offset-2",
                          active
                            ? "bg-[#e6f4f1] text-[#0b6d66]"
                            : "text-[#607187] hover:bg-[#f3f6f6] hover:text-[#263b3b]"
                        )}
                      >
                        <Icon
                          size={17}
                          strokeWidth={1.8}
                          className={cn(
                            "shrink-0 transition-colors",
                            active
                              ? "text-[#078e83]"
                              : "text-[#70839b] group-hover:text-[#078e83]"
                          )}
                        />

                        <span className="min-w-0 flex-1 truncate">
                          {navLabel(item.href, item.label)}
                        </span>

                        {active && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#078e83]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-[#e7eded] bg-white p-3">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex min-h-10 w-full items-center gap-3",
            "rounded-xl px-3 py-2",
            "text-sm font-medium text-red-600",
            "transition-colors duration-150",
            "hover:bg-red-50",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-red-400 focus-visible:ring-offset-2"
          )}
        >
          <LogOut
            size={17}
            strokeWidth={1.8}
            className="shrink-0"
          />

          <span>{t("navbar_logout")}</span>
        </button>
      </div>
    </div>
  );
}
