import { supabase } from "@/lib/supabase";
import type { Database, Json } from "@/lib/database.types";
import type {
  MedicationPreferences,
  NotificationPreferences,
  Profile,
} from "@/types";

type Row = Database["public"]["Tables"]["profiles"]["Row"];

const DEFAULT_NOTIFICATION: NotificationPreferences = {
  reminders: true,
  email: false,
  sms: false,
};

const DEFAULT_MEDICATION: MedicationPreferences = {
  preferredLanguage: "id",
  units: "metric",
};

const asNotificationPreferences = (value: Row["notification_preferences"]): NotificationPreferences => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...DEFAULT_NOTIFICATION, ...(value as Partial<NotificationPreferences>) };
  }
  return DEFAULT_NOTIFICATION;
};

const asMedicationPreferences = (value: Row["medication_preferences"]): MedicationPreferences => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...DEFAULT_MEDICATION, ...(value as Partial<MedicationPreferences>) };
  }
  return DEFAULT_MEDICATION;
};

const toProfile = (row: Row): Profile => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone ?? undefined,
  dateOfBirth: row.date_of_birth ?? undefined,
  gender: (row.gender as Profile["gender"]) ?? "",
  role: row.role,
  profilePicture: row.avatar_url ?? undefined,
  createdAt: row.created_at,
  notificationPreferences: asNotificationPreferences(row.notification_preferences),
  medicationPreferences: asMedicationPreferences(row.medication_preferences),
  updatedAt: row.updated_at,
});

export type ProfileUpdate = {
  fullName?: string;
  email?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
  notificationPreferences?: NotificationPreferences;
  medicationPreferences?: MedicationPreferences;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toProfile(data) : null;
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toProfile);
}

export async function updateProfile(userId: string, input: ProfileUpdate): Promise<Profile> {
  const payload: Database["public"]["Tables"]["profiles"]["Update"] = {};
  if (input.fullName !== undefined) payload.full_name = input.fullName;
  if (input.email !== undefined) payload.email = input.email;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.dateOfBirth !== undefined) payload.date_of_birth = input.dateOfBirth;
  if (input.gender !== undefined) payload.gender = input.gender;
  if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl;
  if (input.notificationPreferences !== undefined) {
    payload.notification_preferences = input.notificationPreferences as unknown as Json;
  }
  if (input.medicationPreferences !== undefined) {
    payload.medication_preferences = input.medicationPreferences as unknown as Json;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return toProfile(data);
}
