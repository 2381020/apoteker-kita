
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
  const [active, setActive] = React.useState(0);

  // Autoplay otomatis setiap 7 detik
  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, []);

  // Slide berikutnya
  const next = () => {
    setActive((current) => (current + 1) % SLIDES.length);
  };

  // Slide sebelumnya
  const prev = () => {
    setActive((current) =>
      current === 0 ? SLIDES.length - 1 : current - 1
    );
  };

  // Pindah ke slide tertentu
  const goTo = (index: number) => {
    setActive(index);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#E5EBDD] bg-[#FFF9E6]">

      {/* Main Slider Content */}
      <div className="grid min-h-[420px] items-center gap-8 px-8 py-10 sm:px-12 lg:grid-cols-2 lg:gap-10 lg:px-16">

        {/* Left Content */}
        <div className="relative z-10 flex flex-col items-start">

          {/* Badge */}
          <span className="mb-5 inline-flex items-center rounded-full bg-[#FFD54F]/30 px-4 py-2 text-xs font-semibold text-[#263238] sm:text-sm">
            Apoteker Kita · Sahabat Kesehatan
          </span>

          {/* Title */}
          <h1 className="mb-4 max-w-xl text-3xl font-bold leading-[1.08] tracking-tight text-[#263238] sm:text-4xl lg:text-5xl">
            {SLIDES[active].title}
          </h1>

          {/* Description */}
          <p className="mb-8 max-w-md text-base leading-relaxed text-[#526477] sm:text-lg">
            {SLIDES[active].description}
          </p>

          {/* CTA Button */}
          <Link
            to={SLIDES[active].href}
            className="inline-flex items-center gap-3 rounded-lg bg-[#263238] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#37474F] hover:shadow-md"
          >
            {SLIDES[active].cta}

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

        {/* Right Image */}
        <div className="flex h-[220px] w-full items-center justify-center sm:h-[300px] lg:h-[340px]">
          <img
            key={SLIDES[active].image}
            src={SLIDES[active].image}
            alt={SLIDES[active].title}
            className="h-full w-full object-contain transition-opacity duration-500"
            loading="lazy"
          />
        </div>
      </div>

      {/* Previous Button */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide sebelumnya"
        className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#263238]/10 bg-white text-[#263238] shadow-sm transition hover:bg-[#FFD54F] lg:left-6"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next Button */}
      <button
        type="button"
        onClick={next}
        aria-label="Slide berikutnya"
        className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#263238]/10 bg-white text-[#263238] shadow-sm transition hover:bg-[#FFD54F] lg:right-6"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Indicators - Tanpa Play/Pause */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Slide ${index + 1}`}
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
