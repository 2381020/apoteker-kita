import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useAuth } from "@/hooks/useAuth";

const BerandaPage = lazy(() =>
  import("@/features/home/home.page").then((m) => ({ default: m.BerandaPage }))
);
const ObatPage = lazy(() =>
  import("@/features/medications/medications.page").then((m) => ({ default: m.ObatPage }))
);
const InteraksiPage = lazy(() =>
  import("@/features/interactions/interactions.page").then((m) => ({ default: m.InteraksiPage }))
);
const DosisPage = lazy(() =>
  import("@/features/dosage-calculator/dosage.page").then((m) => ({ default: m.DosisPage }))
);
const PanduanPage = lazy(() =>
  import("@/features/medication-guides/guides.page").then((m) => ({ default: m.PanduanPage }))
);
const ApotekPage = lazy(() =>
  import("@/features/pharmacy/pharmacy.page").then((m) => ({ default: m.ApotekPage }))
);
const TanyaPage = lazy(() =>
  import("@/features/chatbot/chatbot.page").then((m) => ({ default: m.TanyaPage }))
);
const LoginPage = lazy(() =>
  import("@/features/auth/login.page").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("@/features/auth/register.page").then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/dashboard.page").then((m) => ({ default: m.DashboardPage }))
);
const PengingatPage = lazy(() =>
  import("@/features/reminders/reminders.page").then((m) => ({ default: m.PengingatPage }))
);
const RiwayatPage = lazy(() =>
  import("@/features/dashboard/riwayat.page").then((m) => ({ default: m.RiwayatPage }))
);
const ProfilePage = lazy(() =>
  import("@/features/profile/profile.page").then((m) => ({ default: m.ProfilePage }))
);
const PengaturanPage = lazy(() =>
  import("@/features/profile/pengaturan.page").then((m) => ({ default: m.PengaturanPage }))
);
const AdminDashboardPage = lazy(() =>
  import("@/features/admin/admin-dashboard.page").then((m) => ({ default: m.AdminDashboardPage }))
);
const ManageMedicationsPage = lazy(() =>
  import("@/features/admin/manage-medications.page").then((m) => ({ default: m.ManageMedicationsPage }))
);
const ManageInteractionsPage = lazy(() =>
  import("@/features/admin/manage-interactions.page").then((m) => ({ default: m.ManageInteractionsPage }))
);
const ImportInteractionsPage = lazy(() =>
  import("@/features/admin/import-interactions.page").then((m) => ({ default: m.ImportInteractionsPage }))
);
const ManageGuidesPage = lazy(() =>
  import("@/features/admin/manage-guides.page").then((m) => ({ default: m.ManageGuidesPage }))
);
const ManagePharmaciesPage = lazy(() =>
  import("@/features/admin/manage-pharmacies.page").then((m) => ({ default: m.ManagePharmaciesPage }))
);
const ManageUsersPage = lazy(() =>
  import("@/features/admin/manage-users.page").then((m) => ({ default: m.ManageUsersPage }))
);
const NotFoundPage = lazy(() =>
  import("@/features/misc/not-found.page").then((m) => ({ default: m.NotFoundPage }))
);

function withSkeleton(element: ReactNode) {
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>;
}

function ProtectedRoute({ element }: { element: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return element;
}

function AdminRoute({ element }: { element: ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;
  return element;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PageLayout />,
    children: [
      { index: true, element: withSkeleton(<BerandaPage />) },
      { path: "obat", element: withSkeleton(<ObatPage />) },
      { path: "interaksi", element: withSkeleton(<InteraksiPage />) },
      { path: "dosis", element: withSkeleton(<DosisPage />) },
      { path: "panduan", element: withSkeleton(<PanduanPage />) },
      { path: "apotek", element: withSkeleton(<ApotekPage />) },
      { path: "tanya", element: withSkeleton(<TanyaPage />) },
      { path: "dashboard", element: <ProtectedRoute element={withSkeleton(<DashboardPage />)} /> },
      { path: "pengingat", element: <ProtectedRoute element={withSkeleton(<PengingatPage />)} /> },
      { path: "riwayat", element: <ProtectedRoute element={withSkeleton(<RiwayatPage />)} /> },
      { path: "profil", element: <ProtectedRoute element={withSkeleton(<ProfilePage />)} /> },
      { path: "pengaturan", element: <ProtectedRoute element={withSkeleton(<PengaturanPage />)} /> },
      { path: "*", element: withSkeleton(<NotFoundPage />) },
    ],
  },
  {
    path: "/login",
    element: <AuthLayout />,
    children: [{ index: true, element: withSkeleton(<LoginPage />) }],
  },
  {
    path: "/register",
    element: <AuthLayout />,
    children: [{ index: true, element: withSkeleton(<RegisterPage />) }],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminRoute element={withSkeleton(<AdminDashboardPage />)} /> },
      { path: "obat", element: <AdminRoute element={withSkeleton(<ManageMedicationsPage />)} /> },
      { path: "interaksi", element: <AdminRoute element={withSkeleton(<ManageInteractionsPage />)} /> },
      { path: "import", element: <AdminRoute element={withSkeleton(<ImportInteractionsPage />)} /> },
      { path: "panduan", element: <AdminRoute element={withSkeleton(<ManageGuidesPage />)} /> },
      { path: "apotek", element: <AdminRoute element={withSkeleton(<ManagePharmaciesPage />)} /> },
      { path: "konten", element: <Navigate to="/admin/panduan" replace /> },
      { path: "pengguna", element: <AdminRoute element={withSkeleton(<ManageUsersPage />)} /> },
    ],
  },
]);
