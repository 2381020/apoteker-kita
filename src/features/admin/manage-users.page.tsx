import { useEffect, useState } from "react";
import { listProfiles } from "@/services/profiles.service";
import type { Profile } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserRound, SearchX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage } from "@/lib/i18n";

export function ManageUsersPage() {
  const { tr } = useLanguage();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listProfiles()
      .then((rows) => {
        if (active) setUsers(rows);
      })
      .catch(() => {
        if (active) setUsers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={tr("Kelola Pengguna")}
        description={tr("Daftar profil pengguna yang terdaftar di platform.")}
        icon={Users}
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-main-text">{tr("Pengguna Terdaftar")}</h2>
            <p className="text-sm text-secondary-text">
              {tr("{count} profil di database", { count: users.length })}
            </p>
          </div>
        </div>
        {users.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={SearchX}
              title={tr("Belum ada profil pengguna")}
              description={tr(
                "Profil pengguna yang mendaftar akan ditampilkan di sini.",
              )}
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-main-text">
                    {user.fullName.charAt(0).toUpperCase() || "U"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-main-text">{user.fullName || tr("Tanpa nama")}</p>
                    <p className="truncate text-xs text-secondary-text">{user.email}</p>
                  </div>
                </div>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="shrink-0">
                  {user.role === "admin" ? tr("Admin") : tr("Pasien")}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
