import { useCallback, useEffect, useState } from "react";
import {
  createInteraction,
  deleteInteraction,
  listInteractions,
  updateInteraction,
  type InteractionInput,
} from "@/services/interactions.service";
import { type Interaction } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Search,
  Trash2,
  SearchX,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/ui/toast";

const PAGE_SIZE = 20;

const sevVariant = (
  s: string
): "danger" | "warning" | "success" | "outline" =>
  s === "berat"
    ? "danger"
    : s === "sedang"
      ? "warning"
      : s === "ringan"
        ? "success"
        : "outline";

export function ManageInteractionsPage() {
  const { add } = useToast();
  const [list, setList] = useState<Interaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Interaction>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listInteractions({
        page,
        pageSize: PAGE_SIZE,
        search: query,
      });
      setList(result.rows);
      setTotal(result.total);
    } catch {
      setList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const save = async () => {
    const input: InteractionInput = {
      medicationA: form.medicationA || "",
      medicationB: form.medicationB || "",
      severity: form.severity || "ringan",
      description: form.description || "",
      recommendation: form.recommendation || "",
    };

    setSaving(true);
    try {
      if (form.id) {
        const updated = await updateInteraction(form.id, input);
        add({
          title: "Interaksi diperbarui",
          description: `${updated.medicationA} + ${updated.medicationB}`,
          variant: "success",
        });
      } else {
        const created = await createInteraction(input);
        add({
          title: "Interaksi ditambahkan",
          description: `${created.medicationA} + ${created.medicationB}`,
          variant: "success",
        });
      }
      setOpen(false);
      setForm({});
      await load();
    } catch (error) {
      add({
        title: "Gagal menyimpan interaksi",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const edit = (i: Interaction) => {
    setForm({ ...i });
    setOpen(true);
  };

  const hapus = async (id: string) => {
    const target = list.find((x) => x.id === id);
    try {
      await deleteInteraction(id);
      if (list.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await load();
      }
      add({
        title: "Interaksi dihapus",
        description: target ? `${target.medicationA} + ${target.medicationB}` : undefined,
        variant: "success",
      });
    } catch (error) {
      add({
        title: "Gagal menghapus interaksi",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  if (loading && list.length === 0 && !query) return <PageSkeleton />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Kelola Interaksi" description="Kelola data interaksi antar obat." icon={Activity}>
        <Button
          onClick={() => {
            setForm({});
            setOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Interaksi
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-main-text">Daftar Interaksi</h2>
          <p className="mt-0.5 text-sm text-secondary-text">
            {total.toLocaleString("id-ID")} interaksi tercatat
          </p>

          <div className="relative mt-3 max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama obat..."
              className="pl-9"
            />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={SearchX}
              title={query ? "Tidak ada hasil" : "Belum ada data interaksi"}
              description={
                query
                  ? `Tidak ditemukan interaksi untuk "${query}".`
                  : "Tambahkan interaksi atau impor dataset dari menu Import Interaksi."
              }
            />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border md:hidden">
              {list.map((i) => (
                <li key={i.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 font-medium text-main-text">
                      {i.medicationA} <span className="text-secondary-text">+</span> {i.medicationB}
                    </p>
                    <Badge variant={sevVariant(i.severity)} className="shrink-0">
                      {i.severity}
                    </Badge>
                  </div>
                  <div className="mt-2.5 flex gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => edit(i)} aria-label="Edit interaksi">
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(i.id)}
                      aria-label="Hapus interaksi"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-secondary-text">
                    <th className="px-5 py-3 font-semibold">Obat A</th>
                    <th className="px-3 py-3 font-semibold">Obat B</th>
                    <th className="px-3 py-3 font-semibold">Severity</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {list.map((i) => (
                    <tr key={i.id} className="transition-colors hover:bg-accent/40">
                      <td className="px-5 py-3.5 font-medium text-main-text">{i.medicationA}</td>
                      <td className="px-3 py-3.5 font-medium text-main-text">{i.medicationB}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={sevVariant(i.severity)}>{i.severity}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => edit(i)} aria-label="Edit interaksi">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(i.id)}
                            aria-label="Hapus interaksi"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-secondary-text">
                Menampilkan {rangeStart.toLocaleString("id-ID")}–
                {rangeEnd.toLocaleString("id-ID")} dari{" "}
                {total.toLocaleString("id-ID")} interaksi
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Sebelumnya
                </Button>
                <span className="text-xs text-secondary-text">
                  {page} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages || loading}
                >
                  Berikutnya
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen} title={form.id ? "Edit Interaksi" : "Tambah Interaksi"}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a">Obat A</Label>
              <Input id="a" value={form.medicationA || ""} onChange={(e) => setForm({ ...form, medicationA: e.target.value })} placeholder="Nama obat A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b">Obat B</Label>
              <Input id="b" value={form.medicationB || ""} onChange={(e) => setForm({ ...form, medicationB: e.target.value })} placeholder="Nama obat B" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sev">Severity</Label>
            <select
              id="sev"
              value={form.severity || "ringan"}
              onChange={(e) => setForm({ ...form, severity: e.target.value as Interaction["severity"] })}
              className="block h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="ringan">Ringan</option>
              <option value="sedang">Sedang</option>
              <option value="berat">Berat</option>
              <option value="tidak diketahui">Tidak diketahui</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Deskripsi</Label>
            <Textarea id="desc" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi interaksi..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rec">Rekomendasi</Label>
            <Textarea id="rec" value={form.recommendation || ""} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} placeholder="Rekomendasi penanganan..." />
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save} disabled={saving || !form.medicationA?.trim() || !form.medicationB?.trim()}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus interaksi ini?"
        description="Data interaksi akan dihapus permanen dari database."
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
