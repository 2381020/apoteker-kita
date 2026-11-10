import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    description: "Dapatkan informasi dan konsultasi seputar penggunaan obat dengan lebih mudah.",
    cta: "Mulai Konsultasi",
    href: "/obat",
    image: "/images/sliders/konsultasi-apoteker.jpg",
  },
  {
    title: "Gunakan Obat dengan Bijak",
    description: "Kenali aturan pakai dan informasi obat sebelum mengonsumsinya.",
    cta: "Pelajari Lebih Lanjut",
    href: "/interaksi",
    image: "/images/sliders/edukasi-obat.jpg",
  },
  {
    title: "Jangan Lewatkan Jadwal Obat",
    description: "Bantu ingat jadwal konsumsi obat agar lebih teratur.",
    cta: "Atur Pengingat",
    href: "/pengingat",
    image: "/images/sliders/pengingat-obat.jpg",
  },
  {
    title: "Kesehatan Keluarga Lebih Terjaga",
    description: "Mulai kebiasaan sehat dengan informasi farmasi yang tepat.",
    cta: "Jelajahi Layanan",
    href: "/panduan",
    image: "/images/sliders/kesehatan-keluarga.jpg",
  },
  {
    title: "Layanan Farmasi dalam Genggaman",
    description: "Akses informasi kesehatan dan layanan farmasi secara praktis.",
    cta: "Mulai Sekarang",
    href: "/apotek",
    image: "/images/sliders/farmasi-digital.jpg",
  },
];

export function HeroSlider() {
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    setActive(index);
  };

  const next = () => {
    setActive((active + 1) % SLIDES.length);
  };

  const prev = () => {
    setActive(
      active === 0 ? SLIDES.length - 1 : active - 1
    );
  };

  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") next();
    }, 7000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-[#FFF9E6]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[360px] grid min-h-[360px] items-center gap-6 px-6 py-10 sm:px-10 lg:min-h-[420px] lg:grid-cols-2 lg:px-14">
        
        {/* Gambar illustrasi */}
        <div className="relative h-full min-h-[220px] w-full overflow-hidden rounded-lg lg:min-h-[320px] lg:w-full">
          <img
            src={SLIDES[active].image}
            alt={SLIDES[active].title}
            className="object-contain h-full w-full"
            loading="lazy"
          />
        </div>

        {/* Konten teks */}
        <div className="relative z-10 flex flex-col items-start gap-4">
          <span
            className="inline-flex items-center rounded-full bg-[#FFD54F]/30 px-4 py-1.5 text-xs font-semibold text-[#263238]"
          >
            Apoteker Kita · Sahabat Kesehatan
          </span>

          <h1 className="mb-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#263238] sm:text-4xl lg:text-5xl">
            {SLIDES[active].title}
          </h1>

          <p className="mb-7 max-w-md text-sm leading-relaxed text-[#263238]/75 sm:text-base">
            {SLIDES[active].description}
          </p>

          <Link
            to={SLIDES[active].href}
            className="inline-flex items-center gap-2 rounded-lg bg-[#263238] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#37474F] hover:shadow-md"
          >
            {SLIDES[active].cta}
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Navigasi prev/next */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#263238]/10 bg-white/90 text-[#263238] shadow-sm hover:bg-[#FFD54F] transition-colors lg:left-5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-[#263238] shadow-sm hover:bg-[#FFD54F] transition-colors lg:right-5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indikator slide */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((_slide, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Slide ${index + 1}`}
            aria-current={active === index ? "true" : undefined}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              active === index ? "w-7 bg-[#263238]" : "w-2 bg-[#263238]/25 hover:bg-[#263238]/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}