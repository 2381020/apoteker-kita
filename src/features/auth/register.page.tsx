import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, User, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useLanguage } from "@/lib/i18n";

const schema = z
  .object({
    fullName: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export function RegisterPage() {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const { register: regAuth } = useAuth();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      const r = await regAuth({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      if (!r.ok) {
        setError(r.error ?? tr("Pendaftaran gagal"));
        return;
      }
      if (r.needsEmailConfirmation) {
        setInfo(
          tr(
            "Akun berhasil dibuat. Periksa email Anda untuk konfirmasi, lalu masuk."
          )
        );
        return;
      }
      navigate("/dashboard");
    } catch {
      setError(tr("Terjadi kesalahan saat mendaftar. Silakan coba kembali."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="animate-fade-in overflow-hidden p-6 sm:p-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <img
            src="/images/logo.png"
            alt="ApotekerKita"
            className="h-12 w-12 rounded-xl"
          />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-main-text">
          {tr("Daftar Akun Baru")}
        </h1>
      </div>

      {error && (
        <Alert
          variant="destructive"
          title={tr("Kesalahan")}
          description={error}
          className="mt-6"
        />
      )}
      {info && (
        <Alert
          variant="success"
          title={tr("Berhasil")}
          description={info}
          className="mt-6"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{tr("Nama Lengkap")}</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text" />
            <Input
              id="fullName"
              placeholder="Budi Santoso"
              autoComplete="name"
              className="pl-9"
              {...register("fullName")}
            />
          </div>
          {errors.fullName?.message && (
            <p className="text-sm text-destructive">
              {tr(errors.fullName.message)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text" />
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              className="pl-9"
              {...register("email")}
            />
          </div>
          {errors.email?.message && (
            <p className="text-sm text-destructive">{tr(errors.email.message)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{tr("Kata Sandi")}</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text" />
            <Input
              id="password"
              type="password"
              placeholder={tr("Minimal 6 karakter")}
              autoComplete="new-password"
              className="pl-9"
              {...register("password")}
            />
          </div>
          {errors.password?.message && (
            <p className="text-sm text-destructive">
              {tr(errors.password.message)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{tr("Konfirmasi Kata Sandi")}</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder={tr("Ulangi kata sandi")}
              autoComplete="new-password"
              className="pl-9"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword?.message && (
            <p className="text-sm text-destructive">
              {tr(errors.confirmPassword.message)}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? tr("Memproses...") : tr("Daftar")}
        </Button>
        <p className="pt-1 text-center text-sm text-secondary-text">
          {tr("Sudah punya akun?")}{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            {tr("Masuk di sini")}
          </Link>
        </p>
      </form>
    </Card>
  );
}
