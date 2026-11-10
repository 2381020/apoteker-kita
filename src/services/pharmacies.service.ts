import { supabase } from "@/lib/supabase";
import { parseSpreadsheetFile } from "@/lib/parse-spreadsheet";
import type { Database } from "@/lib/database.types";
import type { Pharmacy } from "@/types";

type Row = Database["public"]["Tables"]["pharmacies"]["Row"];
type Insert = Database["public"]["Tables"]["pharmacies"]["Insert"];

export type PharmacyInput = {
  name: string;
  address: string;
  city: string;
  phone: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  services: string[];
  imageUrl?: string;
};

const toPharmacy = (row: Row): Pharmacy => ({
  id: row.id,
  name: row.name,
  address: row.address,
  city: row.city,
  phone: row.phone,
  distance: row.distance,
  rating: Number(row.rating),
  isOpen: row.is_open,
  services: row.services ?? [],
  imageUrl: row.image_url ?? undefined,
  createdAt: row.created_at,
});

const toInsert = (input: PharmacyInput): Insert => ({
  name: input.name,
  address: input.address,
  city: input.city,
  phone: input.phone,
  distance: input.distance,
  rating: input.rating,
  is_open: input.isOpen,
  services: input.services,
  image_url: input.imageUrl ?? null,
});

export async function listPharmacies(): Promise<Pharmacy[]> {
  const { data, error } = await supabase.from("pharmacies").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(toPharmacy);
}

export async function createPharmacy(input: PharmacyInput): Promise<Pharmacy> {
  const { data, error } = await supabase.from("pharmacies").insert(toInsert(input)).select().single();
  if (error) throw error;
  return toPharmacy(data);
}

export async function updatePharmacy(id: string, input: PharmacyInput): Promise<Pharmacy> {
  const { data, error } = await supabase
    .from("pharmacies")
    .update(toInsert(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toPharmacy(data);
}

export async function deletePharmacy(id: string): Promise<void> {
  const { error } = await supabase.from("pharmacies").delete().eq("id", id);
  if (error) throw error;
}

// SPREADSHEET IMPORT (CSV / XLSX)
type CsvPharmacyRow = {
  Nama?: string;
  Alamat?: string;
  Kota?: string;
  Telepon?: string;
  Jarak?: string;
  Rating?: string;
  Buka?: string;
  Layanan?: string;
};

export type ImportPharmacyResult = {
  inserted: number;
  skipped: number;
  errors: string[];
};

export async function importPharmaciesFromFile(
  file: File,
  existingNamesAddresses: Set<string>
): Promise<ImportPharmacyResult> {
  const importResult: ImportPharmacyResult = {
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const rows = await parseSpreadsheetFile<CsvPharmacyRow>(file);
    const newRows: PharmacyInput[] = [];

    for (const [index, row] of rows.entries()) {
      const name = row.Nama?.trim() ?? "";
      const address = row.Alamat?.trim() ?? "";
      const city = row.Kota?.trim() ?? "";
      const phone = row.Telepon?.trim() ?? "";
      const distance = row.Jarak?.trim() ?? "";
      const ratingString = row.Rating?.trim() ?? "";
      const rating = ratingString ? Number(ratingString) : 0;
      const isOpen = row.Buka?.trim().toLowerCase() === "ya";
      const services = (row.Layanan ?? "")
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean);

      if (!name || !address) {
        importResult.skipped++;
        importResult.errors.push(
          `Baris ${index + 2}: Nama atau Alamat kosong.`
        );
        continue;
      }

      const key = `${name.toLowerCase()}|${address.toLowerCase()}`;

      if (existingNamesAddresses.has(key)) {
        importResult.skipped++;
        continue;
      }

      newRows.push({
        name,
        address,
        city,
        phone,
        distance: distance || "0",
        rating: isOpen ? rating : 0,
        isOpen,
        services,
        imageUrl: undefined,
      });

      existingNamesAddresses.add(key);
    }

    if (newRows.length > 0) {
      const { data, error } = await supabase
        .from("pharmacies")
        .insert(
          newRows.map((input) => ({
            name: input.name,
            address: input.address,
            city: input.city,
            phone: input.phone,
            distance: input.distance,
            rating: input.rating,
            is_open: input.isOpen,
            services: input.services,
            image_url: null,
          }))
        )
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