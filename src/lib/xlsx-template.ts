import * as XLSX from "xlsx";

const MEDICATION_HEADERS = [
  "Nama",
  "Nama Generik",
  "Merk",
  "Kategori",
  "Deskripsi",
  "Kegunaan",
  "Bentuk Sediaan",
  "Kekuatan",
  "Efek Samping",
  "Kontraindikasi",
  "Penyimpanan",
  "Obat Keras",
];

const MEDICATION_EXAMPLE = [
  "Paracetamol",
  "Paracetamol",
  "Panadol",
  "Analgesik",
  "Obat pereda nyeri dan penurun demam.",
  "Meredakan nyeri ringan; Menurunkan demam",
  "Tablet",
  "500 mg",
  "Mual; Ruam kulit",
  "Gagal hati berat",
  "Suhu kamar di bawah 30°C",
  "Tidak",
];

const PHARMACY_HEADERS = [
  "Nama",
  "Alamat",
  "Kota",
  "Telepon",
  "Jarak",
  "Rating",
  "Buka",
  "Layanan",
];

const PHARMACY_EXAMPLE = [
  "Apotek Sehat Jaya",
  "Jl. Kesehatan No. 10",
  "Jakarta Selatan",
  "021-123456",
  "1,2 km",
  4.5,
  "Ya",
  "Antar obat; Konsultasi apoteker",
];

type SheetSpec = {
  name: string;
  rows: (string | number)[][];
  widths?: number[];
};

function buildWorkbook(sheets: SheetSpec[]): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.rows);
    const columnCount = Math.max(...sheet.rows.map((row) => row.length));

    worksheet["!cols"] = Array.from({ length: columnCount }, (_, index) => ({
      wch: sheet.widths?.[index] ?? 18,
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }

  return workbook;
}

export function downloadMedicationTemplate() {
  const guideline: (string | number)[][] = [
    ["PETUNJUK PENGISIAN TEMPLATE OBAT"],
    [],
    ["1.", "Isi data pada sheet \"Data\". Jangan mengubah nama kolom pada baris pertama."],
    ["2.", "Kolom Kegunaan, Efek Samping, dan Kontraindikasi: pisahkan setiap item dengan titik koma (;)."],
    ["3.", "Kolom Obat Keras: isi \"Ya\" atau \"Tidak\"."],
    ["4.", "Baris contoh di bawah hanya ilustrasi. Jangan menyalin baris contoh ke sheet Data."],
    [],
    ["CONTOH PENGISIAN"],
    MEDICATION_HEADERS,
    MEDICATION_EXAMPLE,
  ];

  const workbook = buildWorkbook([
    {
      name: "Petunjuk",
      rows: guideline,
      widths: [5, 70, 18, 18, 30, 30, 16, 12, 20, 20, 26, 12],
    },
    {
      name: "Data",
      rows: [MEDICATION_HEADERS],
      widths: [18, 18, 16, 16, 32, 30, 16, 12, 22, 22, 26, 12],
    },
  ]);

  XLSX.writeFile(workbook, "template-obat.xlsx");
}

export function downloadPharmacyTemplate() {
  const guideline: (string | number)[][] = [
    ["PETUNJUK PENGISIAN TEMPLATE APOTEK"],
    [],
    ["1.", "Isi data pada sheet \"Data\". Jangan mengubah nama kolom pada baris pertama."],
    ["2.", "Kolom Layanan: pisahkan setiap layanan dengan titik koma (;)."],
    ["3.", "Kolom Buka: isi \"Ya\" atau \"Tidak\"."],
    ["4.", "Kolom Rating: isi angka 0 sampai 5 (contoh: 4.5)."],
    ["5.", "Baris contoh di bawah hanya ilustrasi. Jangan menyalin baris contoh ke sheet Data."],
    [],
    ["CONTOH PENGISIAN"],
    PHARMACY_HEADERS,
    PHARMACY_EXAMPLE,
  ];

  const workbook = buildWorkbook([
    {
      name: "Petunjuk",
      rows: guideline,
      widths: [5, 68, 18, 18, 16, 10, 10, 34],
    },
    {
      name: "Data",
      rows: [PHARMACY_HEADERS],
      widths: [22, 32, 18, 16, 12, 10, 10, 34],
    },
  ]);

  XLSX.writeFile(workbook, "template-apotek.xlsx");
}
