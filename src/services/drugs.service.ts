import { supabase } from "@/lib/supabase";

async function searchFromMedications(
  query: string,
  limit: number
): Promise<string[]> {
  let request = supabase.from("medications").select("name").limit(limit);

  if (query) {
    request = request.ilike("name", `%${query}%`);
  }

  const { data, error } = await request.order("name");

  if (error) return [];
  return (data ?? []).map((row) => row.name);
}

export async function searchDrugNames(
  query: string,
  limit = 20
): Promise<string[]> {
  const { data, error } = await supabase.rpc("search_drug_names", {
    q: query,
    lim: limit,
  });

  if (error) {
    // Sebelum migrasi dataset dijalankan, fallback ke daftar obat lokal.
    return searchFromMedications(query, limit);
  }

  return (data ?? []).map((row) => row.name);
}
