
import { Outlet } from "react-router-dom";
import { SkipLink } from "@/components/shared/skip-link";

export function AuthLayout() {
  return (
    <div
      className="relative isolate min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/login-background.png')",
      }}
    >
      <SkipLink />

      {/* Background Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-black/40"
        aria-hidden="true"
      />

      {/* Main Content */}
      <main
        id="main-content"
        className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-8 sm:py-12"
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
