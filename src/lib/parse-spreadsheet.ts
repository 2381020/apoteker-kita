import Papa from "papaparse";
import * as XLSX from "xlsx";

export async function parseSpreadsheetFile<T>(file: File): Promise<T[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const dataSheetName = workbook.SheetNames.find(
      (name) => name.trim().toLowerCase() === "data"
    );
    const sheetName = dataSheetName ?? workbook.SheetNames[0];

    if (!sheetName) return [];

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });

    return rows.map((row) => {
      const trimmed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        trimmed[key.trim()] = value;
      }
      return trimmed as T;
    });
  }

  const text = await file.text();
  const parsed = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  return parsed.data;
}