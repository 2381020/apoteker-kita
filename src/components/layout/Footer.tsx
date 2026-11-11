import * as React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const links = [
  { href: "/obat", label: "Informasi Obat" },
  { href: "/interaksi", label: "Cek Interaksi" },
  { href: "/dosis", label: "Kalkulator Dosis" },
  { href: "/panduan", label: "Panduan" },
  { href: "/apotek", label: "Cari Apotek" },
];

const SOCIAL_ICONS: { label: string; path: string }[] = [
  {
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.071 3.252.148 4.771 1.691 4.919 4.919.059 1.265.071 1.645.071 4.85 0 3.204-.012 3.584-.071 4.85-.148 3.252-1.691 4.771-4.919 4.919-1.265.059-1.645.071-4.85.071-3.204 0-3.584-.012-4.85-.071-3.252-.148-4.771-1.691-4.919-4.919-.059-1.265-.071-1.645-.071-4.85 0-3.204.012-3.584.071-4.85.148-3.252 1.691-4.771 4.919-4.919 1.265-.059 1.645-.071 4.85-.071zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "TikTok",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.31 2.84 2.87 2.87 0 0 1-1.49.4 2.89 2.89 0 0 1-2.31-2.87 2.87 2.87 0 0 1 2.31-2.84 2.84 2.84 0 0 1 .34.02V9.8a6.34 6.34 0 0 0-.34-.02 6.33 6.33 0 0 0-5.31 6.03 6.34 6.34 0 0 0 5.31 6.03 6.33 6.33 0 0 0 6.03-5.31V8.75a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.18z",
  },
  {
    label: "Facebook",
    path: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z",
  },
  {
    label: "X",
    path: "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z",
  },
  {
    label: "WhatsApp",
    path: "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01c-1.77 0-3.5-.48-5.01-1.38l-.36-.21-3.73.98 1-3.64-.24-.37c-1.03-1.63-1.57-3.5-1.57-5.44 0-5.55 4.52-10.07 10.08-10.07 2.69 0 5.21 1.05 7.11 2.95a10 10 0 0 1 2.93 7.12c0 5.55-4.52 10.06-10.2 10.06zm8.73-18.79A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.48-8.4z",
  },
];

const CONTACT: { icon: typeof Mail; label: string; href?: string }[] = [
  {
    icon: Mail,
    label: "halo@apotekerkita.com",
    href: "mailto:halo@apotekerkita.com",
  },
  {
    icon: Phone,
    label: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
  },
  { icon: MapPin, label: "Jl. Kesehatan No. 10, Jakarta Selatan 12345" },
  { icon: Clock, label: "Senin–Jumat, 08.00–17.00 WIB" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#164E49] bg-[url('/images/footer-bg.png')] bg-no-repeat bg-cover bg-center">
      <div className="mx-auto max-w-[var(--layout-max)] px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 items-start">
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="ApotekerKita"
                className="h-12 w-12 -mt-1 rounded-xl bg-[url('/images/footer-bg.png')] bg-no-repeat bg-center bg-contain"
              />
              <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Apoteker<span className="text-[#FFD54F]">Kita</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/90">
              Platform informasi obat digital Indonesia untuk memahami obat,
              memeriksa interaksi, menghitung dosis, dan mengelola jadwal minum
              obat.
            </p>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xl font-semibold uppercase tracking-wider text-white/90 mb-5">
              Fitur
            </h3>
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="text-sm text-white/90 transition-colors hover:text-[#FFD54F]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xl font-semibold uppercase tracking-wider text-white/90 mb-5">
              Ikuti Kami
            </h3>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {SOCIAL_ICONS.map((s) => (
                <button
                  key={s.label}
                  aria-label={s.label}
                  className="flex items-center justify-center text-white transition-colors hover:text-[#FFD54F]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-10 w-10"
                  >
                    <path d={s.path} />
                  </svg>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="text-xl font-semibold uppercase tracking-wider text-white/90 mb-4">
                Kontak
              </h4>
              <ul className="space-y-3 text-sm text-white/90">
                {CONTACT.map((c) => {
                  const Icon = c.icon;
                  const body = (
                    <>
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD54F]/80" />
                      <span>{c.label}</span>
                    </>
                  );

                  return (
                    <li key={c.label}>
                      {c.href ? (
                        <a
                          href={c.href}
                          target={
                            c.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            c.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="flex items-start gap-2.5 transition-colors hover:text-[#FFD54F]"
                        >
                          {body}
                        </a>
                      ) : (
                        <div className="flex items-start gap-2.5">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-xs text-white/90">
            &copy; {new Date().getFullYear()} ApotekerKita
          </p>
        </div>
      </div>
    </footer>
  );
}
