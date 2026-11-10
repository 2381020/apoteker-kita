
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, UserRound } from "lucide-react";

import { useAuth, DEMO_ACCOUNTS } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

const schema = z.object({
  email: z.string().email("Masukkan email yang valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

type LoginFormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setSubmitting(true);

    try {
      const result = await login(data.email, data.password);

      if (!result.ok) {
        setError(result.error ?? "Login gagal");
        return;
      }

      navigate(result.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
    setError("");
  };

  return (
    <Card className="animate-fade-in overflow-hidden border-border bg-white p-6 shadow-xl sm:p-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary shadow-sm">
          <img
            src="/images/logo.png"
            alt="ApotekerKita"
            className="h-12 w-12 rounded-xl"
          />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-main-text">
          Selamat datang kembali
        </h1>

        <p className="mt-1.5 text-sm text-secondary-text">
          Masuk untuk mengelola obat dan pengingat Anda.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert
          variant="destructive"
          title="Kesalahan"
          description={error}
          className="mt-6"
        />
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {/* Email */}
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

          {errors.email && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text" />

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-9"
              {...register("password")}
            />
          </div>

          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Memproses..." : "Masuk"}
        </Button>

        {/* Register Link */}
        <p className="pt-1 text-center text-sm text-secondary-text">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </form>

      {/* Demo Accounts */}
      <div className="mt-8 border-t border-border pt-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-text">
          <UserRound className="h-3.5 w-3.5" />
          Akun demo — ketuk untuk mengisi otomatis
        </p>

        <div className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account.email, account.password)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
            >
              <span className="shrink-0 font-medium text-main-text">
                {account.role === "admin" ? "Admin" : "Pasien"}
              </span>

              <span className="truncate text-xs text-secondary-text">
                {account.email} / {account.password}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
