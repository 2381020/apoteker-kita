
import { cn } from "@/lib/utils";

export interface FloatingButtonProps {
  onClick: () => void;
  tooltip?: string;
  className?: string;
}

export function FloatingButton({
  onClick,
  tooltip = "Tanya Apoteker",
  className,
}: FloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buka Tanya Apoteker"
      className={cn(
        "group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-[#174F49] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#FFE082] active:scale-95 sm:h-20 sm:w-20 sm:border-[3px]",
        className
      )}
    >
      {/* Foto apoteker */}
      <img
        src="/images/chatbot-ava.jpg"
        alt="Apoteker Kita"
        className="h-full w-full rounded-full object-cover"
      />

      {/* Indikator online */}
      <span className="absolute right-0 top-0 flex h-3.5 w-3.5 sm:right-0.5 sm:top-0.5 sm:h-4 sm:w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 sm:h-4 sm:w-4" />
      </span>

      {/* Tooltip */}
      {tooltip && (
        <span
          className={cn(
            "pointer-events-none absolute right-full top-1/2 z-[60] mr-3 hidden -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-lg bg-[#263238] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 sm:block",
            "group-hover:translate-x-0 group-hover:opacity-100"
          )}
        >
          {tooltip}
        </span>
      )}
    </button>
  );
}

FloatingButton.displayName = "FloatingButton";
