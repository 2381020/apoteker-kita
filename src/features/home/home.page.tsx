import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Pill,
  Activity,
  Calculator,
  BookOpen,
  Building2,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroSlider } from "@/components/ui/hero-slider";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { listGuides } from "@/services/guides.service";
import { EmptyState } from "@/components/shared/empty-state";

const features = [
  {
    title: "Informasi Obat",
    desc: "Pelajari manfaat, cara pakai, dan efek samping berbagai obat.",
    icon: Pill,
    href: "/obat",
  },
  {
    title: "Cek Interaksi",
    desc: "Periksa interaksi antar obat sebelum mengonsumsinya.",
    icon: Activity,
    href: "/interaksi",
  },
  {
    title: "Kalkulator Dosis",
    desc: "Hitung dosis obat sesuai berat badan dan frekuensi.",
    icon: Calculator,
    href: "/dosis",
  },
  {
    title: "Panduan Obat",
    desc: "Panduan penggunaan obat yang aman dan benar.",
    icon: BookOpen,
    href: "/panduan",
  },
  {
    title: "Cari Apotek",
    desc: "Temukan apotek terdekat beserta layanan dan jam buka.",
    icon: Building2,
    href: "/apotek",
  },
  {
    title: "Tanya Apoteker",
    desc: "Konsultasikan seputar obat dengan asisten virtual.",
    icon: MessageCircle,
    href: "/tanya",
  },
];

const LOGO_CAROUSEL = [
  {
    label: "Kimia Farma",
    href: "https://www.kimiafarma.co.id",
    logoUrl:
      "https://iconlogovector.com/uploads/images/2024/01/lg-6595cf2dc8815-kimia-farama.webp",
  },
  {
    label: "Guardian",
    href: "https://guardianindonesia.co.id/",
    logoUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaog5WpauZJd-HOL6qcUNLC8P_pqSWohrklCj0hDONcFMty7tWIKqyOXk4&s=10",
  },
  {
    label: "Century",
    href: "https://century-pharma.com/marketplace",
    logoUrl:
      "https://majalahfranchise.com/wp-content/uploads/2020/07/century-1.png",
  },
  {
    label: "Apotek K24",
    href: "https://www.k24klik.com/",
    logoUrl:
      "https://www.apotek-k24.com/images/post/340080193420230126030135yunita.isnalogo%20Apotek%20K-24.jpg.webp",
  },
  {
    label: "Medifarma",
    href: "https://www.medifarma.biz/",
    logoUrl: "https://career.medifarma.biz/img/logo_MLI.png",
  },
];

type Article = {
  title: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  href: string;
};

export function BerandaPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [guideError, setGuideError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setGuideError(false);

    listGuides()
      .then((rows) => {
        if (!active) return;
        const transformed = rows.slice(0, 6).map((guide) => ({
          title: guide.title,
          category: guide.category,
          excerpt: guide.summary,
          imageUrl: guide.imageUrl || "/images/placeholder.jpg",
          href: "/panduan",
        }));
        setArticles(transformed);
      })
      .catch(() => {
        if (!active) return;
        setArticles([]);
        setGuideError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  const retryGuides = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  return (
    <div className="animate-fade-in space-y-8 sm:space-y-10">
      <HeroSlider />

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="bg-surface px-4 py-8 sm:px-8 sm:py-12">
          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-surface px-3 py-1 text-xs font-semibold text-secondary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Informasi kesehatan tepercaya
              </span>

              <h1 className="mt-4 font-bold leading-tight tracking-tight text-main-text text-[clamp(1.875rem,6vw,2.5rem)]">
                Pahami obat, jaga kesehatan Anda
              </h1>

              <p className="mt-4 text-base leading-relaxed text-secondary-text sm:text-lg">
                ApotekerKita membantu Anda memahami obat, memeriksa interaksi,
                menghitung dosis, dan mengelola jadwal minum obat — semua dalam
                satu tempat.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/obat">
                    Jelajahi Obat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full bg-surface sm:w-auto"
                >
                  <Link to="/tanya">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Tanya Apoteker
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative md:mt-12 lg:mt-0">
              <PlaceholderImage
                src="/images/obat.png"
                alt="Ilustrasi obat sehari-hari"
                className="mx-auto h-auto w-full max-w-[420px] object-contain sm:max-w-[520px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-main-text sm:text-2xl">
              Fitur Utama
            </h2>
            <p className="mt-1 text-sm text-secondary-text">
              Semua yang Anda butuhkan seputar obat, dalam satu platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;

            return (
              <Link key={f.href} to={f.href} className="group">
                <Card className="h-full p-4 transition-all group-hover:border-primary/40 group-hover:shadow-soft sm:p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 flex items-center gap-1.5 text-base font-semibold text-main-text">
                    {f.title}
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-secondary-text">
                    {f.desc}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Artikel pilihan */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-main-text sm:text-2xl">
              Panduan Kesehatan
            </h2>
            <p className="mt-1 text-sm text-secondary-text">
              Artikel pilihan seputar penggunaan obat yang aman.
            </p>
          </div>

          <Link
            to="/panduan"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary sm:inline-flex"
          >
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="h-full animate-pulse p-4 sm:p-5">
                <div className="mb-4 h-40 w-full rounded-md bg-muted sm:h-48" />
                <div className="h-5 w-20 rounded-full bg-muted" />
                <div className="mt-3 h-5 w-4/5 rounded bg-muted" />
                <div className="mt-2 h-4 w-full rounded bg-muted" />
                <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
              </Card>
            ))}
          </div>
        ) : guideError ? (
          <EmptyState
            title="Panduan belum dapat dimuat"
            description="Periksa koneksi Anda, lalu coba muat ulang."
            actionLabel="Coba lagi"
            onAction={retryGuides}
          />
        ) : articles.length === 0 ? (
          <EmptyState
            title="Panduan tidak ditemukan"
            description="Panduan kesehatan akan tampil di sini setelah tersedia."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {articles.map((a) => (
              <Card
                key={a.title}
                className="group flex h-full flex-col p-4 transition-shadow hover:shadow-soft sm:p-5"
              >
                <PlaceholderImage
                  src={a.imageUrl}
                  alt={a.title}
                  className="mb-4 h-40 w-full rounded-md object-cover sm:h-48"
                />

                <span className="w-fit rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-secondary">
                  {a.category}
                </span>

                <h3 className="mt-3 text-base font-semibold leading-snug text-main-text">
                  {a.title}
                </h3>

                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-secondary-text">
                  {a.excerpt}
                </p>

                <Link
                  to={a.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline"
                >
                  Baca selengkapnya <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Logo carousel */}
      <section className="overflow-hidden border-y border-border py-8 sm:py-14">
        <p className="mb-5 px-4 text-center text-xs font-semibold uppercase tracking-wider text-secondary-text sm:mb-6">
          Dipercaya oleh berbagai apotek di Indonesia
        </p>

        <div className="logo-marquee relative overflow-hidden">
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent"
            aria-hidden="true"
          />

          {/* gap dan pr harus sama agar loop marquee mulus */}
          <div className="logo-marquee-track flex w-max animate-marquee items-center gap-12 pr-12 sm:gap-28 sm:pr-28">
            {[...LOGO_CAROUSEL, ...LOGO_CAROUSEL].map((logo, idx) => {
              const isDuplicate = idx >= LOGO_CAROUSEL.length;

              return (
                <a
                  key={`${logo.label}-${idx}`}
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 shrink-0 items-center justify-center transition duration-300 ease-out sm:h-[70px]"
                  aria-hidden={isDuplicate || undefined}
                  tabIndex={isDuplicate ? -1 : undefined}
                >
                  {logo.logoUrl ? (
                    <img
                      src={logo.logoUrl}
                      alt={logo.label}
                      className="h-12 w-auto max-w-[180px] object-contain sm:h-[70px]"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-center text-sm font-semibold leading-tight">
                      {logo.label}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default BerandaPage;
