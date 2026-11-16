 
import { SidebarNav } from "@/components/layout/SidebarNav";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import {
  SIDEBAR_ADMIN,
  SIDEBAR_UTAMA,
  SIDEBAR_AKUN,
} from "@/lib/nav-config";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  withTopBar?: boolean;
}

export function Sidebar({
  className,
  withTopBar = true,
}: SidebarProps) {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const groups = isAdmin
    ? [
        { title: t("mobile_admin"), items: SIDEBAR_ADMIN },
        { title: t("mobile_account"), items: SIDEBAR_AKUN },
      ]
    : [
        { title: t("sidebar_menu"), items: SIDEBAR_UTAMA },
        { title: t("mobile_account"), items: SIDEBAR_AKUN },
      ];

  return (
    <aside
      className={cn(
        "sticky hidden w-[var(--sidebar-w)] shrink-0 max-w-[var(--sidebar-w)]",
        "flex-col overflow-x-hidden overflow-y-auto border-r border-[#e5ebeb] bg-white",
        withTopBar
          ? "top-[var(--sidebar-top)] h-[var(--sidebar-height)]"
          : "top-[var(--navbar-h)] h-[var(--sidebar-height-no-topbar)]",
        "lg:flex",
        className
      )}
    >
      <SidebarNav
        groups={groups}
        onNavigate={() => {}}
      />
    </aside>
  );
}
