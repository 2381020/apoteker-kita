import { useEffect, useState } from "react";
import { History, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { listHistory } from "@/services/history.service";
import type { ConsumptionHistory } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

const statusMeta: Record<
  string,
  { variant: "success" | "warning" | "secondary"; label: string }
> = {
  ditempuh: { variant: "success", label: "Ditempuh" },
  lewat: { variant: "warning", label: "Lewat" },
  dilewati: { variant: "secondary", label: "Dilewati" },
};

export function RiwayatPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ConsumptionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    listHistory(user.id)
      .then((rows) => {
        if (active) setHistory(rows);
      })
      .catch(() => {
        if (active) setHistory([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) return <PageSkeleton />;

  const ditempuh = history.filter((h) => h.status === "ditempuh").length;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Riwayat Konsumsi"
        description={`Catatan obat yang telah Anda konsumsi. ${ditempuh} dosis berhasil ditempuh.`}
        icon={History}
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-main-text">
            Semua Riwayat
          </h2>
        </div>
        {history.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CheckCircle2}
              title="Belum ada riwayat konsumsi"
              description="Catatan obat yang telah Anda konsumsi akan muncul di sini."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {history.map((h) => {
              const meta = statusMeta[h.status] ?? statusMeta.dilewati;
              return (
                <li
                  key={h.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-main-text">
                      {h.medicationName}
                    </p>
                    <p className="text-xs text-secondary-text">
                      {h.dosage} •{" "}
                      {new Date(h.takenAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant={meta.variant} className="shrink-0">
                    {meta.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
