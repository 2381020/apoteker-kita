
import * as React from "react";
import { Globe, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface TopBarProps {
  fullWidth?: boolean;
}

export function TopBar({ fullWidth = false }: TopBarProps) {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [query, setQuery] = React.useState("");

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const keyword = query.trim();

    navigate(
      keyword
        ? `/obat?q=${encodeURIComponent(keyword)}`
        : "/obat"
    );
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-[#164E49] pt-[var(--safe-top)] text-white">
      <div
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 px-3 sm:px-6",
          !fullWidth && "mx-auto max-w-[var(--layout-max)]"
        )}
      >
        {/* Language Selector */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Globe className="h-3.5 w-3.5 text-white/60" />

          <button
            type="button"
            onClick={() => setLang("id")}
            aria-pressed={lang === "id"}
            aria-label="Bahasa Indonesia"
            className={cn(
              "rounded px-1 py-1 text-[11px] font-semibold tracking-wide transition-colors",
              lang === "id"
                ? "text-[#FFD54F]"
                : "text-white/60 hover:text-white"
            )}
          >
            {t("topbar_lang_id")}
          </button>

          <span className="select-none text-[11px] text-white/25">
            /
          </span>

          <button
            type="button"
            onClick={() => setLang("en")}
            aria-pressed={lang === "en"}
            aria-label="English"
            className={cn(
              "rounded px-1 py-1 text-[11px] font-semibold tracking-wide transition-colors",
              lang === "en"
                ? "text-[#FFD54F]"
                : "text-white/60 hover:text-white"
            )}
          >
            {t("topbar_lang_en")}
          </button>
        </div>

        {/* Search */}
        <div className="flex shrink-0 items-center">
          <form
            onSubmit={submitSearch}
            className="relative hidden items-center sm:flex"
            role="search"
          >
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-white/40" />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("topbar_search_placeholder")}
              aria-label={t("topbar_search_aria")}
              className="h-6 w-44 rounded-full border border-white/10 bg-white/10 pl-8 pr-3 text-[11px] text-white placeholder-white/40 transition-colors focus:border-[#FFD54F]/60 focus:outline-none focus:ring-1 focus:ring-[#FFD54F]/40 md:w-56"
            />
          </form>

          <button
            type="button"
            aria-label={t("topbar_search_aria")}
            onClick={() => navigate("/obat")}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 sm:hidden"
          >
            <Search className="h-3.5 w-3.5 text-white/70" />
          </button>
        </div>
      </div>
    </div>
  );
}
