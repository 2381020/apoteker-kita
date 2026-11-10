import { useEffect, useMemo, useState } from "react";
import {
  createMedication,
  deleteMedication,
  listMedications,
  updateMedication,
  importMedicationsFromFile,
  type MedicationInput,
} from "@/services/medications.service";
import { type Medication } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { Pill, Plus, Pencil, Trash2, SearchX, Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { useToast } from "@/components/ui/toast";
import { downloadMedicationTemplate } from "@/lib/xlsx-template";

const PAGE_SIZE = 10;

export function ManageMedicationsPage() {
  const { add } = useToast();
  const [list, setList] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Medication>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    inserted: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listMedications()
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
    const input: MedicationInput = {
      name: form.name || "",
      genericName: form.genericName || "",
      brand: form.brand || "",
      category: form.category || "",
      description: form.description || "",
      uses: existing?.uses ?? [],
      dosageForm: form.dosageForm || existing?.dosageForm || "",
      strength: form.strength || existing?.strength || "",
      sideEffects: existing?.sideEffects ?? [],
      contraindications: existing?.contraindications ?? [],
      storage: form.storage || "",
      imageUrl: existing?.imageUrl,
      isPrescription: !!form.isPrescription,
    };

    setSaving(true);
    try {
      if (form.id) {
        const updated = await updateMedication(form.id, input);
        setList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        add({ title: "Obat diperbarui", description: updated.name, variant: "success" });
      } else {
        const created = await createMedication(input);
        setList((prev) => [created, ...prev]);
        add({ title: "Obat ditambahkan", description: created.name, variant: "success" });
      }
      setOpen(false);
      setForm({});
    } catch (error) {
      add({
        title: "Gagal menyimpan obat",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const edit = (m: Medication) => {
    setForm({ ...m });
    setOpen(true);
  };
  const hapus = async (id: string) => {
    const target = list.find((x) => x.id === id);
    try {
      await deleteMedication(id);
      setList((prev) => prev.filter((x) => x.id !== id));
      add({ title: "Obat dihapus", description: target?.name, variant: "success" });
    } catch (error) {
      add({
        title: "Gagal menghapus obat",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const filteredList = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return list;

    return list.filter((medication) =>
      [medication.name, medication.brand, medication.genericName, medication.category]
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
    <>
      <div className="animate-fade-in space-y-6">
      <PageHeader title="Kelola Obat" description="Tambah, edit, dan hapus data obat dalam database." icon={Pill}>
        <Button
          onClick={() => {
            setForm({});
            setOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Obat
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={downloadMedicationTemplate}>
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
              <h2 className="text-base font-semibold text-main-text">Daftar Obat</h2>
              <p className="mt-0.5 text-sm text-secondary-text">
                {search.trim()
                  ? `${filteredList.length} dari ${list.length} obat`
                  : `${list.length} obat terdaftar`}
              </p>
            </div>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Cari nama, merek, atau kategori..."
              className="sm:w-72"
            />
          </div>
        </div>
        {list.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={SearchX} title="Belum ada data obat" description="Tambahkan obat pertama Anda." />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={SearchX}
              title="Obat tidak ditemukan"
              description="Coba gunakan kata kunci lain."
              actionLabel="Reset pencarian"
              onAction={() => setSearch("")}
            />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border md:hidden">
              {pageItems.map((m) => (
                <li key={m.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-main-text">{m.name}</p>
                      <p className="truncate text-xs text-secondary-text">
                        {m.brand} · {m.category}
                      </p>
                    </div>
                    <Badge variant={m.isPrescription ? "danger" : "success"} className="shrink-0">
                      {m.isPrescription ? "Keras" : "Bebas"}
                    </Badge>
                  </div>
                  <div className="mt-2.5 flex gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => edit(m)} aria-label={`Edit ${m.name}`}>
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(m.id)}
                      aria-label={`Hapus ${m.name}`}
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
                    <th className="px-3 py-3 font-semibold">Kategori</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-accent/40">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-main-text">{m.name}</p>
                        <p className="text-xs text-secondary-text">{m.brand}</p>
                      </td>
                      <td className="px-3 py-3.5 text-secondary-text">{m.category}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={m.isPrescription ? "danger" : "success"}>
                          {m.isPrescription ? "Keras" : "Bebas"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => edit(m)} aria-label={`Edit ${m.name}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(m.id)}
                            aria-label={`Hapus ${m.name}`}
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
              itemLabel="obat"
            />
          </>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen} title={form.id ? "Edit Obat" : "Tambah Obat"}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Obat</Label>
              <Input id="name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Paracetamol" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Merk</Label>
              <Input id="brand" value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Panadol" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generic">Nama Generik</Label>
              <Input id="generic" value={form.genericName || ""} onChange={(e) => setForm({ ...form, genericName: e.target.value })} placeholder="Paracetamol" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Pereda nyeri" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat tentang obat..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage">Penyimpanan</Label>
              <Input id="storage" value={form.storage || ""} onChange={(e) => setForm({ ...form, storage: e.target.value })} placeholder="Suhu ruangan" />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-secondary-text">
              <input
                type="checkbox"
                checked={!!form.isPrescription}
                onChange={(e) => setForm({ ...form, isPrescription: e.target.checked })}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Obat keras (butuh resep)
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
        title="Hapus obat ini?"
        description="Data obat akan dihapus permanen dari database dan tidak dapat dikembalikan."
        onConfirm={() => {
          if (deleteId) {
            void hapus(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>

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

    {importDialogOpen && (
      <Dialog
        open={importDialogOpen}
        onOpenChange={(o) => {
          setImportDialogOpen(o);
          if (!o) {
            setImportFile(null);
            setImportResult(null);
          }
        }}
        title="Impor Obat dari Excel/CSV"
      >
        <div className="p-4">
          <p className="text-sm text-secondary-text mb-4">
            Unduh template di atas, lalu isi sheet &quot;Data&quot;. Sheet
            &quot;Petunjuk&quot; berisi contoh pengisian dan penjelasan kolom.
            Format CSV juga didukung dengan kolom yang sama.
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              if (e.target.files) {
                setImportFile(e.target.files[0]);
                const existingKeys = new Set(
                  list.map((m) => `${m.name.toLowerCase()}|${m.brand.toLowerCase()}`)
                );
                importMedicationsFromFile(e.target.files[0], existingKeys).then(
                  (result) => {
                    setImportResult(result);
                    setImportDialogOpen(false);
                    setImportFile(null);
                    listMedications().then((rows) => {
                      setList(rows);
                      setPage(1);
                    });
                    add({
                      title: "Impor berhasil",
                      description: `${result.inserted} obat disisipkan, ${result.skipped} dilewati`,
                      variant: "success",
                    });
                  }
                );
              }
            }}
            className="block w-full rounded-md border border-border px-3 py-2 mb-4 text-sm"
          />
          {importResult && importResult.errors.length > 0 && (
            <div className="bg-red-100 rounded p-3 text-sm text-red-800 mb-4">
              <p>Terjadi kesalahan:</p>
              <ul className="list-disc pl-5 space-y-1">
                {importResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Dialog>
    )}
      </>
  );
}
