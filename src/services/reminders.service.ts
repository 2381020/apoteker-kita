import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { Reminder } from "@/types";

type Row = Database["public"]["Tables"]["reminders"]["Row"];
type Insert = Database["public"]["Tables"]["reminders"]["Insert"];

export type ReminderInput = {
  medicationName: string;
  dosage: string;
  frequency: string;
  time: string;
  startDate: string;
  endDate?: string;
};

const toReminder = (row: Row): Reminder => ({
  id: row.id,
  userId: row.user_id,
  medicationName: row.medication_name,
  dosage: row.dosage,
  frequency: row.frequency,
  time: row.time ? row.time.slice(0, 5) : "",
  startDate: row.start_date,
  endDate: row.end_date ?? undefined,
  isActive: row.is_active,
  createdAt: row.created_at,
});

const toInsert = (userId: string, input: ReminderInput): Insert => ({
  user_id: userId,
  medication_name: input.medicationName,
  dosage: input.dosage,
  frequency: input.frequency,
  time: input.time || null,
  start_date: input.startDate || new Date().toISOString().slice(0, 10),
  end_date: input.endDate || null,
});

export async function listReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toReminder);
}

export async function createReminder(userId: string, input: ReminderInput): Promise<Reminder> {
  const { data, error } = await supabase
    .from("reminders")
    .insert(toInsert(userId, input))
    .select()
    .single();
  if (error) throw error;
  return toReminder(data);
}

export async function updateReminder(id: string, input: ReminderInput): Promise<Reminder> {
  const { data, error } = await supabase
    .from("reminders")
    .update({
      medication_name: input.medicationName,
      dosage: input.dosage,
      frequency: input.frequency,
      time: input.time || null,
      start_date: input.startDate || new Date().toISOString().slice(0, 10),
      end_date: input.endDate || null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toReminder(data);
}

export async function setReminderActive(id: string, isActive: boolean): Promise<Reminder> {
  const { data, error } = await supabase
    .from("reminders")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toReminder(data);
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
}
