
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { Guide } from "@/types";

type Row = Database["public"]["Tables"]["guides"]["Row"];
type Insert = Database["public"]["Tables"]["guides"]["Insert"];

export type GuideInput = {
  title: string;
  category: string;
  summary: string;
  content: string;
  tags?: string[];
  image?: File | null;
  imageUrl?: string;
};

const toGuide = (row: Row): Guide => ({
  id: row.id,
  title: row.title,
  category: row.category,
  summary: row.summary,
  content: row.content,
  tags: row.tags ?? [],
  imageUrl: row.image_url ?? undefined,
  createdAt: row.created_at,
});

async function uploadImage(
  file: File,
  folder: string
): Promise<string | null> {
  if (!file) return null;

  const fileExt = file.name.split(".").pop();

  const fileName = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "public, max-age=31536000",
      upsert: false,
    });

  if (error) {
    console.error("Gagal upload gambar:", error);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(data.path);

  return publicUrl;
}

const toInsert = async (input: GuideInput): Promise<Insert> => {
  let image_url = input.imageUrl ?? null;

  if (input.image) {
    image_url = await uploadImage(input.image, "guides");
  }

  return {
    title: input.title,
    category: input.category,
    summary: input.summary,
    content: input.content,
    tags: input.tags ?? [],
    image_url,
  };
};

const GUIDES_CACHE_TTL = 60_000;
let guidesCache: { data: Guide[]; at: number } | null = null;

export function invalidateGuidesCache(): void {
  guidesCache = null;
}

// Mengambil seluruh panduan (dengan cache singkat agar navigasi terasa instan)
export async function listGuides(force = false): Promise<Guide[]> {
  if (
    !force &&
    guidesCache &&
    Date.now() - guidesCache.at < GUIDES_CACHE_TTL
  ) {
    return guidesCache.data;
  }

  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .order("title");

  if (error) throw error;

  const guides = (data ?? []).map(toGuide);
  guidesCache = { data: guides, at: Date.now() };
  return guides;
}

// Membuat panduan baru
export async function createGuide(input: GuideInput): Promise<Guide> {
  const insertData = await toInsert(input);

  const { data, error } = await supabase
    .from("guides")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  invalidateGuidesCache();
  return toGuide(data);
}

// Memperbarui panduan
export async function updateGuide(
  id: string,
  input: GuideInput
): Promise<Guide> {
  const insertData = await toInsert(input);

  const { data, error } = await supabase
    .from("guides")
    .update(insertData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  invalidateGuidesCache();
  return toGuide(data);
}

// Menghapus panduan
export async function deleteGuide(id: string): Promise<void> {
  const { error } = await supabase
    .from("guides")
    .delete()
    .eq("id", id);

  if (error) throw error;

  invalidateGuidesCache();
}
