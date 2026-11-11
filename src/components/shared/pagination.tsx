import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  disabled?: boolean;
  className?: string;
}

function getPageItems(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: (number | "gap")[] = [];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  items.push(1);

  if (start > 2) items.push("gap");

  for (let current = start; current <= end; current++) {
    items.push(current);
  }

  if (end < totalPages - 1) items.push("gap");

  items.push(totalPages);

  return items;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  disabled = false,
  className,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const pageItems = getPageItems(safePage, safeTotalPages);

  const buttonClass =
  "h-10 min-w-10 rounded-md border border-[#64748B] bg-[#F1F5F9] px-3 text-sm font-semibold text-[#0F172A] shadow-none transition-all hover:border-[#334155] hover:bg-[#CBD5E1] hover:text-[#000000] disabled:opacity-50 disabled:text-[#64748B] disabled:border-[#CBD5E1] sm:h-9 sm:min-w-9 sm:px-2";

  return (
    <nav
      aria-label="Navigasi halaman"
      className={cn("flex w-full items-center justify-center py-4 px-2 sm:px-0", className)}
    >
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        {/* Previous */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(safePage - 1)}
          disabled={disabled || safePage <= 1}
          aria-label="Halaman sebelumnya"
          className={cn(buttonClass, "gap-1 px-3 sm:gap-1 sm:px-3")}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        {/* Page Numbers */}
        {pageItems.map((item, index) =>
          item === "gap" ? (
            <span
              key={`gap-${index}`}
              className="flex h-10 min-w-7 items-center justify-center text-sm text-[#000000] sm:h-9"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <Button
              key={item}
              size="sm"
              variant="outline"
              onClick={() => onPageChange(item)}
              disabled={disabled}
              aria-label={`Halaman ${item}`}
              aria-current={item === safePage ? "page" : undefined}
              className={cn(
                buttonClass,
                item === safePage &&
                  "!border-[#0F766E] !bg-[#0F766E] !text-white hover:!bg-[#115E59] hover:!text-white",
              )}
            >
              {item}
            </Button>
          ),
        )}

        {/* Next */}
<Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(safePage + 1)}
            disabled={disabled || safePage >= safeTotalPages}
            aria-label="Halaman berikutnya"
            className={cn(buttonClass, "gap-1 px-3 sm:gap-1 sm:px-3")}
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
      </div>
    </nav>
  );
}
