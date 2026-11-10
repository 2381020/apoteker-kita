import { AuthProvider } from "./providers";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ToastProvider } from "@/components/ui/toast";
import { ChatProvider } from "@/features/chatbot/chat-provider";
import { isSupabaseConfigured } from "@/lib/supabase";

function ConfigNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
        <h1 className="text-xl font-bold text-main-text">Supabase belum dikonfigurasi</h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary-text">
          Aplikasi membutuhkan koneksi Supabase. Ikuti langkah berikut:
        </p>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-secondary-text">
          <li>Buat project di dashboard Supabase.</li>
          <li>
            Salin <code className="rounded bg-muted px-1.5 py-0.5">.env.example</code> menjadi{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">.env.local</code>.
          </li>
          <li>Isi <code className="rounded bg-muted px-1.5 py-0.5">VITE_SUPABASE_URL</code> dan{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">VITE_SUPABASE_ANON_KEY</code>.
          </li>
          <li>Jalankan migrasi di folder <code className="rounded bg-muted px-1.5 py-0.5">supabase/migrations</code>.</li>
          <li>Restart server pengembangan.</li>
        </ol>
        <p className="mt-4 text-xs text-secondary-text">
          Detail lengkap ada di README bagian Supabase.
        </p>
      </div>
    </div>
  );
}

export function App() {
  if (!isSupabaseConfigured) return <ConfigNotice />;

  return (
    <AuthProvider>
      <ToastProvider>
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
