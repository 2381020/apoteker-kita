
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Tag, X, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { PlaceholderImage } from "@/components/shared/placeholder-image";

import { listGuides } from "@/services/guides.service";
import type { Guide } from "@/types";

import { EmptyState } from "@/components/shared/empty-state";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";

const PAGE_SIZE = 6;

// Guide card
function GuideCard({
  guide,
  onSelect,
  onTagSelect,
}: {
  guide: Guide;
  onSelect: (guide: Guide) => void;
  onTagSelect: (tag: string) => void;
}) {
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow duration-200 hover:shadow-soft">
      <PlaceholderImage
          src={guide.imageUrl || "/images/placeholder.png"}
          alt={guide.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />

      <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-secondary">
        {guide.category}
      </span>

      <h3 className="mt-3 text-base font-semibold leading-snug text-main-text">
        {guide.title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary-text">
        {guide.summary}
      </p>

      {guide.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {guide.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagSelect(tag)}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-secondary-text transition-colors hover:bg-primary-soft hover:text-primary"
              aria-label={`Cari panduan dengan tag ${tag}`}
            >
              <Tag size={12} />
              {tag}
            </button>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        className="mt-5 w-full justify-between"
        onClick={() => onSelect(guide)}
      >
        Baca selengkapnya
        <ArrowRight size={16} className="text-primary" />
      </Button>
    </Card>
  );
}

// Guide details
function GuideDetails({
  guide,
  onClose,
}: {
  guide: Guide;
  onClose: () => void;
}) {
  return (
    <div className="space-y-5">
      <PlaceholderImage
          src={guide.imageUrl || "/images/placeholder.png"}
          alt={guide.title}
          className="w-full h-40 object-cover rounded-md mb-4"
        />

      <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-secondary">
        {guide.category}
      </span>

      <div className="space-y-4">
        <section>
          <h4 className="text-sm font-semibold text-main-text">
            Ringkasan
          </h4>

          <p className="mt-2 text-sm leading-relaxed text-secondary-text">
            {guide.summary}
          </p>
        </section>

        <section className="border-t border-border pt-4">
          <h4 className="mb-2 text-sm font-semibold text-main-text">
            Isi panduan
          </h4>

          <div className="whitespace-pre-line text-sm leading-7 text-secondary-text">
            {guide.content}
          </div>
        </section>
      </div>

      {guide.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {guide.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-secondary-text"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

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
export function PanduanPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Guide | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listGuides()
      .then((rows) => {
        if (active) setGuides(rows);
      })
      .catch(() => {
        if (active) setGuides([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(guides.map((guide) => guide.category))],
    [guides]
  );

  const filteredGuides = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return guides.filter((guide) => {
      const matchesSearch =
        !keyword ||
        [
          guide.title,
          guide.summary,
          ...guide.tags,
        ].some((value) => value.toLowerCase().includes(keyword));

      const matchesCategory =
        !category || guide.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [guides, search, category]);

  const hasActiveFilter = Boolean(search.trim() || category);

  const totalPages = Math.max(1, Math.ceil(filteredGuides.length / PAGE_SIZE));

  const pageItems = useMemo(
    () => filteredGuides.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredGuides, page]
  );

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
      {/* Search and category filter */}
      <section
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center"
        aria-label="Pencarian panduan"
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari judul, ringkasan, atau tag..."
          className="flex-1"
        />

        <div className="flex gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-surface px-3 text-sm text-main-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-48 sm:flex-none"
            aria-label="Filter kategori panduan"
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

      {/* Active filters */}
      {hasActiveFilter && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-secondary-text">
            Filter aktif:
          </span>

          {search.trim() && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-secondary">
              &ldquo;{search}&rdquo;

              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                aria-label="Hapus filter pencarian"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-secondary">
              {category}

              <button
                type="button"
                onClick={() => setCategory("")}
                className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                aria-label="Hapus filter kategori"
              >
                <X size={13} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Result count */}
      <p className="text-sm text-secondary-text">
        Menampilkan{" "}
        <span className="font-semibold text-main-text">
          {filteredGuides.length}
        </span>{" "}
        dari {guides.length} artikel
      </p>

      {/* Guide list */}
      {filteredGuides.length === 0 ? (
        <EmptyState
          title="Panduan tidak ditemukan"
          description="Coba gunakan kata kunci lain atau pilih kategori yang berbeda."
          actionLabel="Reset filter"
          onAction={resetFilters}
        />
      ) : (
        <>
          <section
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            aria-label="Daftar panduan"
          >
            {pageItems.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onSelect={setSelected}
                onTagSelect={setSearch}
              />
            ))}
          </section>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredGuides.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="panduan"
            className="rounded-xl border border-border bg-surface"
          />
        </>
      )}

      {/* Guide detail dialog */}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.title}
      >
        {selected && (
          <GuideDetails
            guide={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
