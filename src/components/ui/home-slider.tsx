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
import { useLanguage } from "@/lib/i18n";

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
  const { tr, lang } = useLanguage();
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
            <div
              key={item.href}
              className="relative flex flex-col items-center gap-2 min-w-[160px] shrink-0 cursor-pointer hover:scale-[105%] transition-transform"
            >
              <Icon
                className={cn(
                  "h-12 w-12 mx-auto text-[#263238]",
                  lang === "en" ? "text-[#FFE082]" : ""
                )}
              />
              <p className="text-center text-xs font-medium text-[#263238]">
                {tr(item.title)}
              </p>
              <p className="text-center text-[10px] text-[#6B7280]">
                {tr(item.description)}
              </p>
              <Link
                to={item.href}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#263238] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#37474F] hover:shadow-md sm:w-auto"
              >
                {tr(item.cta)}
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}