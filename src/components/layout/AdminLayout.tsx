import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SkipLink } from "@/components/shared/skip-link";

export function AdminLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SkipLink />
      <Navbar withTopBar={false} />
      <div className="flex w-full flex-1">
        <Sidebar withTopBar={false} />
        <main
          id="main-content"
          className="min-w-0 flex-1 px-4 pb-[calc(6rem+var(--safe-bottom))] pt-6 sm:px-6 sm:pb-12 sm:pt-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
