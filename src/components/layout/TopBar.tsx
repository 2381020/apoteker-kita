import * as React from "react";
import { Globe, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TopBarProps {
  fullWidth?: boolean;
}

export function TopBar({ fullWidth = false }: TopBarProps) {
  const navigate = useNavigate();
  const [lang, setLang] = React.useState<"ID" | "EN">("ID");
  const [query, setQuery] = React.useState("");

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = query.trim();
    navigate(keyword ? `/obat?q=${encodeURIComponent(keyword)}` : "/obat");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#164E49] border-b border-white/10 text-white">
      <div
        className={cn(
          "flex h-[var(--topbar-h)] w-full items-center justify-between px-4 sm:px-6",
          !fullWidth && "mx-auto max-w-[var(--layout-max)]"
        )}
      >
        <div className="flex shrink-0 items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-white/60" />
          <button
            onClick={() => setLang("ID")}
            className={cn(
              "text-[11px] font-semibold tracking-wide transition-colors",
              lang === "ID" ? "text-[#FFD54F]" : "text-white/60 hover:text-white"
            )}
          >
            ID
          </button>
          <span className="select-none text-[11px] text-white/25">/</span>
          <button
            onClick={() => setLang("EN")}
            className={cn(
              "text-[11px] font-semibold tracking-wide transition-colors",
              lang === "EN" ? "text-[#FFD54F]" : "text-white/60 hover:text-white"
            )}
          >
            EN
          </button>
        </div>

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
            placeholder="Cari obat..."
            aria-label="Cari obat"
            className="h-6 w-44 rounded-full border border-white/10 bg-white/10 pl-8 pr-3 text-[11px] text-white placeholder-white/40 transition-colors focus:border-[#FFD54F]/60 focus:outline-none focus:ring-1 focus:ring-[#FFD54F]/40 md:w-56"
          />
        </form>
        <button
          type="button"
          aria-label="Cari obat"
          onClick={() => navigate("/obat")}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 sm:hidden"
        >
          <Search className="h-3.5 w-3.5 text-white/70" />
        </button>
        </div>
      </div>
    </div>
  );
}
