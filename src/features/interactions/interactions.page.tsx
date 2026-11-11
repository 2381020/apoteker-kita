
import { useMemo, useState } from "react";
import {
  ShieldAlert,
  SearchCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Info,
  Loader2,
  AlertCircle,
  Database,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { findInteraction } from "@/services/interactions.service";
import { DrugCombobox } from "@/components/shared/drug-combobox";
import type { Interaction } from "@/types";
import { cn } from "@/lib/utils";

type Severity = "ringan" | "sedang" | "berat" | "tidak diketahui";

type CheckResult = {
  a: string;
  b: string;
  items: Interaction[];
};

const severityMeta: Record<
  Severity,
  {
    variant: "success" | "warning" | "danger" | "secondary";
    label: string;
    level: string;
  }
> = {
  ringan: {
    variant: "success",
    label: "Ringan",
    level: "Risiko rendah",
  },
  sedang: {
    variant: "warning",
    label: "Sedang",
    level: "Risiko sedang",
  },
  berat: {
    variant: "danger",
    label: "Berat",
    level: "Risiko tinggi",
  },
  "tidak diketahui": {
    variant: "secondary",
    label: "Tidak diketahui",
    level: "Belum terklasifikasi",
  },
};

const severityRank: Record<Severity, number> = {
  "tidak diketahui": 0,
  ringan: 1,
  sedang: 2,
  berat: 3,
};

function isSeverity(value: string): value is Severity {
  return (
    value === "ringan" ||
    value === "sedang" ||
    value === "berat" ||
    value === "tidak diketahui"
  );
}

function getMaxSeverity(items: Interaction[]): Severity | null {
  return items.reduce<Severity | null>((highest, item) => {
    if (!isSeverity(item.severity)) return highest;

    if (!highest || severityRank[item.severity] > severityRank[highest]) {
      return item.severity;
    }

    return highest;
  }, null);
}

// =====================================================
// INTERACTION ITEM
// =====================================================

function InteractionItem({
  interaction,
}: {
  interaction: Interaction;
}) {
  const severity = isSeverity(interaction.severity)
    ? interaction.severity
    : null;

  const meta = severity ? severityMeta[severity] : null;

  let sourceInfo = "";

  if (interaction.source) {
    sourceInfo = interaction.source;

    if (interaction.source === "DDInter 2.0") {
      if (interaction.ddinterId) {
        sourceInfo += ` · ID: ${interaction.ddinterId}`;
      }

      if (interaction.originalSeverity) {
        sourceInfo += ` · Level asli: ${interaction.originalSeverity}`;
      }
    }
  }

  return (
    <div className="border-t border-[#e8eeee] py-5 first:border-t-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#263b3b]">
          {interaction.medicationA}
          <Plus size={14} className="text-[#849494]" />
          {interaction.medicationB}
        </h3>

        <Badge variant={meta?.variant ?? "secondary"}>
          {meta?.label ?? "Belum diklasifikasikan"}
        </Badge>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-[#526767]">
          Deskripsi interaksi
        </p>

        <p className="mt-2 text-sm leading-6 text-[#607575]">
          {interaction.description}
        </p>
      </div>

      <div className="mt-4 border-l-2 border-[#15968b] pl-3">
        <p className="text-xs font-semibold text-[#526767]">
          Rekomendasi
        </p>

        <p className="mt-2 text-sm leading-6 text-[#607575]">
          {interaction.recommendation}
        </p>
      </div>

      {sourceInfo && (
        <p className="mt-4 flex items-center gap-2 text-xs text-[#849494]">
          <Database size={13} />
          Sumber: {sourceInfo}
        </p>
      )}
    </div>
  );
}

// =====================================================
// INTERACTION RESULTS
// =====================================================

function InteractionResults({
  result,
  checkedAt,
  maxSeverity,
  fromDataset,
}: {
  result: CheckResult;
  checkedAt: string;
  maxSeverity: Severity | null;
  fromDataset: boolean;
}) {
  const hasInteractions = result.items.length > 0;

  const isHighRisk = maxSeverity === "berat";
  const isMediumRisk = maxSeverity === "sedang";

  let statusLabel = "Tidak ditemukan";
  let disclaimer = "";
  let sourceText = "";

  if (fromDataset) {
    statusLabel = "Ditemukan dari dataset DDInter 2.0";
    disclaimer =
      "Dataset DDInter 2.0 tidak mencakup seluruh obat di Indonesia. Hasil ini merupakan informasi pendukung, bukan pengganti konsultasi medis.";
    sourceText = "DDInter 2.0 (dataset terbuka)";
  } else if (hasInteractions) {
    statusLabel = "Interaksi ditemukan";
    disclaimer =
      "Konsultasikan kombinasi obat kepada dokter atau apoteker sebelum menggunakannya.";
    sourceText = "Basis data aplikasi";
  } else {
    disclaimer =
      "Basis data tidak menemukan interaksi untuk kombinasi ini. Namun, hal tersebut bukan jaminan bahwa kombinasi obat sepenuhnya aman.";
    sourceText = "Basis data aplikasi";
  }

  return (
    <Card className="overflow-hidden rounded-lg border border-[#e5ebeb] bg-white shadow-none">

      {/* Result heading */}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9eeee] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          {hasInteractions ? (
            <ShieldAlert
              size={20}
              className="text-[#b77936]"
            />
          ) : (
            <CheckCircle2
              size={20}
              className="text-[#168b7e]"
            />
          )}

          <div>
            <h2 className="text-base font-semibold text-[#263b3b]">
              Hasil pemeriksaan
            </h2>

            <p className="mt-1 text-xs text-[#758787]">
              Diperiksa pukul {checkedAt}
            </p>
          </div>
        </div>

        {maxSeverity ? (
          <Badge variant={severityMeta[maxSeverity].variant}>
            {severityMeta[maxSeverity].level}
          </Badge>
        ) : hasInteractions ? (
          <Badge variant="secondary">
            Risiko belum diklasifikasikan
          </Badge>
        ) : (
          <Badge variant="success">
            Tidak ditemukan
          </Badge>
        )}
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">

        {/* Medication combination */}

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#263b3b]">
          <span>{result.a}</span>
          <Plus size={14} className="text-[#849494]" />
          <span>{result.b}</span>
        </div>

        {hasInteractions ? (
          <div className="mt-5">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-[#263b3b]">
                Detail interaksi
              </h3>

              <p className="mt-1 text-xs text-[#758787]">
                Ditemukan {result.items.length} catatan interaksi.
              </p>
            </div>

            {result.items.map((interaction) => (
              <InteractionItem
                key={interaction.id}
                interaction={interaction}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 border-t border-[#e9eeee] pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={21}
                className="mt-0.5 shrink-0 text-[#168b7e]"
              />

              <div>
                <h3 className="text-sm font-semibold text-[#263b3b]">
                  {statusLabel}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#687d7d]">
                  {disclaimer}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}

        <div className="mt-5 border-t border-[#e9eeee] pt-4">
          <p className="text-xs leading-6 text-[#849494]">
            Hasil pemeriksaan berdasarkan data interaksi yang tersedia
            pada aplikasi. Sumber: {sourceText}. Selalu konsultasikan
            kombinasi obat kepada dokter atau apoteker, terutama jika
            memiliki kondisi kesehatan tertentu atau menggunakan obat
            lainnya.
          </p>
        </div>
      </div>
    </Card>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export function InteraksiPage() {
  const [obatA, setObatA] = useState("");
  const [obatB, setObatB] = useState("");

  const [result, setResult] = useState<CheckResult | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [fromDataset, setFromDataset] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxSeverity = useMemo(
    () => (result ? getMaxSeverity(result.items) : null),
    [result]
  );

  const canCheck =
    Boolean(obatA) &&
    Boolean(obatB) &&
    obatA !== obatB &&
    !loading;

  const hasInput = Boolean(obatA || obatB || result);

  const handleMedicationChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setResult(null);
    setCheckedAt(null);
    setFromDataset(false);
    setError(null);
  };

  const handleCheck = async () => {
    if (!canCheck) return;

    setLoading(true);
    setError(null);

    try {
      const {
        found,
        interaction,
        fromDataset: datasetFound,
      } = await findInteraction(obatA, obatB);

      setFromDataset(datasetFound);

      setResult({
        a: obatA,
        b: obatB,
        items: found && interaction ? [interaction] : [],
      });

      setCheckedAt(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (err) {
      console.error("Gagal memeriksa interaksi obat:", err);

      setError(
        "Terjadi kesalahan saat memeriksa interaksi obat. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setObatA("");
    setObatB("");
    setResult(null);
    setCheckedAt(null);
    setFromDataset(false);
    setError(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5 pb-8">

      {/* Main checker panel */}

      <Card className="overflow-visible rounded-lg border border-[#e6ebeb] bg-white shadow-none">

        {/* Panel heading */}

        <div className="flex items-center gap-3 border-b border-[#edf0f0] px-4 py-4 sm:gap-4 sm:px-6 sm:py-6">
          <SearchCheck
            size={22}
            strokeWidth={2}
            className="shrink-0 text-[#263b3b]"
          />

          <div>
            <h1 className="text-base font-semibold text-[#263b3b]">
              Periksa kombinasi obat
            </h1>

            <p className="mt-1 text-sm text-[#718282]">
              Pilih dua obat yang ingin diperiksa.
            </p>
          </div>
        </div>

        {/* Form */}

        <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">

          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_48px_1fr]">

            {/* First medication */}

            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="obatA"
                  className="text-sm font-semibold text-[#263b3b]"
                >
                  Obat pertama
                </Label>

                <span className="text-sm text-[#718282]">
                  Obat A
                </span>
              </div>

              <DrugCombobox
                id="obatA"
                value={obatA}
                exclude={obatB}
                onChange={(value) =>
                  handleMedicationChange(setObatA, value)
                }
                placeholder="Cari nama obat pertama..."
              />
            </div>

            {/* Separator */}

            <div className="hidden items-center justify-center pb-1 md:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e5ebeb] text-[#718282]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 7h14l-4-4" />
                  <path d="m21 7-4 4" />
                  <path d="M17 17H3l4 4" />
                  <path d="m3 17 4-4" />
                </svg>
              </div>
            </div>

            {/* Second medication */}

            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="obatB"
                  className="text-sm font-semibold text-[#263b3b]"
                >
                  Obat kedua
                </Label>

                <span className="text-sm text-[#718282]">
                  Obat B
                </span>
              </div>

              <DrugCombobox
                id="obatB"
                value={obatB}
                exclude={obatA}
                onChange={(value) =>
                  handleMedicationChange(setObatB, value)
                }
                placeholder="Cari nama obat kedua..."
              />
            </div>
          </div>

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm leading-6 text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}

          <div className="flex flex-col gap-3 border-t border-[#edf0f0] pt-5 sm:flex-row">

            <Button
              onClick={handleCheck}
              disabled={!canCheck}
              size="lg"
              className={cn(
                "h-[54px] flex-1 rounded-md text-base font-semibold shadow-none transition-colors",
                canCheck
                  ? "bg-[#118d83] text-white hover:bg-[#08776e]"
                  : "bg-[#89b9b3] text-white opacity-100 hover:bg-[#89b9b3] disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="mr-2 animate-spin"
                  />
                  Memeriksa...
                </>
              ) : (
                <>
                  <SearchCheck size={18} className="mr-2" />
                  Periksa Interaksi Obat
                </>
              )}
            </Button>

            {hasInput && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={loading}
                className="h-[54px] rounded-md border-[#dce5e5] px-5 text-[#526767] shadow-none hover:bg-[#f5f8f8]"
              >
                <Trash2 size={16} className="mr-2" />
                Reset
              </Button>
            )}
          </div>

          {/* Information notice */}

          <div className="flex items-start gap-3 rounded-lg bg-[#fafbfb] px-4 py-4">
            <Info
              size={17}
              className="mt-0.5 shrink-0 text-[#708585]"
            />

            <p className="text-sm leading-7 text-[#718282]">
              Pastikan nama obat yang dipilih sudah benar. Pemeriksaan
              ini menggunakan data interaksi yang tersedia dan tidak
              menggantikan konsultasi dengan tenaga kesehatan.
            </p>
          </div>
        </div>
      </Card>

      {/* Results */}

      {result && checkedAt && (
        <div aria-live="polite">
          <InteractionResults
            result={result}
            checkedAt={checkedAt}
            maxSeverity={maxSeverity}
            fromDataset={fromDataset}
          />
        </div>
      )}
    </div>
  );
}
