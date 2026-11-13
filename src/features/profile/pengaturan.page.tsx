import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Settings, UserRound, MessageCircle, Save, ShieldCheck, Users, Pill } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { getProfile, updateProfile, type ProfileUpdate } from "@/services/profiles.service";
import type { NotificationPreferences } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useToast } from "@/components/ui/toast";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "laki-laki" | "perempuan" | "";
  notificationPreferences: NotificationPreferences;
};

const defaultForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  notificationPreferences: { reminders: true, email: false, sms: false },
};

export function PengaturanPage() {
  const { user, logout, refresh } = useAuth();
  const { add } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getProfile(user.id)
      .then((profile) => {
        if (!active) return;
        setForm({
          fullName: profile?.fullName ?? user.fullName,
          email: profile?.email ?? user.email,
          phone: profile?.phone ?? user.phone ?? "",
          dateOfBirth: profile?.dateOfBirth ?? user.dateOfBirth ?? "",
          gender: (profile?.gender ?? user.gender ?? "") as FormState["gender"],
          notificationPreferences:
            profile?.notificationPreferences ?? defaultForm.notificationPreferences,
        });
      })
      .catch(() => {
        if (!active) return;
        setForm({
          fullName: user.fullName,
          email: user.email,
          phone: user.phone ?? "",
          dateOfBirth: user.dateOfBirth ?? "",
          gender: (user.gender ?? "") as FormState["gender"],
          notificationPreferences: defaultForm.notificationPreferences,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) return <PageSkeleton />;

  const isAdmin = user?.role === "admin";

  const simpan = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload: ProfileUpdate = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || null,
      };

      if (!isAdmin) {
        payload.dateOfBirth = form.dateOfBirth || null;
        payload.gender = form.gender || null;
        payload.notificationPreferences = form.notificationPreferences;
      }

      const emailChanged =
        form.email.trim().length > 0 &&
        form.email.trim().toLowerCase() !== user.email.toLowerCase();

      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: form.email.trim(),
        });
        if (emailError) throw emailError;
      }

      await updateProfile(user.id, payload);
      await refresh();

      add({
        title: "Perubahan disimpan",
        description: emailChanged
          ? "Profil diperbarui. Jika konfirmasi email aktif, periksa kotak masuk untuk memverifikasi email baru."
          : "Profil Anda berhasil diperbarui.",
        variant: "success",
      });
    } catch (error) {
      add({
        title: "Gagal menyimpan perubahan",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = async (checked: boolean) => {
    if (!user) return;
    const next: NotificationPreferences = { ...form.notificationPreferences, reminders: checked };
    setForm({ ...form, notificationPreferences: next });
    try {
      await updateProfile(user.id, { notificationPreferences: next });
      add({
        title: checked ? "Notifikasi pengingat aktif" : "Notifikasi pengingat dimatikan",
        variant: "success",
      });
    } catch (error) {
      setForm((current) => ({
        ...current,
        notificationPreferences: form.notificationPreferences,
      }));
      add({
        title: "Gagal mengubah notifikasi",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Pengaturan"
        description={
          isAdmin
            ? "Kelola akun administrator dan akses pengelolaan data."
            : "Kelola akun, data kesehatan, dan preferensi notifikasi Anda."
        }
        icon={Settings}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-main-text">
            {isAdmin ? "Akun Administrator" : "Profil Pasien"}
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            {isAdmin
              ? "Perbarui informasi dasar akun administrator."
              : "Perbarui informasi dasar dan data kesehatan Anda."}
          </p>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Nama lengkap Anda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            {!isAdmin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gender: e.target.value as FormState["gender"],
                      })
                    }
                    className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-main-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="laki-laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>
                </div>
              </>
            )}
            <Button onClick={simpan} className="w-full" disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6">
          <h2 className="text-base font-semibold text-main-text">
            {isAdmin ? "Administrasi" : "Preferensi"}
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            {isAdmin
              ? "Akses cepat ke fitur pengelolaan data."
              : "Atur bagaimana Anda ingin menerima notifikasi."}
          </p>

          {!isAdmin && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-main-text">Notifikasi Pengingat</p>
                  <p className="text-xs text-secondary-text">Terima pengingat jadwal minum obat</p>
                </div>
              </div>
              <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={form.notificationPreferences.reminders}
                  onChange={(e) => toggleNotification(e.target.checked)}
                  className="peer sr-only"
                  aria-label="Notifikasi pengingat"
                />
                <span className="block h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          )}

          <div className="mt-6 flex-1 space-y-2 border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
              Tautan cepat
            </p>
            <button
              onClick={() => navigate("/profil")}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-secondary-text transition-colors hover:bg-accent hover:text-main-text"
            >
              <UserRound className="h-4 w-4" /> Lihat profil
            </button>
            {isAdmin ? (
              <>
                <button
                  onClick={() => navigate("/admin")}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-secondary-text transition-colors hover:bg-accent hover:text-main-text"
                >
                  <ShieldCheck className="h-4 w-4" /> Panel admin
                </button>
                <button
                  onClick={() => navigate("/admin/pengguna")}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-secondary-text transition-colors hover:bg-accent hover:text-main-text"
                >
                  <Users className="h-4 w-4" /> Kelola pengguna
                </button>
                <button
                  onClick={() => navigate("/admin/obat")}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-secondary-text transition-colors hover:bg-accent hover:text-main-text"
                >
                  <Pill className="h-4 w-4" /> Kelola obat
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/tanya")}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-secondary-text transition-colors hover:bg-accent hover:text-main-text"
              >
                <MessageCircle className="h-4 w-4" /> Tanya apoteker
              </button>
            )}
            <button
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Keluar dari akun
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
