import { AlertTriangle } from "lucide-react";

interface MedicalDisclaimerProps {
  text?: string;
  className?: string;
}

export function MedicalDisclaimer({
  text = "Informasi ini hanya sebagai referensi umum dan bukan pengganti konsultasi langsung dengan dokter atau apoteker.",
  className,
}: MedicalDisclaimerProps) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 ${className ?? ""}`}>
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
      <p className="text-xs leading-relaxed text-[#92400E] sm:text-sm">
        <span className="font-semibold">Catatan: </span>
        {text}
      </p>
    </div>
  );
}
