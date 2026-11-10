import Papa from "papaparse";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { InteractionSeverity } from "@/types";

type Insert = Database["public"]["Tables"]["interactions"]["Insert"];

const REQUIRED_HEADERS = [
  "DDInterID_A",
  "Drug_A",
  "DDInterID_B",
  "Drug_B",
  "Level",
];

const BATCH_SIZE = 500;

const severityMap: Record<string, InteractionSeverity> = {
  major: "berat",
  moderate: "sedang",
  minor: "ringan",
};

const recommendationBySeverity: Record<InteractionSeverity, string> = {
  berat:
    "Hindari kombinasi ini bila memungkinkan. Konsultasikan segera dengan dokter atau apoteker.",
  sedang:
    "Gunakan dengan hati-hati. Konsultasikan dengan dokter atau apoteker sebelum dikombinasikan.",
  ringan:
    "Pantau efek samping. Konsultasikan dengan dokter atau apoteker bila diperlukan.",
  "tidak diketahui":
    "Informasi tingkat keparahan belum tersedia. Konsultasikan dengan dokter atau apoteker.",
};

export type DDInterRow = {
  medicationA: string;
  medicationB: string;
  severity: InteractionSeverity;
  originalSeverity: string;
  ddinterId: string;
};

export type ParseResult = {
  rows: DDInterRow[];
  total: number;
  duplicates: number;
  errors: string[];
};

export type ImportProgress = {
  processed: number;
  total: number;
  inserted: number;
  skipped: number;
  errors: string[];
};

export type ImportResult = {
  total: number;
  inserted: number;
  skipped: number;
  errors: string[];
};

function normalizeHeader(header: string): string {
  return header.replace(/^\ufeff/, "").trim();
}

export function ddinterPairKey(a: string, b: string): string {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  return left <= right ? `${left}|${right}` : `${right}|${left}`;
}

function toSeverity(level: string): InteractionSeverity {
  return severityMap[level.toLowerCase()] ?? "tidak diketahui";
}

export function parseDDInterCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: normalizeHeader,
      complete: (result) => {
        const fields = (result.meta.fields ?? []).map(normalizeHeader);
        const missing = REQUIRED_HEADERS.filter((h) => !fields.includes(h));

        if (missing.length > 0) {
          reject(
            new Error(
              `Header CSV tidak sesuai. Kolom yang hilang: ${missing.join(", ")}`
            )
          );
          return;
        }

        const rows: DDInterRow[] = [];
        const errors: string[] = [];
        const seen = new Set<string>();
        let duplicates = 0;

        result.data.forEach((raw, index) => {
          const line = index + 2;
          const drugA = (raw.Drug_A ?? "").trim();
          const drugB = (raw.Drug_B ?? "").trim();
          const idA = (raw.DDInterID_A ?? "").trim();
          const idB = (raw.DDInterID_B ?? "").trim();
          const level = (raw.Level ?? "").trim();

          if (!drugA || !drugB) {
            errors.push(`Baris ${line}: nama obat kosong, dilewati.`);
            return;
          }

          if (drugA.toLowerCase() === drugB.toLowerCase()) {
            errors.push(`Baris ${line}: obat A dan B sama, dilewati.`);
            return;
          }

          const key = ddinterPairKey(drugA, drugB);

          if (seen.has(key)) {
            duplicates += 1;
            return;
          }

          seen.add(key);

          rows.push({
            medicationA: drugA,
            medicationB: drugB,
            severity: toSeverity(level),
            originalSeverity: level || "Unknown",
            ddinterId: idA && idB ? `${idA}-${idB}` : `${drugA}-${drugB}`,
          });
        });

        if (result.errors.length > 0) {
          result.errors.slice(0, 20).forEach((err) => {
            errors.push(`Baris ${err.row ?? "?"}: ${err.message}`);
          });
        }

        resolve({
          rows,
          total: result.data.length,
          duplicates,
          errors,
        });
      },
      error: (error) => reject(error),
    });
  });
}

function toInsert(row: DDInterRow): Insert {
  return {
    medication_a: row.medicationA,
    medication_b: row.medicationB,
    severity: row.severity,
    description: `[DDInter 2.0] Interaksi antara ${row.medicationA} dan ${row.medicationB} (level: ${row.originalSeverity}).`,
    recommendation: `[DDInter 2.0] ${recommendationBySeverity[row.severity]}`,
    source: "DDInter 2.0",
    ddinter_id: row.ddinterId,
    original_severity: row.originalSeverity,
  };
}

export async function checkImportReady(): Promise<{
  ready: boolean;
  message?: string;
}> {
  const { error } = await supabase
    .from("interactions")
    .select("pair_key")
    .limit(1);

  if (error) {
    return {
      ready: false,
      message:
        "Skema impor belum tersedia. Jalankan migrasi database terlebih dahulu.",
    };
  }

  return { ready: true };
}

export async function importDDInterRows(
  rows: DDInterRow[],
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  let inserted = 0;
  let skipped = 0;
  let processed = 0;
  const errors: string[] = [];

  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const chunk = rows.slice(start, start + BATCH_SIZE);

    const { data, error } = await supabase
      .from("interactions")
      .upsert(chunk.map(toInsert), {
        onConflict: "pair_key",
        ignoreDuplicates: true,
      })
      .select("id");

    if (error) {
      errors.push(
        `Batch ${Math.floor(start / BATCH_SIZE) + 1}: ${error.message}`
      );
      processed += chunk.length;
      skipped += chunk.length;
    } else {
      const insertedNow = data?.length ?? 0;
      inserted += insertedNow;
      skipped += chunk.length - insertedNow;
      processed += chunk.length;
    }

    onProgress?.({
      processed,
      total: rows.length,
      inserted,
      skipped,
      errors,
    });
  }

  return {
    total: rows.length,
    inserted,
    skipped,
    errors,
  };
}

export async function resetDDInterData(): Promise<number> {
  const { data, error } = await supabase.rpc("reset_ddinter_interactions");
  if (error) throw error;
  return typeof data === "number" ? data : 0;
}
