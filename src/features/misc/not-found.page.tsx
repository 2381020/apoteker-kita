import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Compass className="h-10 w-10" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-secondary-text">
        404
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-main-text">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-secondary-text">
        Halaman yang Anda cari mungkin sudah dipindahkan atau tidak pernah ada.
        Mari kembali ke beranda.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link to="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
