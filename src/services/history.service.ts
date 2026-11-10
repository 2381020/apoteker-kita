import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { ConsumptionHistory, ConsumptionStatus } from "@/types";

type Row = Database["public"]["Tables"]["consumption_history"]["Row"];
type Insert = Database["public"]["Tables"]["consumption_history"]["Insert"];

export type HistoryInput = {
  medicationName: string;
  dosage: string;
  takenAt?: string;
  status?: ConsumptionStatus;
  note?: string;
};

const toHistory = (row: Row): ConsumptionHistory => ({
  id: row.id,
  userId: row.user_id,
  medicationName: row.medication_name,
  dosage: row.dosage,
  takenAt: row.taken_at,
  status: row.status,
  note: row.note ?? undefined,
});

export async function listHistory(userId: string): Promise<ConsumptionHistory[]> {
  const { data, error } = await supabase
    .from("consumption_history")
    .select("*")
    .eq("user_id", userId)
    .order("taken_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toHistory);
}

export async function createHistory(userId: string, input: HistoryInput): Promise<ConsumptionHistory> {
  const payload: Insert = {
    user_id: userId,
    medication_name: input.medicationName,
    dosage: input.dosage,
    taken_at: input.takenAt ?? new Date().toISOString(),
    status: input.status ?? "ditempuh",
    note: input.note ?? null,
  };
  const { data, error } = await supabase
    .from("consumption_history")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return toHistory(data);
}

export async function deleteHistory(id: string): Promise<void> {
  const { error } = await supabase.from("consumption_history").delete().eq("id", id);
  if (error) throw error;
}
