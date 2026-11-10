import { useEffect, useMemo, useState } from "react";
import {
  createPharmacy,
  deletePharmacy,
  listPharmacies,
  updatePharmacy,
  importPharmaciesFromFile,
  type PharmacyInput,
} from "@/services/pharmacies.service";
import { type Pharmacy } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { Building2, Plus, Pencil, Trash2, SearchX, Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { useToast } from "@/components/ui/toast";
import { downloadPharmacyTemplate } from "@/lib/xlsx-template";

const PAGE_SIZE = 10;

export function ManagePharmaciesPage() {
  const { add } = useToast();
  const [list, setList] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Pharmacy>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState<{
    inserted: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPharmacies()
      .then((rows) => {
        if (active) setList(rows);
      })
      .catch(() => {
        if (active) setList([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    const existing = form.id ? list.find((x) => x.id === form.id) : undefined;
    const input: PharmacyInput = {
      name: form.name || "",
      address: form.address || "",
      city: form.city || "",
      phone: form.phone || "",
      distance: form.distance || "",
      rating: Number(form.rating) || 0,
      isOpen: !!form.isOpen,
      services: existing?.services ?? [],
      imageUrl: existing?.imageUrl,
    };

    setSaving(true);
    try {
      if (form.id) {
        const updated = await updatePharmacy(form.id, input);
        setList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        add({ title: "Apotek diperbarui", description: updated.name, variant: "success" });
      } else {
        const created = await createPharmacy(input);
        setList((prev) => [created, ...prev]);
        add({ title: "Apotek ditambahkan", description: created.name, variant: "success" });
      }
      setOpen(false);
      setForm({});
    } catch (error) {
      add({
        title: "Gagal menyimpan apotek",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const edit = (p: Pharmacy) => {
    setForm({ ...p });
    setOpen(true);
  };
  const hapus = async (id: string) => {
    const target = list.find((x) => x.id === id);
    try {
      await deletePharmacy(id);
      setList((prev) => prev.filter((x) => x.id !== id));
      add({ title: "Apotek dihapus", description: target?.name, variant: "success" });
    } catch (error) {
      add({
        title: "Gagal menghapus apotek",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const filteredList = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return list;

    return list.filter((pharmacy) =>
      [pharmacy.name, pharmacy.address, pharmacy.city]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [list, search]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));

  const pageItems = useMemo(
    () => filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredList, page]
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Kelola Apotek" description="Kelola data apotek mitra." icon={Building2}>
        <Button
          onClick={() => {
            setForm({});
            setOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Apotek
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={downloadPharmacyTemplate}>
          <Download className="mr-1.5 h-4 w-4" />
          Unduh Template
        </Button>
        <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
          <Upload className="mr-1.5 h-4 w-4" />
          Impor
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-main-text">Daftar Apotek</h2>
              <p className="mt-0.5 text-sm text-secondary-text">
                {search.trim()
                  ? `${filteredList.length} dari ${list.length} apotek`
                  : `${list.length} apotek terdaftar`}
              </p>
            </div>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Cari nama, kota, atau alamat..."
              className="sm:w-72"
            />
          </div>
        </div>
        {list.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={SearchX} title="Belum ada data apotek" description="Tambahkan apotek pertama Anda." />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={SearchX}
              title="Apotek tidak ditemukan"
              description="Coba gunakan kata kunci lain."
              actionLabel="Reset pencarian"
              onAction={() => setSearch("")}
            />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border md:hidden">
              {pageItems.map((p) => (
                <li key={p.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-main-text">{p.name}</p>
                      <p className="truncate text-xs text-secondary-text">
                        {p.address}, {p.city}
                      </p>
                    </div>
                    <Badge variant={p.isOpen ? "success" : "secondary"} className="shrink-0">
                      {p.isOpen ? "Buka" : "Tutup"}
                    </Badge>
                  </div>
                  <div className="mt-2.5 flex gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => edit(p)} aria-label={`Edit ${p.name}`}>
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(p.id)}
                      aria-label={`Hapus ${p.name}`}
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
                    <th className="px-5 py-3 font-semibold">Nama</th>
                    <th className="px-3 py-3 font-semibold">Kota</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-accent/40">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-main-text">{p.name}</p>
                        <p className="text-xs text-secondary-text">{p.address}</p>
                      </td>
                      <td className="px-3 py-3.5 text-secondary-text">{p.city}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={p.isOpen ? "success" : "secondary"}>{p.isOpen ? "Buka" : "Tutup"}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => edit(p)} aria-label={`Edit ${p.name}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(p.id)}
                            aria-label={`Hapus ${p.name}`}
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

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filteredList.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              itemLabel="apotek"
            />
          </>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen} title={form.id ? "Edit Apotek" : "Tambah Apotek"}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Apotek</Label>
              <Input id="name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sehat Jaya" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Kota</Label>
              <Input id="city" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Jakarta" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Jl. Kesehatan No. 10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="021-123456" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Jarak</Label>
              <Input id="distance" value={form.distance || ""} onChange={(e) => setForm({ ...form, distance: e.target.value })} placeholder="1,2 km" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input id="rating" type="number" min="0" max="5" step="0.1" value={form.rating ? String(form.rating) : ""} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) || 0 })} placeholder="4.5" />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-secondary-text">
              <input
                type="checkbox"
                checked={!!form.isOpen}
                onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Saat ini buka
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save} disabled={saving || !form.name?.trim()}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus apotek ini?"
        description="Data apotek akan dihapus permanen dari database."
        onConfirm={() => {
          if (deleteId) {
            void hapus(deleteId);
            setDeleteId(null);
          }
        }}
      />

      {importResult && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-secondary-text">Hasil impor:</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-lg font-semibold text-main-text">{importResult.inserted}</p>
              <p className="text-xs text-secondary-text">Disisipkan</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-main-text">{importResult.skipped}</p>
              <p className="text-xs text-secondary-text">Dilewati</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-destructive">{importResult.errors.length}</p>
              <p className="text-xs text-secondary-text">Error</p>
            </div>
          </div>
          {importResult.errors.length > 0 && (
            <div className="mt-3 rounded bg-destructive/10 p-3 text-sm text-destructive">
              <ul className="list-disc space-y-1 pl-5">
                {importResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Dialog
        open={importDialogOpen}
        onOpenChange={(o) => {
          setImportDialogOpen(o);
          if (!o) setImportResult(null);
        }}
        title="Impor Apotek dari Excel/CSV"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-text">
            Unduh template di atas, lalu isi sheet &quot;Data&quot;. Sheet
            &quot;Petunjuk&quot; berisi contoh pengisian. Kolom: Nama, Alamat,
            Kota, Telepon, Jarak, Rating, Buka, Layanan (pisahkan layanan
            dengan titik koma).
          </p>
          <Input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const existingKeys = new Set(
                list.map((p) => `${p.name.toLowerCase()}|${p.address.toLowerCase()}`)
              );
              importPharmaciesFromFile(file, existingKeys).then((result) => {
                setImportResult(result);
                setImportDialogOpen(false);
                void listPharmacies().then((rows) => {
                  setList(rows);
                  setPage(1);
                });
                add({
                  title: "Impor selesai",
                  description: `${result.inserted} apotek disisipkan, ${result.skipped} dilewati`,
                  variant: result.errors.length > 0 ? "destructive" : "success",
                });
              });
              e.target.value = "";
            }}
          />
        </div>
      </Dialog>
    </div>
  );
}
