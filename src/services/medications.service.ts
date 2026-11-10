import { supabase } from "@/lib/supabase";
import { parseSpreadsheetFile } from "@/lib/parse-spreadsheet";
import type { Database } from "@/lib/database.types";

type Row = Database["public"]["Tables"]["medications"]["Row"];
type Insert = Database["public"]["Tables"]["medications"]["Insert"];

export type MedicationInput = {
  name: string;
  genericName: string;
  brand: string;
  category: string;
  description: string;
  uses: string[];
  dosageForm: string;
  strength: string;
  sideEffects: string[];
  contraindications: string[];
  storage: string;
  isPrescription: boolean;
  imageUrl?: string;
};

const toMedication = (row: Row): Medication => ({
  id: row.id,
  name: row.name,
  genericName: row.generic_name,
  brand: row.brand,
  category: row.category,
  description: row.description,
  uses: row.uses ?? [],
  dosageForm: row.dosage_form,
  strength: row.strength,
  sideEffects: row.side_effects ?? [],
  contraindications: row.contraindications ?? [],
  storage: row.storage,
  imageUrl: row.image_url ?? undefined,
  isPrescription: row.is_prescription,
  createdAt: row.created_at,
});

const toInsert = (input: MedicationInput): Insert => ({
  name: input.name,
  generic_name: input.genericName,
  brand: input.brand,
  category: input.category,
  description: input.description,
  uses: input.uses,
  dosage_form: input.dosageForm,
  strength: input.strength,
  side_effects: input.sideEffects,
  contraindications: input.contraindications,
  storage: input.storage,
  image_url: input.imageUrl ?? null,
  is_prescription: input.isPrescription,
});

export type Medication = {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  category: string;
  description: string;
  uses: string[];
  dosageForm: string;
  strength: string;
  sideEffects: string[];
  contraindications: string[];
  storage: string;
  isPrescription: boolean;
  imageUrl?: string;
  createdAt: string;
};

export type ImportMedicationResult = {
  inserted: number;
  skipped: number;
  errors: string[];
};

export async function listMedications(): Promise<Medication[]> {
  const { data, error } = await supabase.from("medications").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(toMedication);
}

export async function createMedication(input: MedicationInput): Promise<Medication> {
  const { data, error } = await supabase.from("medications").insert(toInsert(input)).select().single();
  if (error) throw error;
  return toMedication(data);
}

export async function updateMedication(id: string, input: MedicationInput): Promise<Medication> {
  const { data, error } = await supabase
    .from("medications")
    .update(toInsert(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toMedication(data);
}

export async function deleteMedication(id: string): Promise<void> {
  const { error } = await supabase.from("medications").delete().eq("id", id);
  if (error) throw error;
}

// SPREADSHEET IMPORT (CSV / XLSX)
type CsvMedicationRow = {
  Nama?: string;
  "Nama Generik"?: string;
  Merk?: string;
  Kategori?: string;
  Deskripsi?: string;
  Kegunaan?: string;
  "Bentuk Sediaan"?: string;
  Kekuatan?: string;
  "Efek Samping"?: string;
  Kontraindikasi?: string;
  Penyimpanan?: string;
  "Obat Keras"?: string;
};

const splitList = (value: string | undefined): string[] =>
  (value ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

export async function importMedicationsFromFile(
  file: File,
  existingNamesBrands: Set<string>
): Promise<ImportMedicationResult> {
  const importResult: ImportMedicationResult = {
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const rows = await parseSpreadsheetFile<CsvMedicationRow>(file);
    const newRows: MedicationInput[] = [];

    for (const [index, row] of rows.entries()) {
      const name = row.Nama?.trim() ?? "";
      const brand = row.Merk?.trim() ?? "";

      if (!name || !brand) {
        importResult.skipped++;
        importResult.errors.push(
          `Baris ${index + 2}: Nama atau Merk kosong.`
        );
        continue;
      }

      const key = `${name.toLowerCase()}|${brand.toLowerCase()}`;

      if (existingNamesBrands.has(key)) {
        importResult.skipped++;
        continue;
      }

      newRows.push({
        name,
        genericName: row["Nama Generik"]?.trim() ?? "",
        brand,
        category: row.Kategori?.trim() ?? "",
        description: row.Deskripsi?.trim() ?? "",
        uses: splitList(row.Kegunaan),
        dosageForm: row["Bentuk Sediaan"]?.trim() ?? "",
        strength: row.Kekuatan?.trim() ?? "",
        sideEffects: splitList(row["Efek Samping"]),
        contraindications: splitList(row.Kontraindikasi),
        storage: row.Penyimpanan?.trim() ?? "",
        isPrescription: row["Obat Keras"]?.trim().toLowerCase() === "ya",
      });

      existingNamesBrands.add(key);
    }

    if (newRows.length > 0) {
      const { data, error } = await supabase
        .from("medications")
        .insert(newRows.map(toInsert))
        .select("id");

      if (error) {
        importResult.errors.push(`Gagal menyimpan data: ${error.message}`);
      } else {
        importResult.inserted = data?.length ?? 0;
      }
    }
  } catch (err) {
    importResult.errors.push(
      `Gagal membaca file: ${err instanceof Error ? err.message : "Terjadi kesalahan"}`
    );
  }

  return importResult;
}