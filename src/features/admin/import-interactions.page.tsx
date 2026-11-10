import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Play,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  checkImportReady,
  ddinterPairKey,
  importDDInterRows,
  parseDDInterCsv,
  resetDDInterData,
  type DDInterRow,
  type ImportProgress,
  type ImportResult,
} from "@/services/import.service";
import type { InteractionSeverity } from "@/types";

const severityOrder: InteractionSeverity[] = [
  "berat",
  "sedang",
  "ringan",
  "tidak diketahui",
];

const severityLabel: Record<InteractionSeverity, string> = {
  berat: "Berat",
  sedang: "Sedang",
  ringan: "Ringan",
  "tidak diketahui": "Tidak diketahui",
};

const severityVariant: Record<
  InteractionSeverity,
  "danger" | "warning" | "success" | "outline"
> = {
  berat: "danger",
  sedang: "warning",
  ringan: "success",
  "tidak diketahui": "outline",
};

type ParseStats = {
  fileCount: number;
  totalRows: number;
  duplicates: number;
  errors: string[];
};

const emptyStats: ParseStats = {
  fileCount: 0,
  totalRows: 0,
  duplicates: 0,
  errors: [],
};

export function ImportInteractionsPage() {
  const { add } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<DDInterRow[]>([]);
  const [stats, setStats] = useState<ParseStats>(emptyStats);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const severityCounts = useMemo(() => {
    const counts: Record<InteractionSeverity, number> = {
      berat: 0,
      sedang: 0,
      ringan: 0,
      "tidak diketahui": 0,
    };

    rows.forEach((row) => {
      counts[row.severity] += 1;
    });

    return counts;
  }, [rows]);

  const progressPercent = progress
    ? Math.round((progress.processed / Math.max(progress.total, 1)) * 100)
    : 0;

  const resetState = () => {
    setRows([]);
    setStats(emptyStats);
    setProgress(null);
    setResult(null);
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const selected = Array.from(fileList).filter((file) =>
      file.name.toLowerCase().endsWith(".csv")
    );

    if (selected.length === 0) {
      add({
        title: "File tidak valid",
        description: "Pilih file CSV dari dataset DDInter.",
        variant: "destructive",
      });
      return;
    }

    setFiles(selected);
    setParsing(true);
    setResult(null);
    setProgress(null);

    const merged = new Map<string, DDInterRow>();
    const errors: string[] = [];
    let totalRows = 0;
    let duplicates = 0;

    for (const file of selected) {
      try {
        const parsed = await parseDDInterCsv(file);
        totalRows += parsed.total;
        duplicates += parsed.duplicates;
        parsed.errors.forEach((error) =>
          errors.push(`${file.name}: ${error}`)
        );

        parsed.rows.forEach((row) => {
          const key = ddinterPairKey(row.medicationA, row.medicationB);

          if (merged.has(key)) {
            duplicates += 1;
            return;
          }

          merged.set(key, row);
        });
      } catch (error) {
        errors.push(
          `${file.name}: ${
            error instanceof Error ? error.message : "Gagal membaca file"
          }`
        );
      }
    }

    setRows([...merged.values()]);
    setStats({
      fileCount: selected.length,
      totalRows,
      duplicates,
      errors,
    });
    setParsing(false);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;

    setImporting(true);
    setResult(null);
    setProgress({
      processed: 0,
      total: rows.length,
      inserted: 0,
      skipped: 0,
      errors: [],
    });

    try {
      const readiness = await checkImportReady();

      if (!readiness.ready) {
        setProgress(null);
        add({
          title: "Belum siap mengimpor",
          description: readiness.message,
          variant: "destructive",
        });
        return;
      }

      const imported = await importDDInterRows(rows, setProgress);
      setResult(imported);
      add({
        title: "Import selesai",
        description: `${imported.inserted} interaksi masuk, ${imported.skipped} dilewati.`,
        variant: imported.errors.length > 0 ? "warning" : "success",
      });
    } catch (error) {
      add({
        title: "Import gagal",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const removed = await resetDDInterData();
      resetState();
      add({
        title: "Data DDInter dihapus",
        description: `${removed} interaksi dihapus dari database.`,
        variant: "success",
      });
    } catch (error) {
      add({
        title: "Gagal menghapus data",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const downloadErrors = (errors: string[]) => {
    const blob = new Blob([errors.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "error-import-ddinter.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const allErrors = [
    ...stats.errors,
    ...(result?.errors ?? []),
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Import Interaksi"
        description="Unggah dataset DDInter 2.0 (CSV) untuk mengisi data interaksi obat."
        icon={Upload}
      >
        <Button
          variant="outline"
          onClick={() => setResetOpen(true)}
          disabled={resetting}
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Hapus Data DDInter
        </Button>
      </PageHeader>

      <Card className="p-5 sm:p-6">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFiles(event.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? "border-primary bg-primary-soft"
              : "border-border bg-muted/30"
          }`}
        >
          <FileSpreadsheet size={40} className="text-primary" />
          <h2 className="mt-3 text-base font-semibold text-main-text">
            Tarik file CSV ke sini
          </h2>
          <p className="mt-1 max-w-md text-sm text-secondary-text">
            Format kolom: DDInterID_A, Drug_A, DDInterID_B, Drug_B, Level.
            Bisa pilih beberapa file sekaligus.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) void handleFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <Button
            className="mt-4"
            onClick={() => inputRef.current?.click()}
            disabled={parsing || importing}
          >
            <Upload className="mr-1.5 h-4 w-4" />
            {parsing ? "Membaca file..." : "Pilih File CSV"}
          </Button>
        </div>

        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((file) => (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2 text-main-text">
                  <FileSpreadsheet size={16} className="shrink-0 text-primary" />
                  <span className="truncate">{file.name}</span>
                </span>
                <span className="shrink-0 text-xs text-secondary-text">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </li>
            ))}
          </ul>
        )}

        {!parsing && rows.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs text-secondary-text">Baris terbaca</p>
              <p className="text-lg font-semibold text-main-text">
                {stats.totalRows.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs text-secondary-text">Siap diimpor</p>
              <p className="text-lg font-semibold text-main-text">
                {rows.length.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs text-secondary-text">Duplikat dilewati</p>
              <p className="text-lg font-semibold text-main-text">
                {stats.duplicates.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs text-secondary-text">Error baca</p>
              <p className="text-lg font-semibold text-main-text">
                {stats.errors.length.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        )}

        {!parsing && rows.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {severityOrder.map((severity) => (
              <Badge key={severity} variant={severityVariant[severity]}>
                {severityLabel[severity]}: {severityCounts[severity].toLocaleString("id-ID")}
              </Badge>
            ))}
          </div>
        )}

        {!parsing && rows.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-secondary-text">
                  <th className="px-3 py-2 font-semibold">Obat A</th>
                  <th className="px-3 py-2 font-semibold">Obat B</th>
                  <th className="px-3 py-2 font-semibold">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 10).map((row) => (
                  <tr key={ddinterPairKey(row.medicationA, row.medicationB)}>
                    <td className="px-3 py-2 text-main-text">{row.medicationA}</td>
                    <td className="px-3 py-2 text-main-text">{row.medicationB}</td>
                    <td className="px-3 py-2">
                      <Badge variant={severityVariant[row.severity]}>
                        {severityLabel[row.severity]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <p className="border-t border-border px-3 py-2 text-xs text-secondary-text">
                Menampilkan 10 dari {rows.length.toLocaleString("id-ID")} baris.
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleImport}
            disabled={parsing || importing || rows.length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            {importing ? "Mengimpor..." : "Mulai Import"}
          </Button>

          {rows.length > 0 && !importing && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setFiles([]);
                resetState();
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Bersihkan
            </Button>
          )}
        </div>

        {progress && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-main-text">Progres import</span>
              <span className="text-secondary-text">
                {progress.processed.toLocaleString("id-ID")} /{" "}
                {progress.total.toLocaleString("id-ID")} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-secondary-text">
              <span>Masuk: {progress.inserted.toLocaleString("id-ID")}</span>
              <span>Dilewati: {progress.skipped.toLocaleString("id-ID")}</span>
              {progress.errors.length > 0 && (
                <span className="text-destructive">
                  Error: {progress.errors.length}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {result && (
        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            {result.errors.length === 0 ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            )}
            <div>
              <h2 className="text-base font-semibold text-main-text">
                Import selesai
              </h2>
              <p className="mt-1 text-sm text-secondary-text">
                {result.inserted.toLocaleString("id-ID")} interaksi masuk,{" "}
                {result.skipped.toLocaleString("id-ID")} dilewati.
              </p>
            </div>
          </div>
        </Card>
      )}

      {allErrors.length > 0 && (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-main-text">
              <AlertTriangle size={18} className="text-warning" />
              Catatan / error ({allErrors.length})
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadErrors(allErrors)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Unduh Log
            </Button>
          </div>
          <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto text-sm text-secondary-text">
            {allErrors.slice(0, 100).map((error, index) => (
              <li key={`${index}-${error}`} className="rounded bg-muted/50 px-2 py-1">
                {error}
              </li>
            ))}
          </ul>
          {allErrors.length > 100 && (
            <p className="mt-2 text-xs text-secondary-text">
              Menampilkan 100 dari {allErrors.length} catatan. Unduh log untuk
              melihat semuanya.
            </p>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Hapus semua data DDInter?"
        description="Semua interaksi dengan sumber DDInter 2.0 akan dihapus dari database. Data interaksi manual tidak terpengaruh."
        confirmLabel="Ya, hapus"
        onConfirm={() => {
          void handleReset();
        }}
      />
    </div>
  );
}
