
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
        "group fixed bottom-20 right-20 z-50 flex h-[96px] w-[96px] items-center justify-center rounded-full border-[3px] border-white bg-[#174F49] shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#FFE082] active:scale-95",
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
      <span className="absolute right-0.5 top-0.5 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        <span className="relative h-4 w-4 rounded-full border-2 border-white bg-green-500" />
      </span>

      {/* Tooltip */}
      {tooltip && (
        <span
          className={cn(
            "pointer-events-none absolute right-full top-1/2 z-[60] mr-3 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-lg bg-[#263238] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200",
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
