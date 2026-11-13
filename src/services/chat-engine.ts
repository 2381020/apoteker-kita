import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { Interaction } from "@/types";
import type { ChatAnswer, ChatMessage } from "@/lib/chatbot";
import { contentTokens } from "@/lib/chat/text";
import { matchKnowledge } from "@/lib/chat/knowledge";
import {
  detectIntent,
  EMERGENCY_MESSAGE,
  GREETING_MESSAGE,
  INTERACTION_PROMPT,
  isEmergency,
  SIDE_EFFECT_MESSAGE,
  STORAGE_MESSAGE,
} from "@/lib/chat/intents";
import { findInteraction } from "@/services/interactions.service";

type MedicationRow = Database["public"]["Tables"]["medications"]["Row"];
type GuideRow = Pick<
  Database["public"]["Tables"]["guides"]["Row"],
  "title" | "summary" | "category"
>;

const MAX_DRUGS = 3;
const MAX_TEXT = 700;

const DISCLAIMER =
  "Informasi ini bersifat edukatif dan bukan pengganti konsultasi dengan dokter atau apoteker.";

const SEVERITY_LABEL: Record<Interaction["severity"], string> = {
  ringan: "ringan",
  sedang: "sedang",
  berat: "berat",
  "tidak diketahui": "belum diketahui",
};

function buildOrFilter(tokens: string[], columns: string[]): string {
  return tokens
    .flatMap((token) => columns.map((column) => `${column}.ilike.%${token}%`))
    .join(",");
}

function truncate(value: string, max = MAX_TEXT): string {
  const clean = value.trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

function uniqueNames(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const value of values) {
    const name = value?.trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    names.push(name);
  }

  return names;
}

async function detectDrugs(query: string): Promise<string[]> {
  const tokens = contentTokens(query, 3)
    .filter((token) => !/^\d+$/.test(token))
    .slice(0, 6);
  if (tokens.length === 0) return [];

  const names: string[] = [];

  const { data: medications } = await supabase
    .from("medications")
    .select("name")
    .or(buildOrFilter(tokens, ["name", "brand", "generic_name"]))
    .limit(MAX_DRUGS);

  names.push(...(medications ?? []).map((row) => row.name));

  if (names.length === 0) {
    const { data: drugNames } = await supabase
      .from("drug_names")
      .select("name")
      .or(buildOrFilter(tokens, ["name"]))
      .limit(MAX_DRUGS);

    names.push(...(drugNames ?? []).map((row) => row.name));
  }

  return uniqueNames(names).slice(0, MAX_DRUGS);
}

function isFollowUpQuestion(query: string): boolean {
  const normalized = query.toLowerCase();
  return (
    /(^|\s)(kalau|kalo|bagaimana|gimana|dan|dengan|sama|nya|tadi|tersebut|itu|juga|lainnya|lain|kombinasi|bersamaan|plus)(\s|$|\?)/.test(
      normalized
    ) ||
    /\+/.test(normalized) ||
    /dosisnya|efeknya|interaksinya|harganya|fungsinya|kegunaannya|aman(nya)?/.test(
      normalized
    )
  );
}

async function detectDrugsWithContext(
  query: string,
  history: ChatMessage[]
): Promise<string[]> {
  const direct = await detectDrugs(query);

  if (direct.length >= 2) return direct.slice(0, MAX_DRUGS);
  if (direct.length === 1 && !isFollowUpQuestion(query)) return direct;

  const recent = history
    .filter((message) => message.isUser && message.text.trim() !== query.trim())
    .slice(-4)
    .reverse();

  const contextNames: string[] = [];
  for (const message of recent) {
    const names = await detectDrugs(message.text);
    contextNames.push(...names);
    if (uniqueNames(contextNames).length >= 2) break;
  }

  const merged = uniqueNames([...direct, ...contextNames]);
  return merged.slice(0, MAX_DRUGS);
}

async function findMedication(name: string): Promise<MedicationRow | null> {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}

function formatMedication(
  medication: MedicationRow,
  askForDosage: boolean
): string {
  const lines: string[] = [];
  const title = [medication.name, medication.brand ? `(${medication.brand})` : ""]
    .filter(Boolean)
    .join(" ");

  lines.push(
    `${title} — ${medication.generic_name || medication.category || "obat"}.`
  );

  if (medication.description) {
    lines.push(truncate(medication.description, 400));
  }

  if (medication.uses.length > 0) {
    lines.push(`Kegunaan: ${medication.uses.slice(0, 4).join(", ")}.`);
  }

  const form = [medication.dosage_form, medication.strength]
    .filter((value) => value && value.trim().length > 0)
    .join(" ");

  if (form) {
    lines.push(`Bentuk/sediaan: ${form}.`);
  }

  if (medication.side_effects.length > 0) {
    lines.push(
      `Efek samping yang umum: ${medication.side_effects.slice(0, 5).join(", ")}.`
    );
  }

  if (medication.storage) {
    lines.push(`Penyimpanan: ${truncate(medication.storage, 200)}`);
  }

  if (medication.is_prescription) {
    lines.push("Obat ini memerlukan resep dokter.");
  }

  if (askForDosage) {
    lines.push(
      "Saya tidak dapat menyarankan dosis pribadi. Ikuti petunjuk pada kemasan atau resep, dan konfirmasikan dosis dengan apoteker."
    );
  }

  lines.push(DISCLAIMER);

  return lines.join("\n\n");
}

function formatInteraction(
  first: string,
  second: string,
  interaction: Interaction,
  sourceInfo: string
): string {
  const lines = [
    `Interaksi ${first} + ${second}: tingkat ${SEVERITY_LABEL[interaction.severity]}.`,
  ];

  if (interaction.description) {
    lines.push(truncate(interaction.description));
  }

  if (interaction.recommendation) {
    lines.push(`Rekomendasi: ${truncate(interaction.recommendation)}`);
  }

  if (sourceInfo) {
    lines.push(sourceInfo);
  }

  lines.push(DISCLAIMER);

  return lines.join("\n\n");
}

async function searchGuides(query: string): Promise<GuideRow[]> {
  const tokens = contentTokens(query, 5).slice(0, 5);
  if (tokens.length === 0) return [];

  const { data, error } = await supabase
    .from("guides")
    .select("title, summary, category")
    .or(buildOrFilter(tokens, ["title", "summary"]))
    .limit(3);

  if (error) throw error;

  return data ?? [];
}

function formatGuides(guides: GuideRow[]): string {
  const items = guides.map(
    (guide) =>
      `• ${guide.title}${guide.category ? ` (${guide.category})` : ""}: ${truncate(
        guide.summary,
        220
      )}`
  );

  return [
    "Saya menemukan panduan berikut yang mungkin relevan:",
    ...items,
    "Buka menu Panduan untuk membaca artikel lengkapnya.",
    DISCLAIMER,
  ].join("\n\n");
}

const FALLBACK_MESSAGE = [
  "Maaf, saya belum menemukan jawaban yang tepat untuk pertanyaan itu.",
  "Coba sebutkan nama obat atau topik yang lebih spesifik, misalnya \"interaksi paracetamol dan amoxicillin\", \"cara simpan obat\", atau \"efek samping omeprazol\".",
  DISCLAIMER,
].join("\n\n");

export async function answerQuery(
  query: string,
  history: ChatMessage[] = []
): Promise<ChatAnswer> {
  const trimmed = query.trim();
  const intent = detectIntent(trimmed);

  if (isEmergency(trimmed)) {
    return { text: EMERGENCY_MESSAGE, intent: "darurat", source: "emergency" };
  }

  const drugs = await detectDrugsWithContext(trimmed, history);

  if (drugs.length >= 2) {
    const [first, second] = drugs;
    const result = await findInteraction(first, second);

    if (result.found && result.interaction) {
      return {
        text: formatInteraction(
          first,
          second,
          result.interaction,
          result.sourceInfo
        ),
        intent: "interaksi",
        source: "interactions",
      };
    }

    return {
      text: [
        `Tidak ditemukan catatan interaksi antara ${first} dan ${second} di basis data kami.`,
        "Tidak ditemukannya catatan bukan berarti kombinasi ini pasti aman. Tetap konsultasikan dengan apoteker atau dokter, terutama jika Anda memakai obat rutin, memiliki penyakit kronis, sedang hamil, atau menyusui.",
        DISCLAIMER,
      ].join("\n\n"),
      intent: "interaksi",
      source: "interactions",
    };
  }

  if (drugs.length === 1) {
    const medication = await findMedication(drugs[0]);

    if (medication) {
      return {
        text: formatMedication(medication, intent === "dosis"),
        intent: intent === "dosis" ? "dosis" : "info-obat",
        source: "medications",
      };
    }

    return {
      text: [
        `Saya menemukan nama obat ${drugs[0]}, tetapi detailnya belum tersedia di basis data kami.`,
        intent === "dosis"
          ? "Untuk dosis, ikuti petunjuk kemasan atau resep dan konfirmasikan dengan apoteker."
          : "Silakan periksa etiket kemasan atau tanyakan langsung kepada apoteker.",
        DISCLAIMER,
      ].join("\n\n"),
      intent: intent === "dosis" ? "dosis" : "info-obat",
      source: "medications",
    };
  }

  if (intent === "sapaan") {
    return { text: GREETING_MESSAGE, intent: "sapaan", source: "static" };
  }

  if (intent === "interaksi") {
    return {
      text: INTERACTION_PROMPT,
      intent: "interaksi",
      source: "static",
    };
  }

  if (intent === "penyimpanan") {
    return { text: STORAGE_MESSAGE, intent, source: "static" };
  }

  if (intent === "efek-samping") {
    return { text: SIDE_EFFECT_MESSAGE, intent, source: "static" };
  }

  const guides = await searchGuides(trimmed);

  if (guides.length > 0) {
    return {
      text: formatGuides(guides),
      intent: intent === "umum" ? "edukasi" : intent,
      source: "guides",
    };
  }

  const knowledge = matchKnowledge(trimmed);

  if (knowledge) {
    return {
      text: `${knowledge.entry.response}\n\n${DISCLAIMER}`,
      intent: "edukasi",
      source: "kb",
    };
  }

  return { text: FALLBACK_MESSAGE, intent: "umum", source: "fallback" };
}
