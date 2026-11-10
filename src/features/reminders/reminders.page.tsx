import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BellRing, CheckCircle2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  createReminder,
  deleteReminder,
  listReminders,
  setReminderActive,
  updateReminder,
  type ReminderInput,
} from "@/services/reminders.service";
import type { Reminder } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const emptyForm: ReminderInput = {
  medicationName: "",
  dosage: "",
  frequency: "",
  time: "",
  startDate: new Date().toISOString().slice(0, 10),
};

export function PengingatPage() {
  const { user } = useAuth();
  const { add } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ReminderInput>({ ...emptyForm });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    listReminders(user.id)
      .then((rows) => {
        if (active) setReminders(rows);
      })
      .catch(() => {
        if (active) setReminders([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) return <PageSkeleton />;

  const activeCount = reminders.filter((r) => r.isActive).length;

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (r: Reminder) => {
    setEditingId(r.id);
    setForm({
      medicationName: r.medicationName,
      dosage: r.dosage,
      frequency: r.frequency,
      time: r.time,
      startDate: r.startDate,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateReminder(editingId, form);
        setReminders((prev) =>
          prev.map((r) => (r.id === editingId ? updated : r)),
        );
        add({
          title: "Pengingat diperbarui",
          description: form.medicationName,
          variant: "success",
        });
      } else {
        const created = await createReminder(user.id, form);
        setReminders((prev) => [created, ...prev]);
        add({
          title: "Pengingat ditambahkan",
          description: form.medicationName,
          variant: "success",
        });
      }
      setOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
    } catch (error) {
      add({
        title: "Gagal menyimpan pengingat",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (reminder: Reminder) => {
    try {
      const updated = await setReminderActive(reminder.id, !reminder.isActive);
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? updated : r)),
      );
    } catch (error) {
      add({
        title: "Gagal mengubah status",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const hapus = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      add({
        title: "Pengingat dihapus",
        description: target?.medicationName,
        variant: "success",
      });
    } catch (error) {
      add({
        title: "Gagal menghapus pengingat",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Pengingat Obat"
        description={`Kelola jadwal minum obat Anda. ${activeCount} pengingat aktif.`}
        icon={BellRing}
      >
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Pengingat
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-main-text">
            Daftar Pengingat
          </h2>
        </div>
        {reminders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={BellRing}
              title="Belum ada pengingat"
              description="Tambahkan pengingat pertama Anda untuk jadwal minum obat."
              actionLabel="Tambah pengingat"
              onAction={openCreate}
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {reminders.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-4">
                <button
                  onClick={() => toggle(r)}
                  aria-label={
                    r.isActive ? "Nonaktifkan pengingat" : "Aktifkan pengingat"
                  }
                  aria-pressed={r.isActive}
                  className={cn(
                    "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    r.isActive
                      ? "border-success bg-success"
                      : "border-border bg-surface hover:border-success/50",
                  )}
                >
                  {r.isActive && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium text-main-text",
                      !r.isActive && "opacity-50 line-through",
                    )}
                  >
                    {r.medicationName}
                  </p>
                  <p className="text-xs text-secondary-text">
                    {r.dosage} · {r.frequency} · {r.time}
                  </p>
                </div>
                <span
                  className={cn(
                    "hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-flex",
                    r.isActive
                      ? "bg-success/10 text-[#166534]"
                      : "bg-muted text-secondary-text",
                  )}
                >
                  {r.isActive ? "Aktif" : "Nonaktif"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(r)}
                  aria-label={`Edit pengingat ${r.medicationName}`}
                  className="h-9 w-9 shrink-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteId(r.id)}
                  aria-label={`Hapus pengingat ${r.medicationName}`}
                  className="h-9 w-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditingId(null);
        }}
        title={editingId ? "Edit Pengingat" : "Tambah Pengingat Baru"}
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-text">
            Isi detail jadwal minum obat Anda.
          </p>
          <div className="space-y-2">
            <Label htmlFor="medicationName">Nama Obat</Label>
            <Input
              id="medicationName"
              value={form.medicationName}
              onChange={(e) =>
                setForm({ ...form, medicationName: e.target.value })
              }
              placeholder="Contoh: Paracetamol"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosis</Label>
              <Input
                id="dosage"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="500 mg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frekuensi</Label>
              <Input
                id="frequency"
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
                placeholder="3x/hari"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Waktu</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="mr-1.5 h-4 w-4" />
              Batal
            </Button>
            <Button
              onClick={save}
              disabled={saving || !form.medicationName.trim()}
            >
              {saving
                ? "Menyimpan..."
                : editingId
                  ? "Simpan Perubahan"
                  : "Simpan"}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus pengingat ini?"
        description="Pengingat akan dihapus permanen dari database."
        onConfirm={() => {
          if (deleteId) {
            void hapus(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
