import { cn } from "@/lib/utils";

export interface FloatingButtonProps {
  onClick: () => void;
  tooltip?: string;
  className?: string;
}

export function FloatingButton({
  onClick,
  tooltip,
  className,
}: FloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buka Tanya Apoteker"
      className={cn(
        "group relative flex h-[4.5rem] w-[4.5rem] items-center justify-center",
        "rounded-full border-[3px] border-white bg-[#174F49]",
        "shadow-xl shadow-black/25 ring-1 ring-black/5",
        "transition-all duration-300",
        "hover:scale-105 hover:shadow-2xl",
        "focus:outline-none focus:ring-4 focus:ring-[#FFE082]",
        "active:scale-95",
        "sm:h-20 sm:w-20",
        className
      )}
    >
      <img
        src="/images/chatbot-ava.jpg"
        alt="Apoteker Kita"
        className="h-full w-full rounded-full object-cover"
      />
    </button>
  );
}

FloatingButton.displayName = "FloatingButton";