const STOPWORDS = new Set([
  "yang",
  "dan",
  "atau",
  "itu",
  "ini",
  "saya",
  "aku",
  "kamu",
  "anda",
  "mau",
  "ingin",
  "apa",
  "apakah",
  "bagaimana",
  "gimana",
  "cara",
  "boleh",
  "bolehkah",
  "tidak",
  "tak",
  "bisa",
  "kah",
  "dong",
  "ya",
  "di",
  "ke",
  "dari",
  "untuk",
  "pada",
  "dengan",
  "adalah",
  "akan",
  "ada",
  "jam",
  "hari",
  "kali",
  "kalau",
  "jika",
  "sih",
  "deh",
  "nih",
  "saja",
  "juga",
  "lebih",
  "kurang",
  "sudah",
  "belum",
  "masih",
  "sedang",
  "mohon",
  "tolong",
  "minta",
  "info",
  "informasi",
  "tentang",
  "mengenai",
  "obat",
  "obatan",
  "tablet",
  "kapsul",
  "sirup",
  "salep",
  "tetes",
  "minum",
  "diminum",
  "meminum",
  "makan",
  "dimakan",
  "konsumsi",
  "mengonsumsi",
  "resep",
  "dokter",
  "apoteker",
  "apotek",
  "beli",
  "membeli",
  "harga",
]);

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  const normalized = normalizeText(input);
  return normalized ? normalized.split(" ") : [];
}

export function contentTokens(input: string, minLength = 4): string[] {
  return Array.from(
    new Set(
      tokenize(input).filter(
        (token) => token.length >= minLength && !STOPWORDS.has(token)
      )
    )
  );
}

export function containsPhrase(normalizedText: string, phrase: string): boolean {
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedPhrase) return false;

  return ` ${normalizedText} `.includes(` ${normalizedPhrase} `);
}

export function hasAny(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => containsPhrase(normalized, keyword));
}

export function isStopword(token: string): boolean {
  return STOPWORDS.has(token);
}
