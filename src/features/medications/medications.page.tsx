
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Pill,
  RotateCcw,
  AlertTriangle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";

import { listMedications } from "@/services/medications.service";
import type { Medication } from "@/types";

import { EmptyState } from "@/components/shared/empty-state";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";

const PAGE_SIZE = 9;

// Medication card
function MedicationCard({
  medication,
  onSelect,
}: {
  medication: Medication;
  onSelect: (medication: Medication) => void;
}) {
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow duration-200 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Pill size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-main-text">
              {medication.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-secondary-text">
              {medication.brand}
            </p>
          </div>
        </div>

        <Badge
          variant={medication.isPrescription ? "danger" : "success"}
          className="shrink-0"
        >
          {medication.isPrescription ? "Resep" : "Bebas"}
        </Badge>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-secondary-text">
        {medication.description}
      </p>

      <dl className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-secondary-text">Generik</dt>
          <dd className="text-right font-medium text-main-text">
            {medication.genericName}
          </dd>
        </div>

        <div className="flex items-start justify-between gap-3">
          <dt className="text-secondary-text">Bentuk</dt>
          <dd className="text-right font-medium text-main-text">
            {medication.dosageForm} ({medication.strength})
          </dd>
        </div>

        <div className="flex items-start justify-between gap-3">
          <dt className="text-secondary-text">Kategori</dt>
          <dd className="text-right font-medium text-main-text">
            {medication.category}
          </dd>
        </div>
      </dl>

      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={() => onSelect(medication)}
      >
        Lihat detail
      </Button>
    </Card>
  );
}

// Medication details
function MedicationDetails({
  medication,
  onClose,
}: {
  medication: Medication;
  onClose: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={medication.isPrescription ? "danger" : "success"}>
          {medication.isPrescription
            ? "Obat keras — membutuhkan resep"
            : "Obat bebas"}
        </Badge>

        <Badge variant="secondary">{medication.category}</Badge>

        <Badge variant="outline">{medication.dosageForm}</Badge>
      </div>

      <div className="space-y-5 text-sm">
        <section>
          <h4 className="flex items-center gap-2 font-semibold text-main-text">
            <Pill size={17} className="text-primary" />
            Deskripsi
          </h4>

          <p className="mt-2 leading-relaxed text-secondary-text">
            {medication.description}
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-main-text">
            Informasi dasar
          </h4>

          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-muted p-3">
              <dt className="text-xs text-secondary-text">Nama generik</dt>
              <dd className="mt-1 font-medium text-main-text">
                {medication.genericName}
              </dd>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <dt className="text-xs text-secondary-text">Merek</dt>
              <dd className="mt-1 font-medium text-main-text">
                {medication.brand}
              </dd>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <dt className="text-xs text-secondary-text">Kekuatan</dt>
              <dd className="mt-1 font-medium text-main-text">
                {medication.strength}
              </dd>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <dt className="text-xs text-secondary-text">Penyimpanan</dt>
              <dd className="mt-1 font-medium text-main-text">
                {medication.storage}
              </dd>
            </div>
          </dl>
        </section>

        {medication.uses.length > 0 && (
          <section>
            <h4 className="font-semibold text-main-text">Kegunaan</h4>

            <ul className="mt-2 list-inside list-disc space-y-1.5 text-secondary-text">
              {medication.uses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </section>
        )}

        {medication.sideEffects.length > 0 && (
          <section className="rounded-xl border border-warning/30 bg-warning/10 p-4">
            <h4 className="flex items-center gap-2 font-semibold text-[#92400E]">
              <AlertTriangle size={17} />
              Efek samping
            </h4>

            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[#92400E]">
              {medication.sideEffects.map((effect) => (
                <li key={effect}>{effect}</li>
              ))}
            </ul>
          </section>
        )}

        {medication.contraindications.length > 0 && (
          <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <h4 className="font-semibold text-destructive">
              Kontraindikasi
            </h4>

            <ul className="mt-2 list-inside list-disc space-y-1.5 text-destructive">
              {medication.contraindications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-secondary-text">
          Informasi ini bersifat edukatif dan bukan pengganti konsultasi
          dengan dokter atau apoteker. Ikuti petunjuk penggunaan pada
          kemasan atau resep yang diberikan tenaga kesehatan.
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={onClose}
      >
        <X size={16} className="mr-2" />
        Tutup
      </Button>
    </div>
  );
}

// Main page
export function ObatPage() {
  const [searchParams] = useSearchParams();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Medication | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listMedications()
      .then((rows) => {
        if (active) setMedications(rows);
      })
      .catch(() => {
        if (active) setMedications([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(medications.map((medication) => medication.category))],
    [medications]
  );

  const filteredMedications = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return medications.filter((medication) => {
      const matchesSearch =
        !keyword ||
        [
          medication.name,
          medication.genericName,
          medication.brand,
        ].some((value) => value.toLowerCase().includes(keyword));

      const matchesCategory =
        !category || medication.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [medications, search, category]);

  const hasActiveFilter = Boolean(search.trim() || category);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMedications.length / PAGE_SIZE)
  );

  const pageItems = useMemo(
    () =>
      filteredMedications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredMedications, page]
  );

  useEffect(() => {
    const query = searchParams.get("q");
    if (query === null) return;

    setSearch(query);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="animate-fade-in space-y-6">
      <section
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center"
        aria-label="Pencarian dan filter obat"
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari nama obat, generik, atau merek..."
          className="flex-1"
        />

        <div className="flex gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-surface px-3 text-sm text-main-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-48 sm:flex-none"
            aria-label="Filter kategori obat"
          >
            <option value="">Semua Kategori</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {hasActiveFilter && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="shrink-0"
            >
              <RotateCcw size={15} className="mr-1.5" />
              Reset
            </Button>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary-text">
          Menampilkan{" "}
          <span className="font-semibold text-main-text">
            {filteredMedications.length}
          </span>{" "}
          dari {medications.length} obat
        </p>
      </div>

      {filteredMedications.length === 0 ? (
        <EmptyState
          title="Obat tidak ditemukan"
          description="Coba gunakan kata kunci lain atau pilih kategori yang berbeda."
          actionLabel="Reset filter"
          onAction={resetFilters}
        />
      ) : (
        <>
          <section
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Daftar obat"
          >
            {pageItems.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onSelect={setSelected}
              />
            ))}
          </section>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredMedications.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="obat"
            className="rounded-xl border border-border bg-surface"
          />
        </>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.name}
      >
        {selected && (
          <MedicationDetails
            medication={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
