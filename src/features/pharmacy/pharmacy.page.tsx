import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Star,
  Clock,
  Navigation,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listPharmacies } from "@/services/pharmacies.service";
import type { Pharmacy } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";

const PAGE_SIZE = 9;

function PharmacyCard({ pharmacy }: { pharmacy: Pharmacy }) {
  const handleOpenMaps = () => {
    const destination = encodeURIComponent(
      `${pharmacy.address}, ${pharmacy.city}`,
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${destination}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Card className="flex h-full flex-col p-4 transition-shadow duration-200 hover:shadow-soft sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Building2 size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 overflow-hidden block -webkit-box -webkit-line-clamp-2 text-base font-semibold text-main-text">
              {pharmacy.name}
            </h3>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-secondary-text">
              <Star size={13} className="fill-brand text-brand" />
              <span className="font-medium text-main-text">
                {pharmacy.rating.toFixed(1)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{pharmacy.distance}</span>
            </div>
          </div>
        </div>

        <Badge
          variant={pharmacy.isOpen ? "success" : "secondary"}
          className="shrink-0"
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
              pharmacy.isOpen ? "bg-success" : "bg-secondary-text"
            }`}
          />
          {pharmacy.isOpen ? "Buka" : "Tutup"}
        </Badge>
      </div>

      <div className="mt-5 flex-1 space-y-3">
        <div className="flex items-start gap-2.5 text-sm text-secondary-text">
          <MapPin size={16} className="mt-0.5 shrink-0" />
          <span className="leading-relaxed">
            {pharmacy.address}, {pharmacy.city}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-sm text-secondary-text">
          <Phone size={16} className="shrink-0" />
          <span>{pharmacy.phone}</span>
        </div>

        <div className="flex items-center gap-2.5 text-sm text-secondary-text">
          <Clock size={16} className="shrink-0" />
          <span>
            {pharmacy.isOpen ? "Sedang beroperasi" : "Tidak beroperasi"}
          </span>
        </div>
      </div>

      {pharmacy.services.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex flex-wrap gap-1.5">
            {pharmacy.services.slice(0, 3).map((service) => (
              <span
                key={service}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-secondary-text"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={handleOpenMaps}
      >
        <Navigation size={16} className="mr-2" />
        Lihat rute
      </Button>
    </Card>
  );
}

export function ApotekPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPharmacies()
      .then((rows) => {
        if (active) setPharmacies(rows);
      })
      .catch(() => {
        if (active) setPharmacies([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredPharmacies = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return pharmacies;

    return pharmacies.filter((pharmacy) => {
      const searchableText = [pharmacy.name, pharmacy.city, pharmacy.address]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [pharmacies, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPharmacies.length / PAGE_SIZE),
  );

  const pageItems = useMemo(
    () => filteredPharmacies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredPharmacies, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="animate-fade-in space-y-6">
      <section
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center"
        aria-label="Pencarian apotek"
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari nama apotek, kota, atau alamat..."
          className="flex-1"
        />

        <p className="shrink-0 text-sm text-secondary-text">
          <span className="font-semibold text-main-text">
            {filteredPharmacies.length}
          </span>{" "}
          apotek ditemukan
        </p>
      </section>

      {filteredPharmacies.length === 0 ? (
        <EmptyState
          title="Apotek tidak ditemukan"
          description="Coba gunakan kata kunci lain atau periksa kembali ejaan pencarian."
          actionLabel="Hapus pencarian"
          onAction={() => setSearch("")}
        />
      ) : (
        <>
          <section
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Daftar apotek"
          >
            {pageItems.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
            ))}
          </section>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredPharmacies.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="apotek"
            className="rounded-xl border border-border bg-surface"
          />
        </>
      )}
    </div>
  );
}
