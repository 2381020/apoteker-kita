import { lazy, Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/shared/skip-link";
import { isDashboardPath } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";

const FloatingChatPanel = lazy(
  () => import("@/components/ui/floating-chat-panel")
);

export function PageLayout() {
  const location = useLocation();
  const hasSidebar = isDashboardPath(location.pathname);
  const showFloatingChat = location.pathname !== "/tanya";
  const [chatReady, setChatReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setChatReady(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-background">
      <SkipLink />
      {!hasSidebar && <TopBar />}
      <Navbar withTopBar={!hasSidebar} />
      <div
        className={cn(
          "flex w-full flex-1",
          !hasSidebar && "mx-auto max-w-[var(--layout-max)]"
        )}
      >
        {hasSidebar && <Sidebar withTopBar={false} />}
        <main
          id="main-content"
          className="min-w-0 flex-1 px-4 pb-[calc(6rem+var(--safe-bottom))] pt-6 sm:px-6 sm:pb-12 sm:pt-8"
        >
          <Outlet />
        </main>
      </div>
      {!hasSidebar && <Footer />}
      {showFloatingChat && chatReady && (
        <Suspense fallback={null}>
          <FloatingChatPanel />
        </Suspense>
      )}
    </div>
  );
}
