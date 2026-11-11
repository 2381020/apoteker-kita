import { useState } from "react";
import {
  Calculator,
  Scale,
  User,
  Syringe,
  CalendarClock,
  Info,
  AlertCircle,
  Maximize2,
  Minimize2,
  X,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { MedicalDisclaimer } from "@/components/shared/medical-disclaimer";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface DosisInput {
  beratBadan: string;
  usia: string;
  satuanUsia: "hari" | "bulan" | "tahun";
  dosisPerKg: string;
  frekuensi: string;
  obatId?: string;
  obatNama?: string;
  obatKekuatan?: string;
  obatBentuk?: string;
}

interface CalculationResult {
  perDosis: number;
  totalHarian: number;
  metode: string;
  usiaKelompok: string;
  usiaHari: number;
  bsa?: number;
  konversiTablet?: number;
  konversiKapsul?: number;
  konversiSirup?: number;
  statusValidasi:
    | "terverifikasi"
    | "perhatian"
    | "melebihi_batas"
    | "referensi_tidak_tersedia";
  catatan?: string;
}

interface UsiaInfo {
  kelompok: "neonatus" | "bayi" | "anak" | "remaja" | "dewasa" | "lansia";
  dalamHari: number;
  catatan?: string;
}

const KELOMPOK_USIA: {
  kelompok: UsiaInfo["kelompok"];
  min: number;
  max: number;
  catatan?: string;
}[] = [
  {
    kelompok: "neonatus",
    min: 0,
    max: 29,
    catatan: "Dosis harus diverifikasi dokter",
  },
  { kelompok: "bayi", min: 29, max: 366 },
  { kelompok: "anak", min: 366, max: 4381 },
  { kelompok: "remaja", min: 4381, max: 6571 },
  { kelompok: "dewasa", min: 6571, max: 23726 },
  {
    kelompok: "lansia",
    min: 23726,
    max: Infinity,
    catatan: "Periksa fungsi ginjal/hati",
  },
];

function usiaKeHari(usia: number, satuan: "hari" | "bulan" | "tahun"): number {
  if (!Number.isFinite(usia) || usia < 0) return Number.NaN;
  if (satuan === "hari") return usia;
  if (satuan === "bulan") return usia * 30.4375;
  return usia * 365.25;
}

function tentukanKelompokUsia(usiaHari: number): UsiaInfo {
  const info = KELOMPOK_USIA.find(
    (item) => usiaHari >= item.min && usiaHari < item.max,
  );

  if (!info) return { kelompok: "dewasa", dalamHari: usiaHari };

  return {
    kelompok: info.kelompok,
    dalamHari: usiaHari,
    catatan: info.catatan,
  };
}

function validasiInput(
  bb: number,
  dosisPerKg: number,
  frekuensi: number,
): { valid: boolean; pesan?: string } {
  if (bb <= 0) return { valid: false, pesan: "Berat badan harus lebih dari 0" };
  if (dosisPerKg <= 0)
    return { valid: false, pesan: "Dosis per kg harus lebih dari 0" };
  if (frekuensi <= 0 || frekuensi > 365)
    return { valid: false, pesan: "Frekuensi harus 1-365 kali/hari" };
  return { valid: true };
}

function kalkulasiDosisPerKg(bbKg: number, dosisPerKg: number): number {
  return bbKg * dosisPerKg;
}

function kalkulasiTotalHarian(perDosis: number, frekuensi: number): number {
  return perDosis * frekuensi;
}

function kalkulasiBSA(tinggiCm: number, bbKg: number): number {
  return Math.sqrt((tinggiCm * bbKg) / 3600);
}

function hitungKonversiTablet(
  dosisMg: number,
  kekuatanTabletMg: number,
): number {
  if (kekuatanTabletMg <= 0) return 0;
  return dosisMg / kekuatanTabletMg;
}

function hitungKonversiKapsul(
  dosisMg: number,
  kekuatanKapsulMg: number,
): number {
  if (kekuatanKapsulMg <= 0) return 0;
  return dosisMg / kekuatanKapsulMg;
}

function hitungKonversiSirup(
  dosisMg: number,
  konsentrasiMgPer5mL: number,
): number {
  if (konsentrasiMgPer5mL <= 0) return 0;
  return (dosisMg / konsentrasiMgPer5mL) * 5;
}

export function DosisPage() {
  const [data, setData] = useState<DosisInput>({
    beratBadan: "",
    usia: "",
    satuanUsia: "tahun",
    dosisPerKg: "10",
    frekuensi: "3",
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const berat = Number(data.beratBadan) || 0;
  const dosisPerKg = Number(data.dosisPerKg) || 0;
  const frekuensi = Number(data.frekuensi) || 0;
  const usiaAngka = Number(data.usia);
  const usiaValid =
    data.usia.trim() !== "" && Number.isFinite(usiaAngka) && usiaAngka > 0;
  const usiaHari = usiaValid
    ? usiaKeHari(usiaAngka, data.satuanUsia)
    : Number.NaN;
  const usiaInfo = usiaValid ? tentukanKelompokUsia(usiaHari) : null;

  const { valid, pesan } = validasiInput(berat, dosisPerKg, frekuensi);
  const canCalculate = valid && berat > 0 && usiaValid;

  const hitung = () => {
    setResult(null);
    setLoading(true);

    setTimeout(() => {
      if (!Number.isFinite(usiaHari)) {
        setLoading(false);
        return;
      }

      const info = tentukanKelompokUsia(usiaHari);
      const perDosis = kalkulasiDosisPerKg(berat, dosisPerKg);
      const totalHarian = kalkulasiTotalHarian(perDosis, frekuensi);

      let bsa: number | undefined;
      let konversiTablet: number | undefined;
      let konversiKapsul: number | undefined;
      let konversiSirup: number | undefined;

      // BSA jika tinggi badan dimasukkan (opsional)
      if (data.beratBadan && data.beratBadan !== "") {
        // BSA tidak bisa dihitung dari hanya berat, butuh tinggi
        // Dihitung jika ada input tinggi di masa depan
      }

      // Konversi berdasarkan bentuk obat
      if (data.obatBentuk) {
        if (data.obatBentuk === "tablet" && data.obatKekuatan) {
          konversiTablet = hitungKonversiTablet(
            perDosis,
            Number(data.obatKekuatan),
          );
        }
        if (data.obatBentuk === "kapsul" && data.obatKekuatan) {
          konversiKapsul = hitungKonversiKapsul(
            perDosis,
            Number(data.obatKekuatan),
          );
        }
        if (data.obatBentuk === "sirup" && data.obatKekuatan) {
          konversiSirup = hitungKonversiSirup(
            perDosis,
            Number(data.obatKekuatan),
          );
        }
      }

      const status: CalculationResult["statusValidasi"] =
        info.kelompok === "lansia"
          ? "perhatian"
          : info.kelompok === "neonatus"
            ? "referensi_tidak_tersedia"
            : "terverifikasi";

      const catatan = info.catatan
        ? `${info.catatan}. `
        : usiaHari < 29
          ? "Berat badan neonatus: konsultasikan dengan dokter sebelum memberikan dosis"
          : undefined;

      setResult({
        perDosis,
        totalHarian,
        metode: "mg/kgBB per pemberian",
        usiaKelompok: info.kelompok,
        usiaHari,
        bsa,
        konversiTablet,
        konversiKapsul,
        konversiSirup,
        statusValidasi: status,
        catatan,
      });
      setLoading(false);
    }, 500);
  };

  const set = (key: keyof DosisInput, value: string) => {
    setData({ ...data, [key]: value });
    setResult(null);
  };

  const field = (
    key: keyof DosisInput,
    label: string,
    unit: string,
    icon: React.ElementType,
    placeholder: string,
    hint?: string,
    type?: "date" | "select",
    options?: { value: string; label: string }[],
  ) => {
    const Icon = icon;
    const val = data[key];
    const isDate = type === "date";

    if (isDate) {
      return (
        <div className="space-y-2">
          <Label htmlFor={key}>
            <span className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-primary" /> {label}
            </span>
          </Label>
          <Input
            id={key}
            type="date"
            value={val}
            onChange={(e) => set(key, e.target.value)}
            placeholder={placeholder}
            className="pr-12"
          />
          {hint && <p className="text-xs text-secondary-text">{hint}</p>}
        </div>
      );
    }

    if (type === "select" && options) {
      const optionElemen = options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ));
      return (
        <div className="space-y-2">
          <Label htmlFor={key}>
            <span className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-primary" /> {label}
            </span>
          </Label>
          <div className="relative">
            <select
              id={key}
              value={val}
              onChange={(e) => set(key, e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm text-main-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Pilih...</option>
              {optionElemen}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary-text">
              {unit}
            </span>
          </div>
          {hint && <p className="text-xs text-secondary-text">{hint}</p>}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={key}>
          <span className="flex items-center gap-1.5">
            <Icon className="h-4 w-4 text-primary" /> {label}
          </span>
        </Label>
        <div className="relative">
          <Input
            id={key}
            type="number"
            min="0"
            step="any"
            value={val}
            onChange={(e) => set(key, e.target.value)}
            placeholder={placeholder}
            className="pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary-text">
            {unit}
          </span>
        </div>
        {hint && <p className="text-xs text-secondary-text">{hint}</p>}
      </div>
    );
  };

  const renderUsiaInput = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor="usia">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" /> Usia
          </span>
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="usia"
            type="number"
            min="0"
            step="any"
            value={data.usia}
            onChange={(e) => set("usia", e.target.value)}
            placeholder="Contoh: 30"
            className="h-10 flex-1"
          />
          <select
            id="satuanUsia"
            value={data.satuanUsia}
            onChange={(e) =>
              set("satuanUsia", e.target.value as DosisInput["satuanUsia"])
            }
            className="h-10 shrink-0 rounded-md border border-input bg-surface px-3 text-sm text-main-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="tahun">Tahun</option>
            <option value="bulan">Bulan</option>
            <option value="hari">Hari</option>
          </select>
        </div>
        <p className="text-xs text-secondary-text">
          {usiaValid && usiaInfo
            ? `≈ ${Math.round(usiaHari).toLocaleString("id-ID")} hari • Kelompok ${usiaInfo.kelompok}${
                usiaInfo.catatan ? ` • ${usiaInfo.catatan}` : ""
              }`
            : "Masukkan usia dalam hari, bulan, atau tahun."}
        </p>
      </div>
    );
  };

  const renderObatSelector = () => {
    if (!data.obatId) return null;
    return (
      <div className="space-y-2">
        <Label htmlFor="obat">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-primary" /> Obat
          </span>
        </Label>
        <div className="relative">
          <select
            value={data.obatNama || ""}
            onChange={(e) => set("obatNama", e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2 text-sm text-main-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Pilih obat...</option>
            <option value="paracetamol">Paracetamol 500 mg</option>
            <option value="ibuprofen">Ibuprofen 400 mg</option>
            <option value="amoxicillin">Amoxicillin 250 mg</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary-text">
            mg
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title="Kalkulator Dosis Obat"
        description="Hitung dosis obat yang tepat berdasarkan berat badan, usia, dan metode perhitungan"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4 space-y-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-main-text uppercase tracking-wider">
            Data Pasien
          </h2>

          <div className="grid gap-4">
            {field(
              "beratBadan",
              "Berat Badan",
              "kg",
              Scale,
              "Contoh: 60",
              "Wajib diisi untuk menghitung dosis",
            )}

            {renderUsiaInput()}

            <div className="space-y-2">
              <Label htmlFor="dosisPerKg">
                <span className="flex items-center gap-1.5">
                  <Syringe className="h-4 w-4 text-primary" /> Dosis per kg (mg)
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="dosisPerKg"
                  type="number"
                  min="0"
                  step="any"
                  value={data.dosisPerKg}
                  onChange={(e) => set("dosisPerKg", e.target.value)}
                  placeholder="Contoh: 10"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary-text">
                  mg
                </span>
              </div>
              <p className="text-xs text-secondary-text">
                Rumus: BB (kg) × Dosis per kg = Dosis per pemberian (mg)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frekuensi">
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-primary" /> Frekuensi
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="frekuensi"
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  value={data.frekuensi}
                  onChange={(e) => set("frekuensi", e.target.value)}
                  placeholder="3"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary-text">
                  x/hari
                </span>
              </div>
              <p className="text-xs text-secondary-text">
                Contoh: 3 kali sehari = setiap 8 jam
              </p>
            </div>
          </div>

          {data.obatId && (
            <div className="space-y-2">{renderObatSelector()}</div>
          )}

          <Button
            onClick={hitung}
            disabled={!canCalculate || loading}
            size="lg"
            className="w-full"
          >
            {loading ? "Menghitung..." : "Hitung Dosis"}
          </Button>

          {!canCalculate && (berat > 0 || data.usia.trim()) && (
            <p className="mt-2 text-sm text-destructive text-center">
              {pesan ||
                (data.usia.trim() && !usiaValid
                  ? "Usia tidak valid"
                  : "Masukkan berat badan, usia, dan frekuensi yang valid")}
            </p>
          )}

          {berat > 0 && usiaValid && usiaInfo && (
            <p className="mt-2 text-xs text-secondary-text text-center">
              Kelompok usia:{" "}
              <span className="font-medium text-primary">
                {usiaInfo.kelompok}
              </span>
            </p>
          )}
        </Card>

        <Card className="h-full p-4 space-y-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-main-text uppercase tracking-wider">
            Hasil Perhitungan
          </h2>

          {result ? (
            <div className="space-y-4">
              {/* Info Pasien */}
              <div className="rounded-xl bg-secondary-soft p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-secondary-text">
                  Pasien
                </p>
                <p className="mt-1 font-medium text-main-text">
                  {user?.fullName || "Anonim"} • {result.usiaKelompok}
                </p>
              </div>

              {/* Metode */}
              <div className="rounded-xl bg-primary-soft p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Metode
                </p>
                <p className="mt-1 text-sm text-main-text">{result.metode}</p>
              </div>

              {/* Rumus */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-secondary-text">
                  Rumus
                </p>
                <code className="mt-1 block whitespace-pre bg-muted p-2 rounded text-xs">
                  {berat} kg × {dosisPerKg} mg/kg ={" "}
                  {result.perDosis.toLocaleString("id-ID")} mg
                </code>
              </div>

              {/* Hasil Utama */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-primary-soft/60 p-5 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary-text">
                    Dosis per kali
                  </p>
                  <p className="mt-2 text-3xl font-bold text-main-text">
                    {result.perDosis.toLocaleString("id-ID")} mg
                  </p>
                </div>

                <div className="rounded-xl border border-border p-5 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary-text">
                    Total per hari
                  </p>
                  <p className="mt-1 text-2xl font-bold text-main-text">
                    {result.totalHarian.toLocaleString("id-ID")} mg/hari
                  </p>
                </div>
              </div>

              {/* Konversi Sediaan */}
              {result.konversiTablet !== undefined &&
                result.konversiTablet > 0 && (
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-secondary-text">
                      Konversi Tablet
                    </p>
                    <p className="mt-1 text-sm text-main-text">
                      {result.konversiTablet.toFixed(1)} tablet(s) dari{" "}
                      {dosisPerKg} mg
                    </p>
                  </div>
                )}

              {result.konversiKapsul !== undefined &&
                result.konversiKapsul > 0 && (
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-secondary-text">
                      Konversi Kapsul
                    </p>
                    <p className="mt-1 text-sm text-main-text">
                      {result.konversiKapsul.toFixed(1)} kapsul(s) dari{" "}
                      {dosisPerKg} mg
                    </p>
                  </div>
                )}

              {result.konversiSirup !== undefined &&
                result.konversiSirup > 0 && (
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-secondary-text">
                      Konversi Sirup
                    </p>
                    <p className="mt-1 text-sm text-main-text">
                      {result.konversiSirup.toFixed(1)} mL dari {dosisPerKg} mg
                    </p>
                  </div>
                )}

              {/* Status Validasi */}
              <div
                className={`rounded-xl p-4 ${
                  result.statusValidasi === "terverifikasi"
                    ? "bg-primary-soft/60 border border-primary"
                    : result.statusValidasi === "perhatian"
                      ? "bg-warning/10 border border-warning"
                      : result.statusValidasi === "melebihi_batas"
                        ? "bg-destructive/10 border border-destructive"
                        : "bg-secondary-soft border border-border"
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wide">
                  {result.statusValidasi === "terverifikasi"
                    ? "Sudah terverifikasi referensi"
                    : result.statusValidasi === "perhatian"
                      ? "Perhatikan: kelompok usia Lansia"
                      : result.statusValidasi === "melebihi_batas"
                        ? "⚠️ Melebihi batas dosis referensi"
                        : "Referensi dosis tidak tersedia untuk kelompok ini"}
                </p>
                {result.catatan && (
                  <p className="mt-1 text-xs text-secondary-text">
                    {result.catatan}
                  </p>
                )}
              </div>

              {/* Catatan Keamanan */}
              <MedicalDisclaimer />
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 px-3 text-center text-secondary-text">
              <Calculator className="h-12 w-12 opacity-50" />
              <p>Masukkan data pasien di kiri lalu klik "Hitung Dosis"</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
