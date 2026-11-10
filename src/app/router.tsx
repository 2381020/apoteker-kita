import { createBrowserRouter, Navigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { BerandaPage } from "@/features/home/home.page";
import { ObatPage } from "@/features/medications/medications.page";
import { InteraksiPage } from "@/features/interactions/interactions.page";
import { DosisPage } from "@/features/dosage-calculator/dosage.page";
import { PanduanPage } from "@/features/medication-guides/guides.page";
import { ApotekPage } from "@/features/pharmacy/pharmacy.page";
import { TanyaPage } from "@/features/chatbot/chatbot.page";
import { LoginPage } from "@/features/auth/login.page";
import { RegisterPage } from "@/features/auth/register.page";
import { DashboardPage } from "@/features/dashboard/dashboard.page";
import { PengingatPage } from "@/features/reminders/reminders.page";
import { RiwayatPage } from "@/features/dashboard/riwayat.page";
import { ProfilePage } from "@/features/profile/profile.page";
import { PengaturanPage } from "@/features/profile/pengaturan.page";
import { AdminDashboardPage } from "@/features/admin/admin-dashboard.page";
import { ManageMedicationsPage } from "@/features/admin/manage-medications.page";
import { ManageInteractionsPage } from "@/features/admin/manage-interactions.page";
import { ImportInteractionsPage } from "@/features/admin/import-interactions.page";
import { ManageGuidesPage } from "@/features/admin/manage-guides.page";
import { ManagePharmaciesPage } from "@/features/admin/manage-pharmacies.page";
import { ManageUsersPage } from "@/features/admin/manage-users.page";
import { NotFoundPage } from "@/features/misc/not-found.page";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return element;
}

function AdminRoute({ element }: { element: React.ReactNode }) {
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
      { index: true, element: <BerandaPage /> },
      { path: "obat", element: <ObatPage /> },
      { path: "interaksi", element: <InteraksiPage /> },
      { path: "dosis", element: <DosisPage /> },
      { path: "panduan", element: <PanduanPage /> },
      { path: "apotek", element: <ApotekPage /> },
      { path: "tanya", element: <TanyaPage /> },
      { path: "dashboard", element: <ProtectedRoute element={<DashboardPage />} /> },
      { path: "pengingat", element: <ProtectedRoute element={<PengingatPage />} /> },
      { path: "riwayat", element: <ProtectedRoute element={<RiwayatPage />} /> },
      { path: "profil", element: <ProtectedRoute element={<ProfilePage />} /> },
      { path: "pengaturan", element: <ProtectedRoute element={<PengaturanPage />} /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/login",
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: "/register",
    element: <AuthLayout />,
    children: [{ index: true, element: <RegisterPage /> }],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminRoute element={<AdminDashboardPage />} /> },
      { path: "obat", element: <AdminRoute element={<ManageMedicationsPage />} /> },
      { path: "interaksi", element: <AdminRoute element={<ManageInteractionsPage />} /> },
      { path: "import", element: <AdminRoute element={<ImportInteractionsPage />} /> },
      { path: "panduan", element: <AdminRoute element={<ManageGuidesPage />} /> },
      { path: "apotek", element: <AdminRoute element={<ManagePharmaciesPage />} /> },
      { path: "konten", element: <Navigate to="/admin/panduan" replace /> },
      { path: "pengguna", element: <AdminRoute element={<ManageUsersPage />} /> },
    ],
  },
]);
