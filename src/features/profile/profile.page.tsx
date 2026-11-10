
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getProfile } from "@/services/profiles.service";
import type { Profile } from "@/types";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";

import {
  Mail,
  Phone,
  Cake,
  UserRound,
  Pencil,
  BellRing,
  CalendarDays,
  HeartPulse,
  ShieldCheck,
  Users,
  Pill,
  Activity,
  BookOpen,
  Store,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Panel Admin", icon: ShieldCheck, description: "Ringkasan administrasi" },
  { href: "/admin/obat", label: "Kelola Obat", icon: Pill, description: "Data dan katalog obat" },
  { href: "/admin/interaksi", label: "Interaksi Obat", icon: Activity, description: "Pemeriksaan interaksi" },
  { href: "/admin/panduan", label: "Kelola Panduan", icon: BookOpen, description: "Informasi kesehatan" },
  { href: "/admin/apotek", label: "Kelola Apotek", icon: Store, description: "Data apotek" },
  { href: "/admin/pengguna", label: "Kelola Pengguna", icon: Users, description: "Manajemen pengguna" },
];

export function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;

    getProfile(user.id)
      .then((row) => {
        if (active) setProfile(row);
      })
      .catch(() => {
        if (active) setProfile(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) return <PageSkeleton />;

  const fullName = profile?.fullName || user?.fullName;
  const email = profile?.email || user?.email;
  const phone = profile?.phone || user?.phone;
  const dateOfBirth = profile?.dateOfBirth || user?.dateOfBirth;
  const gender = profile?.gender || user?.gender;
  const role = profile?.role || user?.role;
  const createdAt = profile?.createdAt || user?.createdAt;
  const isAdmin = role === "admin";

  const initials = fullName
    ?.split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const notifActive =
    profile?.notificationPreferences?.reminders ?? true;

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Belum diisi";

  const infoItems = [
    { icon: Mail, label: "Alamat Email", value: email ?? "-" },
    { icon: Phone, label: "Nomor Telepon", value: phone || "Belum diisi" },
    ...(!isAdmin
      ? [
          { icon: Cake, label: "Tanggal Lahir", value: formatDate(dateOfBirth) },
          {
            icon: UserRound,
            label: "Jenis Kelamin",
            value: gender
              ? gender === "laki-laki"
                ? "Laki-laki"
                : "Perempuan"
              : "Belum diisi",
          },
        ]
      : [
          { icon: ShieldCheck, label: "Peran Akun", value: "Administrator" },
        ]),
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Profil Saya"
        description={
          isAdmin
            ? "Kelola informasi akun administrator Anda."
            : "Kelola informasi pribadi dan preferensi kesehatan Anda."
        }
        icon={UserRound}
      />

      {/* Profile Card */}
      <Card className="overflow-hidden border-border bg-white shadow-sm">
        {/* Banner */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-r from-primary/15 via-primary/30 to-primary/10">
          <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full border-[30px] border-white/20" />
          <div className="absolute -right-2 -bottom-24 h-48 w-48 rounded-full bg-primary/10" />
        </div>

        <div className="px-5 pb-6 sm:px-8">
          {/* Profile Identity */}
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              <Avatar className="h-24 w-24 shrink-0 border-4 border-white shadow-md">
                <AvatarImage
                  src={profile?.profilePicture || user?.profilePicture}
                  alt={fullName}
                />
                <AvatarFallback className="bg-primary text-2xl font-bold text-white">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 pb-1">
                <h2 className="truncate text-xl font-bold text-main-text sm:text-2xl">
                  {fullName || "Pengguna"}
                </h2>

                <p className="mt-1 truncate text-sm text-secondary-text">
                  {email}
                </p>

                <Badge
                  variant={isAdmin ? "default" : "secondary"}
                  className="mt-2"
                >
                  {isAdmin ? "Administrator" : "Pasien"}
                </Badge>
              </div>
            </div>

            <Button asChild variant="outline" className="shrink-0">
              <Link to="/pengaturan">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profil
              </Link>
            </Button>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-border" />

          {/* Personal Information */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-main-text">
                Informasi Pribadi
              </h3>
              <p className="mt-1 text-sm text-secondary-text">
                Informasi akun dan identitas Anda.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {infoItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface/50 p-4 transition-colors hover:border-primary/30 hover:bg-primary-soft/20"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-secondary-text">
                        {item.label}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-main-text">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Access */}
          {isAdmin ? (
            <div className="mt-7 border-t border-border pt-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-main-text">
                  Akses Administrator
                </h3>
                <p className="mt-1 text-sm text-secondary-text">
                  Akses cepat ke fitur pengelolaan ApotekerKita.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ADMIN_LINKS.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-white p-3.5 transition-all hover:border-primary/40 hover:bg-primary-soft/20"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-main-text">
                          {link.label}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-secondary-text">
                          {link.description}
                        </p>
                      </div>

                      <ArrowUpRight className="h-4 w-4 shrink-0 text-secondary-text transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <BellRing className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-main-text">
                    Notifikasi Pengingat
                  </p>
                  <p className="mt-0.5 text-xs text-secondary-text">
                    Pengingat jadwal minum obat
                  </p>
                </div>
              </div>

              <Badge variant={notifActive ? "success" : "secondary"}>
                {notifActive ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          )}

          {/* Member Since */}
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-surface px-4 py-3.5">
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" />

            <div>
              <p className="text-xs text-secondary-text">
                Bergabung sejak
              </p>
              <p className="mt-0.5 text-sm font-semibold text-main-text">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-5 flex items-start gap-3 px-1">
            <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

            <p className="text-xs leading-relaxed text-secondary-text">
              {isAdmin
                ? "Jaga kerahasiaan akun administrator. Pastikan data referensi dikelola secara berkala agar informasi tetap akurat."
                : "Pastikan informasi profil Anda selalu terkini agar layanan dan pengingat kesehatan dapat berjalan dengan optimal."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
