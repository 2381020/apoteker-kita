import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SkipLink } from "@/components/shared/skip-link";

export function AuthLayout() {
  return (
    <div className="auth-background relative isolate min-h-dvh w-full overflow-x-clip bg-background">
      <SkipLink />

      {/* Background Overlay */}
      <div
        className="pointer-events-none fixed inset-0 bg-black/45"
        aria-hidden="true"
      />

      {/* Main Content */}
      <main
        id="main-content"
        className="relative z-10 flex min-h-dvh w-full items-center justify-center px-4 py-6 pt-[calc(1.5rem+var(--safe-top))] pb-[calc(1.5rem+var(--safe-bottom))] sm:py-12"
      >
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
