import type { ChatIntent } from "@/lib/chatbot";
import { hasAny, normalizeText, containsPhrase } from "./text";

const EMERGENCY_KEYWORDS = [
  "nyeri dada",
  "sakit dada",
  "sesak napas",
  "sesak nafas",
  "sulit bernapas",
  "sulit bernafas",
  "tidak bisa bernapas",
  "pingsan",
  "kejang",
  "overdosis",
  "kelebihan dosis",
  "keracunan",
  "perdarahan hebat",
  "muntah darah",
  "bab berdarah",
  "bengkak wajah",
  "bengkak di wajah",
  "anafilaksis",
  "syok",
  "stroke",
  "serangan jantung",
  "henti jantung",
  "bunuh diri",
];

const GREETING_KEYWORDS = [
  "halo",
  "hai",
  "hi",
  "hello",
  "selamat pagi",
  "selamat siang",
  "selamat malam",
  "terima kasih",
  "makasih",
  "assalamualaikum",
];

const INTERACTION_KEYWORDS = [
  "interaksi",
  "berinteraksi",
  "kombinasi",
  "dikombinasikan",
  "dicampur",
  "bersamaan",
  "bersama",
  "bolehkah saya minum",
  "aman tidak",
  "aman kah",
];

const DOSAGE_KEYWORDS = ["dosis", "takaran", "berapa banyak", "berapa kali", "berapa tablet"];

const STORAGE_KEYWORDS = [
  "simpan",
  "menyimpan",
  "penyimpanan",
  "disimpan",
  "kulkas",
  "lemari es",
  "suhu",
  "kadaluarsa",
  "kedaluwarsa",
  "expired",
  "tahan berapa lama",
];

const SIDE_EFFECT_KEYWORDS = [
  "efek samping",
  "efek buruk",
  "reaksi",
  "alergi",
  "gatal",
  "ruam",
  "mual",
  "pusing",
  "kembung",
  "diare",
];

const EDUCATION_KEYWORDS = [
  "apa itu",
  "pengertian",
  "penjelasan",
  "edukasi",
  "panduan",
  "tips",
  "cara minum",
  "aturan minum",
];

export function isEmergency(text: string): boolean {
  return hasAny(text, EMERGENCY_KEYWORDS);
}

export function isGreeting(text: string): boolean {
  const normalized = normalizeText(text);
  if (!normalized) return false;

  const words = normalized.split(" ");
  if (words.length <= 4 && hasAny(text, GREETING_KEYWORDS)) return true;

  return containsPhrase(normalized, "terima kasih") || containsPhrase(normalized, "makasih");
}

export function detectIntent(text: string): ChatIntent {
  if (isEmergency(text)) return "darurat";
  if (hasAny(text, INTERACTION_KEYWORDS)) return "interaksi";
  if (hasAny(text, DOSAGE_KEYWORDS)) return "dosis";
  if (hasAny(text, STORAGE_KEYWORDS)) return "penyimpanan";
  if (hasAny(text, SIDE_EFFECT_KEYWORDS)) return "efek-samping";
  if (isGreeting(text)) return "sapaan";
  if (hasAny(text, EDUCATION_KEYWORDS)) return "edukasi";
  return "umum";
}

export const EMERGENCY_MESSAGE =
  "Ini bisa merupakan kondisi darurat. Segera hentikan aktivitas, hubungi nomor darurat (119) atau pergi ke IGD/fasilitas kesehatan terdekat. Jangan mengonsumsi obat tambahan tanpa arahan tenaga medis. Jika memungkinkan, minta bantuan orang di sekitar Anda sekarang.";

export const GREETING_MESSAGE =
  "Halo! Saya asisten ApotekerKita. Saya bisa membantu informasi umum seputar obat, interaksi, penyimpanan, dan efek samping. Sebutkan nama obatnya agar saya bisa membantu lebih tepat. Informasi ini bukan pengganti konsultasi dengan dokter atau apoteker.";

export const STORAGE_MESSAGE =
  "Simpan obat pada suhu kamar (di bawah 30°C), jauh dari kelembapan, panas, dan sinar matahari langsung. Jauhkan dari jangkauan anak-anak. Jangan menyimpan obat di kamar mandi atau membekukannya kecuali petunjuk kemasan menyebutkan demikian. Periksa tanggal kedaluwarsa secara berkala.";

export const SIDE_EFFECT_MESSAGE =
  "Efek samping ringan seperti mual atau pusing bisa muncul, tetapi jika terjadi gatal, ruam, bengkak wajah, atau sesak napas, hentikan obat dan segera cari bantuan medis. Untuk efek samping yang mengganggu, konsultasikan dengan apoteker atau dokter.";

export const INTERACTION_PROMPT =
  "Sebutkan dua nama obat yang ingin dicek interaksinya, misalnya: \"interaksi paracetamol dan amoxicillin\".";
