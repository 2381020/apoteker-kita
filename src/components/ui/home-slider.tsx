import * as React from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Calculator,
  BellRing,
  BookOpen,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SliderItem {
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: LucideIcon;
}

const ITEMS: SliderItem[] = [
  {
    title: "Cek Interaksi Obat",
    description: "Periksa interaksi antar obat sebelum mengonsumsinya dengan aman.",
    cta: "Cek Sekarang",
    href: "/interaksi",
    icon: Activity,
  },
  {
    title: "Kalkulator Dosis",
    description: "Hitung dosis yang tepat sesuai berat badan dan frekuensi pemakaian.",
    cta: "Hitung Dosis",
    href: "/dosis",
    icon: Calculator,
  },
  {
    title: "Pengingat Minum Obat",
    description: "Atur jadwal minum obat dan dapatkan pengingat agar tidak terlewat.",
    cta: "Buat Pengingat",
    href: "/pengingat",
    icon: BellRing,
  },
  {
    title: "Panduan Penggunaan Obat",
    description: "Pelajari cara pakai obat yang aman dan benar untuk kesehatan Anda.",
    cta: "Baca Panduan",
    href: "/panduan",
    icon: BookOpen,
  },
  {
    title: "Cari Apotek Terdekat",
    description: "Temukan apotek di sekitar Anda lengkap dengan layanan dan jam buka.",
    cta: "Cari Apotek",
    href: "/apotek",
    icon: Building2,
  },
];

export function HomeSlider({ items = ITEMS }: { items?: SliderItem[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const scrollToIndex = React.useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  }, []);

  const onScroll = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    let idx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement;
      const d = Math.abs(child.offsetLeft - el.scrollLeft);
      if (d < bestDist) {
        bestDist = d;
        idx = i;
      }
    }
    setActive(idx);
  }, []);

  const next = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
    }
  }, []);

  const prev = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollLeft <= 8) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    } else {
      el.scrollBy({ left: -el.clientWidth, behavior: "smooth" });
    }
  }, []);

  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") next();
    }, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="relative -mx-2 flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="shrink-0 snap-start basis-full px-2">
              <Link
                to={item.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-soft sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-main-text sm:text-lg">{item.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-secondary-text">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
                  {item.cta}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      <button
        onClick={prev}
        aria-label="Sebelumnya"
        className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface shadow-soft transition-colors hover:bg-primary-soft"
      >
        <ChevronLeft className="h-5 w-5 text-main-text" />
      </button>
      <button
        onClick={next}
        aria-label="Berikutnya"
        className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface shadow-soft transition-colors hover:bg-primary-soft"
      >
        <ChevronRight className="h-5 w-5 text-main-text" />
      </button>

      <div className="mt-5 flex items-center justify-center gap-2">
        {items.map((item, i) => (
          <button
            key={item.title}
            onClick={() => scrollToIndex(i)}
            aria-label={`Ke fitur ${i + 1}: ${item.title}`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === active ? "w-6 bg-brand" : "w-2 bg-border hover:bg-secondary-text/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default HomeSlider;