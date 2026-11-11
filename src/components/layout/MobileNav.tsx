import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { isAuthenticated } = useAuth();

  // =====================================================
  // NAVIGATION ITEMS
  // =====================================================

  const items = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/pengingat", label: "Pengingat Obat" },
        { href: "/riwayat", label: "Riwayat Konsumsi" },
        { href: "/profil", label: "Profil Saya" },
        { href: "/pengaturan", label: "Pengaturan" },
      ]
    : [
        { href: "/", label: "Beranda" },
        { href: "/obat", label: "Obat" },
        { href: "/interaksi", label: "Interaksi" },
        { href: "/dosis", label: "Dosis" },
        { href: "/panduan", label: "Panduan" },
        { href: "/apotek", label: "Apotek" },
      ];

  // =====================================================
  // BODY SCROLL & ESCAPE KEY
  // =====================================================

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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className={cn("fixed inset-0 z-40 lg:hidden", "pointer-events-none")}
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
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-none",

          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0",
        )}
        style={{
          top: "var(--mobile-nav-top, 64px)",
          maxHeight: "80dvh",
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
            "px-4 py-3",
          )}
          aria-label="Menu utama"
        >
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className={cn(
                  "flex items-center justify-between",
                  "rounded-xl px-5 py-4",
                  "text-[15px] font-medium",
                  "text-main-text",
                  "transition-colors duration-200",
                  "hover:bg-accent hover:text-brand",
                  "active:bg-accent",
                )}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* =========================================
            FOOTER
        ========================================= */}
      </div>
    </div>
  );
}
