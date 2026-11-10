
import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "guide-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function uploadGuideImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Format gambar harus JPG, PNG, atau WEBP.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Gagal mengunggah gambar: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteGuideImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  const url = new URL(imageUrl);
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const markerIndex = url.pathname.indexOf(marker);

  // Jangan menghapus URL gambar yang bukan dari bucket ini.
  if (markerIndex === -1) return;

  const filePath = decodeURIComponent(
    url.pathname.slice(markerIndex + marker.length)
  );

  if (!filePath) return;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Gagal menghapus gambar: ${error.message}`);
  }
}
