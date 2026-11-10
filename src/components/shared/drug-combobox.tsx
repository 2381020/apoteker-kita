import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchDrugNames } from "@/services/drugs.service";

interface DrugComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  exclude?: string;
}

export function DrugCombobox({
  id,
  value,
  onChange,
  placeholder = "Cari nama obat...",
  disabled = false,
  exclude,
}: DrugComboboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(false);

  const [inputValue, setInputValue] = useState(value);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const names = await searchDrugNames(search.trim(), 20);
        if (!active) return;
        setOptions(exclude ? names.filter((name) => name !== exclude) : names);
        setHighlight(0);
      } catch {
        if (active) setOptions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, open, exclude]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setInputValue(value);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const selectOption = (name: string) => {
    selectedRef.current = true;
    onChange(name);
    setInputValue(name);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
        />

        <Input
          id={id}
          value={inputValue}
          disabled={disabled}
          placeholder={placeholder}
          className="pl-9 pr-9"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          onChange={(event) => {
            setInputValue(event.target.value);
            setSearch(event.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              if (!selectedRef.current) setInputValue(value);
              selectedRef.current = false;
            }, 120);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setHighlight((current) =>
                Math.min(current + 1, Math.max(options.length - 1, 0)),
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlight((current) => Math.max(current - 1, 0));
            } else if (event.key === "Enter") {
              if (open && options[highlight]) {
                event.preventDefault();
                selectOption(options[highlight]);
              }
            } else if (event.key === "Escape") {
              setOpen(false);
              setInputValue(value);
            }
          }}
        />

        {value && !disabled && (
          <button
            type="button"
            aria-label="Hapus pilihan obat"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-secondary-text hover:bg-accent hover:text-main-text"
            onClick={() => {
              onChange("");
              setInputValue("");
              setSearch("");
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          {loading ? (
            <li className="flex items-center gap-2 px-3 py-2 text-sm text-secondary-text">
              <Loader2 size={14} className="animate-spin" />
              Mencari obat...
            </li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-secondary-text">
              Obat tidak ditemukan.
            </li>
          ) : (
            options.map((name, index) => (
              <li key={name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === highlight}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(name);
                  }}
                  onMouseEnter={() => setHighlight(index)}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-sm transition-colors",
                    index === highlight
                      ? "bg-accent text-main-text"
                      : "text-secondary-text",
                  )}
                >
                  {name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
