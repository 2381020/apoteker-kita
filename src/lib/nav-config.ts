import {
  LayoutDashboard,
  Pill,
  Activity,
  Upload,
  Calculator,
  BookOpen,
  Building2,
  BellRing,
  History,
  User,
  Settings,
  ShieldCheck,
  Users,
  Home,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: NavItem[];
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const PUBLIC_NAV: NavItem[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/obat", label: "Obat", icon: Pill },
  { href: "/interaksi", label: "Interaksi", icon: Activity },
  { href: "/dosis", label: "Dosis", icon: Calculator },
  { href: "/panduan", label: "Panduan", icon: BookOpen },
  { href: "/apotek", label: "Apotek", icon: Building2 },
];

export const SIDEBAR_UTAMA: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pengingat", label: "Pengingat Obat", icon: BellRing },
  { href: "/riwayat", label: "Riwayat Konsumsi", icon: History },
];

export const SIDEBAR_LAYANAN: NavItem[] = [
  { href: "/obat", label: "Obat", icon: Pill },
  { href: "/interaksi", label: "Interaksi Obat", icon: Activity },
  { href: "/dosis", label: "Kalkulator Dosis", icon: Calculator },
  { href: "/panduan", label: "Panduan", icon: BookOpen },
  { href: "/apotek", label: "Apotek", icon: Building2 },
  { href: "/tanya", label: "Tanya Apoteker", icon: MessageCircle },
];

export const SIDEBAR_AKUN: NavItem[] = [
  { href: "/profil", label: "Profil Saya", icon: User },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export const SIDEBAR_ADMIN: NavItem[] = [
  { href: "/admin", label: "Dashboard Admin", icon: LayoutDashboard },
  { href: "/admin/obat", label: "Kelola Obat", icon: Pill },
  { href: "/admin/interaksi", label: "Kelola Interaksi", icon: Activity },
  { href: "/admin/import", label: "Import Interaksi", icon: Upload },
  { href: "/admin/panduan", label: "Kelola Panduan", icon: BookOpen },
  { href: "/admin/apotek", label: "Kelola Apotek", icon: Building2 },
  { href: "/admin/pengguna", label: "Kelola Pengguna", icon: Users },
];

export const DASHBOARD_PATHS = ["/dashboard", "/pengingat", "/riwayat", "/profil", "/pengaturan"];

export function isDashboardPath(pathname: string): boolean {
  return DASHBOARD_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export { ShieldCheck };
