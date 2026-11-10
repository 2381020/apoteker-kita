import type { Interaction } from "@/types";

export const interactions: Interaction[] = [
  {
    id: "int-001",
    medicationA: "Amoksisilin",
    medicationB: "Metotreksat",
    severity: "berat",
    description: "Amoksisilin dapat meningkatkan kadar metotreksat dalam darah, meningkatkan risiko toksisitas medula tulang.",
    recommendation: "Hindari kombinasi atau gunakan sotto pengawasan medis ketat dengan pemantauan darah rutin.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "int-002",
    medicationA: "Paracetamol",
    medicationB: "Warfarin",
    severity: "sedang",
    description: "Penggunaan paracetamol dalam jangka panjang dapat meningkatkan efek antikoagulan warfarin dan risiko perdarahan.",
    recommendation: "Batasi penggunaan paracetamol lebih dari beberapa hari saat sedang mengonsumsi warfarin; konsultasi dokter.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "int-003",
    medicationA: "Omeprazol",
    medicationB: "Clopidogrel",
    severity: "sedang",
    description: "Omeprazol dapat mengurangi aktivasi clopidogrel, menurunkan efektivitasnya sebagai antiagregasi thrombosit.",
    recommendation: "Pertimbangkan penggunaan anti-asam alternatif seperti ranitidin; konsultasi dokter.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "int-004",
    medicationA: "Salbutamol",
    medicationB: "Propranolol",
    severity: "berat",
    description: "Propranolol dapat memblokir efek salbutamol dan memicu bronkospasme yang parah pada pasien asma.",
    recommendation: "Hindari kombinasi pada pasien asma; gunakan alternatif sotto pengawasan dokter.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "int-005",
    medicationA: "Loperamida",
    medicationB: "Antibiotik (beberapa golongan)",
    severity: "ringan",
    description: "Kombinasi dapat menunda pengangkatan patogen dari usus pada diare infeksius berat.",
    recommendation: "Jangan gunakan loperamida pada diare dengan darah atau demam tinggi tanpa saran dokter.",
    createdAt: new Date().toISOString(),
  },
];
