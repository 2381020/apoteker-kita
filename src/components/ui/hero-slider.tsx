import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const goTo = (index: number) => {
    if (animating || index === active) return;

    setAnimating(true);
    setActive(index);

    setTimeout(() => {
      setAnimating(false);
    }, 500);
  };

  const next = () => {
    goTo((active + 1) % SLIDES.length);
  };

  const prev = () => {
    goTo((active - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        setActive((current) => (current + 1) % SLIDES.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paused]);

  const currentSlide = SLIDES[active];

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border bg-[#FFF9E6]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid min-h-[320px] items-center gap-6 px-4 py-8 sm:px-10 sm:py-10 lg:min-h-[420px] lg:grid-cols-2 lg:px-14">
        
        {/* Konten teks */}
        <div
          key={`text-${active}`}
          className="relative z-10 flex flex-col items-start animate-fade-in"
        >
          <span className="mb-4 inline-flex items-center rounded-full bg-[#FFD54F]/30 px-4 py-1.5 text-xs font-semibold text-[#263238]">
            Apoteker Kita · Sahabat Kesehatan
          </span>

          <h1 className="mb-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#263238] sm:text-4xl lg:text-5xl">
            {currentSlide.title}
          </h1>

          <p className="mb-7 max-w-md text-sm leading-relaxed text-[#263238]/75 sm:text-base">
            {currentSlide.description}
          </p>

          <Link
            to={currentSlide.href}
            className="inline-flex items-center gap-2 rounded-lg bg-[#263238] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#37474F] hover:shadow-md"
          >
            {currentSlide.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Gambar ilustrasi */}
        <div
          key={`image-${active}`}
          className="flex h-full min-h-[180px] items-center justify-center animate-fade-in sm:min-h-[220px] lg:min-h-[320px]"
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="h-full max-h-[340px] w-full object-contain"
            loading={active === 0 ? "eager" : "lazy"}
          />
        </div>
      </div>

      {/* Navigasi previous */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#263238]/10 bg-white/90 text-[#263238] shadow-sm transition-all hover:bg-[#FFD54F] sm:left-5 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Navigasi next */}
      <button
        type="button"
        onClick={next}
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#263238]/10 bg-white/90 text-[#263238] shadow-sm transition-all hover:bg-[#FFD54F] sm:right-5 sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indikator slide */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Pilih slide ${index + 1}`}
            aria-current={active === index ? "true" : undefined}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              active === index
                ? "w-7 bg-[#263238]"
                : "w-2 bg-[#263238]/25 hover:bg-[#263238]/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}
