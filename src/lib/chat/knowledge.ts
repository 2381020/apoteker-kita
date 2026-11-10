import { normalizeText } from "./text";

export interface KnowledgeEntry {
  keywords: string[];
  response: string;
}

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ["paracetamol", "demam", "nyeri", "sakit kepala"],
    response:
      "Paracetamol digunakan untuk meredakan nyeri dan menurunkan demam. Ikuti dosis pada kemasan atau anjuran tenaga medis. Jangan melebihi dosis harian yang tertera, dan hindari menggabungkannya dengan produk lain yang juga mengandung paracetamol. Konsultasikan dengan apoteker untuk dosis yang tepat.",
  },
  {
    keywords: ["antibiotik", "amoksisilin", "amoxicillin", "infeksi"],
    response:
      "Antibiotik hanya boleh digunakan dengan resep dokter. Selesaikan seluruh kursus meskipun Anda sudah merasa lebih baik, untuk mencegah resistensi obat. Jangan menggunakan antibiotik sisa untuk infeksi baru tanpa pemeriksaan.",
  },
  {
    keywords: ["maag", "asam lambung", "omeprazol", "gastritis"],
    response:
      "Omeprazol mengurangi produksi asam lambung dan umumnya diminum sebelum makan. Ikuti petunjuk dokter atau apoteker. Hindari makanan pedas dan berlemak selama pengobatan, serta konsultasikan bila keluhan menetap.",
  },
  {
    keywords: ["asma", "salbutamol", "sesak napas", "inhaler"],
    response:
      "Salbutamol adalah obat pelega saluran napas (bronkodilator) untuk asma. Gunakan sesuai petunjuk apoteker dan selalu bawa inhaler pelega. Jika sesak napas berat tidak membaik, segera cari bantuan medis.",
  },
  {
    keywords: ["diare", "loperamida"],
    response:
      "Loperamida mengatasi diare akut. Jangan digunakan jika diare disertai demam tinggi atau darah — segera ke dokter. Pastikan cukup cairan untuk mencegah dehidrasi.",
  },
  {
    keywords: ["simpan", "penyimpanan", "kulkas", "lemari pendingin"],
    response:
      "Simpan obat pada suhu kamar, jauh dari kelembapan, panas, dan sinar matahari langsung. Jauhkan dari jangkauan anak-anak. Beberapa obat memerlukan lemari pendingin sesuai petunjuk kemasan.",
  },
  {
    keywords: ["alergi", "reaksi", "gatal"],
    response:
      "Jika mengalami gatal, ruam, bengkak wajah, atau sesak napas setelah minum obat, hentikan obat dan segera periksa diri ke fasilitas kesehatan terdekat. Reaksi berat memerlukan penanganan darurat.",
  },
];

export interface KnowledgeMatch {
  entry: KnowledgeEntry;
  score: number;
}

export function matchKnowledge(query: string): KnowledgeMatch | null {
  const normalized = normalizeText(query);

  if (!normalized) return null;

  const tokens = new Set(normalized.split(" "));
  let best: KnowledgeMatch | null = null;

  for (const entry of KNOWLEDGE) {
    let score = 0;

    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (!normalizedKeyword) continue;

      if (normalizedKeyword.includes(" ")) {
        if (normalized.includes(normalizedKeyword)) score += 3;
      } else if (tokens.has(normalizedKeyword)) {
        score += 2;
      } else if (
        normalizedKeyword.length >= 5 &&
        normalized.includes(normalizedKeyword)
      ) {
        score += 1;
      }
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best;
}
