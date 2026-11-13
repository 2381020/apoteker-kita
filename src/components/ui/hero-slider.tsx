import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSlide {
  title: string;
  description: string;
  cta: string;
  href: string;
  image: string;
}

const SLIDES: HeroSlide[] = [
  {
    title: "Teman Sehat, Solusi Tepat",
    description:
      "Dapatkan informasi dan konsultasi seputar penggunaan obat dengan lebih mudah.",
    cta: "Mulai Konsultasi",
    href: "/obat",
    image: "/images/sliders/konsultasi-apoteker.jpg",
  },
  {
    title: "Gunakan Obat dengan Bijak",
    description:
      "Kenali aturan pakai dan informasi obat sebelum mengonsumsinya.",
    cta: "Pelajari Lebih Lanjut",
    href: "/interaksi",
    image: "/images/sliders/edukasi-obat.jpg",
  },
  {
    title: "Jangan Lewatkan Jadwal Obat",
    description:
      "Bantu ingat jadwal konsumsi obat agar lebih teratur.",
    cta: "Atur Pengingat",
    href: "/pengingat",
    image: "/images/sliders/pengingat-obat.jpg",
  },
  {
    title: "Kesehatan Keluarga Lebih Terjaga",
    description:
      "Mulai kebiasaan sehat dengan informasi farmasi yang tepat.",
    cta: "Jelajahi Layanan",
    href: "/panduan",
    image: "/images/sliders/kesehatan-keluarga.jpg",
  },
  {
    title: "Layanan Farmasi dalam Genggaman",
    description:
      "Akses informasi kesehatan dan layanan farmasi secara praktis.",
    cta: "Mulai Sekarang",
    href: "/apotek",
    image: "/images/sliders/farmasi-digital.jpg",
  },
];

function preloadImage(src: string) {
  if (typeof window === "undefined") return;
  const image = new window.Image();
  image.decoding = "async";
  image.src = src;
}

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (index === active) return;
      setActive(index);
    },
    [active]
  );

  const next = useCallback(() => {
    goTo((active + 1) % SLIDES.length);
  }, [active, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + SLIDES.length) % SLIDES.length);
  }, [active, goTo]);

  useEffect(() => {
    // Muat gambar berikutnya lebih awal agar transisi tidak kosong.
    preloadImage(SLIDES[(active + 1) % SLIDES.length].image);
    preloadImage(SLIDES[(active - 1 + SLIDES.length) % SLIDES.length].image);
  }, [active]);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    if (paused || userPaused) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActive((current) => (current + 1) % SLIDES.length);
      }
    }, 6000);

    return () => window.clearInterval(interval);
  }, [paused, userPaused]);

  const currentSlide = SLIDES[active];

  const handleTouchStart = (event: ReactTouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    setPaused(true);
  };

  const handleTouchEnd = (event: ReactTouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    setPaused(false);

    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < 0) {
      next();
    } else {
      prev();
    }
  };

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border bg-[#FFF9E6] touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Sorotan ApotekerKita"
    >
      <div className="grid items-center gap-5 px-4 py-6 pb-14 sm:gap-6 sm:px-10 sm:py-10 sm:pb-16 lg:min-h-[420px] lg:grid-cols-2 lg:px-14">
        {/* Konten teks */}
        <div
          key={`text-${active}`}
          className="relative z-10 flex flex-col items-start animate-fade-in"
        >
          <span className="mb-3 inline-flex items-center rounded-full bg-[#FFD54F]/30 px-3 py-1.5 text-[11px] font-semibold text-[#263238] sm:mb-4 sm:px-4 sm:text-xs">
            Apoteker Kita · Sahabat Kesehatan
          </span>

          <h1 className="mb-3 max-w-xl text-2xl font-bold leading-tight tracking-tight text-[#263238] sm:mb-4 sm:text-4xl lg:text-5xl">
            {currentSlide.title}
          </h1>

          <p className="mb-5 max-w-md text-sm leading-relaxed text-[#263238]/75 sm:mb-7 sm:text-base">
            {currentSlide.description}
          </p>

          <Link
            to={currentSlide.href}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#263238] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#37474F] hover:shadow-md sm:w-auto"
          >
            {currentSlide.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Gambar ilustrasi */}
        <div
          key={`image-${active}`}
          className="flex h-[150px] items-center justify-center animate-fade-in sm:h-[240px] lg:h-[320px]"
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            width={640}
            height={420}
            decoding="async"
            className="h-full w-full object-contain"
            loading={active === 0 ? "eager" : "lazy"}
            fetchPriority={active === 0 ? "high" : "auto"}
          />
        </div>
      </div>

      {/* Navigasi previous */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#263238]/10 bg-white/90 text-[#263238] shadow-sm transition-all hover:bg-[#FFD54F] sm:left-5 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Navigasi next */}
      <button
        type="button"
        onClick={next}
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#263238]/10 bg-white/90 text-[#263238] shadow-sm transition-all hover:bg-[#FFD54F] sm:right-5 sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indikator slide + kontrol jeda */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-2 px-14">
        <div className="flex items-center gap-1">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Pilih slide ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
              className="flex h-8 w-8 items-center justify-center"
            >
              <span
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  active === index
                    ? "w-7 bg-[#263238]"
                    : "w-2 bg-[#263238]/25 hover:bg-[#263238]/50"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        Slide {active + 1} dari {SLIDES.length}: {currentSlide.title}
      </span>
    </section>
  );
}
