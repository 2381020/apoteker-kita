import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { Interaction, InteractionSeverity } from "@/types";

type Row = Database["public"]["Tables"]["interactions"]["Row"];
type Insert = Database["public"]["Tables"]["interactions"]["Insert"];

export type InteractionInput = {
  medicationA: string;
  medicationB: string;
  severity: InteractionSeverity;
  description: string;
  recommendation: string;
};

export type ListInteractionsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type InteractionListResult = {
  rows: Interaction[];
  total: number;
  page: number;
  pageSize: number;
};

const toInteraction = (row: Row): Interaction => ({
  id: row.id,
  medicationA: row.medication_a,
  medicationB: row.medication_b,
  severity: row.severity,
  description: row.description,
  recommendation: row.recommendation,
  createdAt: row.created_at,
  source: row.source,
  ddinterId: row.ddinter_id ?? undefined,
  originalSeverity: row.original_severity ?? undefined,
});

const toInsert = (input: InteractionInput): Insert => ({
  medication_a: input.medicationA,
  medication_b: input.medicationB,
  severity: input.severity,
  description: input.description,
  recommendation: input.recommendation,
});

function quoteFilterValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export async function listInteractions(
  options: ListInteractionsOptions = {}
): Promise<InteractionListResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const search = options.search?.trim();

  let query = supabase.from("interactions").select("*", { count: "exact" });

  if (search) {
    const pattern = quoteFilterValue(`%${search}%`);
    query = query.or(
      `medication_a.ilike.${pattern},medication_b.ilike.${pattern}`
    );
  }

  const { data, error, count } = await query
    .order("medication_a")
    .order("medication_b")
    .range(from, from + pageSize - 1);

  if (error) throw error;

  return {
    rows: (data ?? []).map(toInteraction),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function createInteraction(input: InteractionInput): Promise<Interaction> {
  const { data, error } = await supabase.from("interactions").insert(toInsert(input)).select().single();
  if (error) throw error;
  return toInteraction(data);
}

export async function updateInteraction(id: string, input: InteractionInput): Promise<Interaction> {
  const { data, error } = await supabase
    .from("interactions")
    .update(toInsert(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toInteraction(data);
}

export async function deleteInteraction(id: string): Promise<void> {
  const { error } = await supabase.from("interactions").delete().eq("id", id);
  if (error) throw error;
}

async function findOne(
  medicationA: string,
  medicationB: string
): Promise<Interaction | null> {
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("medication_a", medicationA)
    .eq("medication_b", medicationB)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? toInteraction(data) : null;
}

/**
 * Cari interaksi antara dua obat.
 * Mencari kedua urutan: A+B dan B+A.
 */
export async function findInteraction(
  medicationA: string,
  medicationB: string
): Promise<{
  found: boolean;
  interaction?: Interaction | null;
  fromDataset: boolean;
  sourceInfo: string;
}> {
  let interaction = await findOne(medicationA, medicationB);

  if (!interaction) {
    interaction = await findOne(medicationB, medicationA);
  }

  const fromDataset =
    interaction?.source === "DDInter 2.0" ||
    (interaction?.description ?? "").toLowerCase().includes("ddinter 2.0");

  return {
    found: interaction !== null,
    interaction,
    fromDataset,
    sourceInfo: fromDataset
      ? "Sumber: DDInter 2.0 (dataset terbuka)"
      : interaction
        ? "Sumber: Basis data aplikasi"
        : "",
  };
}
