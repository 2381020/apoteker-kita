import { useEffect, useState } from "react";
import { listProfiles } from "@/services/profiles.service";
import type { Profile } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserRound, SearchX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export function ManageUsersPage() {
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
        title="Kelola Pengguna"
        description="Daftar profil pengguna yang terdaftar di platform."
        icon={Users}
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-main-text">Pengguna Terdaftar</h2>
            <p className="text-sm text-secondary-text">{users.length} profil di database</p>
          </div>
        </div>
        {users.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={SearchX}
              title="Belum ada profil pengguna"
              description="Profil pengguna yang mendaftar akan ditampilkan di sini."
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
                    <p className="truncate text-sm font-medium text-main-text">{user.fullName || "Tanpa nama"}</p>
                    <p className="truncate text-xs text-secondary-text">{user.email}</p>
                  </div>
                </div>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="shrink-0">
                  {user.role === "admin" ? "Admin" : "Pasien"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
