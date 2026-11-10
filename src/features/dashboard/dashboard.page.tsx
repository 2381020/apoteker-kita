import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Pill,
  BellRing,
  CheckCircle2,
  Plus,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { listReminders } from "@/services/reminders.service";
import { listHistory } from "@/services/history.service";
import type { ConsumptionHistory, Reminder } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [history, setHistory] = useState<ConsumptionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([listReminders(user.id), listHistory(user.id)])
      .then(([nextReminders, nextHistory]) => {
        if (!active) return;
        setReminders(nextReminders);
        setHistory(nextHistory);
      })
      .catch(() => {
        if (active) {
          setReminders([]);
          setHistory([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) return <PageSkeleton />;

  const active = reminders.filter((r) => r.isActive).length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = history.filter((h) => h.takenAt.startsWith(today)).length;
  const activeReminders = reminders.filter((r) => r.isActive).slice(0, 5);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Selamat datang, ${user?.fullName}. Berikut ringkasan aktivitas obat Anda.`}
        icon={Pill}
      >
        <Button asChild>
          <Link to="/pengingat">
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Pengingat
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Obat"
          value={reminders.length}
          icon={Pill}
          description="Obat yang Anda kelola"
          accent="primary"
        />
        <StatCard
          title="Pengingat Aktif"
          value={active}
          icon={BellRing}
          description="Jadwal minum yang aktif"
          accent="secondary"
        />
        <StatCard
          title="Ditempuh Hari Ini"
          value={todayCount}
          icon={CheckCircle2}
          description="Konsumsi tercatat hari ini"
          accent="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-main-text">
              <CalendarClock className="h-5 w-5 text-primary" />
              Pengingat Mendatang
            </h2>
            <Link
              to="/pengingat"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-2">
            {activeReminders.length === 0 ? (
              <div className="px-3 py-6">
                <EmptyState
                  icon={BellRing}
                  title="Belum ada pengingat aktif"
                  description="Buat pengingat pertama Anda agar tidak melewatkan jadwal minum obat."
                  actionLabel="Buat pengingat"
                  onAction={() => navigate("/pengingat")}
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {activeReminders.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-main-text">
                        {r.medicationName}
                      </p>
                      <p className="text-xs text-secondary-text">
                        {r.dosage} · {r.frequency} · {r.time}
                      </p>
                    </div>
                    <Badge variant="success" className="shrink-0">
                      Aktif
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-main-text">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Riwayat Terkini
            </h2>
            <Link
              to="/riwayat"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-2">
            {history.slice(0, 5).length === 0 ? (
              <div className="px-3 py-6">
                <EmptyState
                  icon={CheckCircle2}
                  title="Belum ada riwayat"
                  description="Riwayat konsumsi obat Anda akan muncul di sini."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {history.slice(0, 5).map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-3 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-main-text">
                        {h.medicationName}
                      </p>
                      <p className="text-xs text-secondary-text">
                        {new Date(h.takenAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        h.status === "ditempuh"
                          ? "success"
                          : h.status === "lewat"
                            ? "warning"
                            : "secondary"
                      }
                      className="shrink-0"
                    >
                      {h.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Pill className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-main-text">
            Butuh informasi obat lain?
          </h3>
          <p className="mt-0.5 text-sm text-secondary-text">
            Jelajahi database obat atau periksa interaksi sebelum mengonsumsi
            obat baru.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/interaksi">Cek Interaksi</Link>
          </Button>
          <Button asChild>
            <Link to="/tanya">Tanya Apoteker</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
