import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, Activity, BookOpen, Building2, LayoutDashboard, ArrowRight, ShieldCheck } from "lucide-react";
import { listMedications } from "@/services/medications.service";
import { listInteractions } from "@/services/interactions.service";
import { listGuides } from "@/services/guides.service";
import { listPharmacies } from "@/services/pharmacies.service";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";

export function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    medications: 0,
    interactions: 0,
    guides: 0,
    pharmacies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      listMedications(),
      listInteractions({ page: 1, pageSize: 1 }),
      listGuides(),
      listPharmacies(),
    ])
      .then(([medications, interactions, guides, pharmacies]) => {
        if (!active) return;
        setCounts({
          medications: medications.length,
          interactions: interactions.total,
          guides: guides.length,
          pharmacies: pharmacies.length,
        });
      })
      .catch(() => {
        if (!active) return;
        setCounts({ medications: 0, interactions: 0, guides: 0, pharmacies: 0 });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageSkeleton />;

  const cards = [
    { title: "Total Obat", value: counts.medications, icon: Pill, href: "/admin/obat", desc: "Data dari database", accent: "primary" as const },
    { title: "Interaksi", value: counts.interactions, icon: Activity, href: "/admin/interaksi", desc: "Data dari database", accent: "secondary" as const },
    { title: "Panduan", value: counts.guides, icon: BookOpen, href: "/admin/panduan", desc: "Data dari database", accent: "success" as const },
    { title: "Apotek", value: counts.pharmacies, icon: Building2, href: "/admin/apotek", desc: "Data dari database", accent: "primary" as const },
  ];

  const links = [
    { href: "/admin/obat", label: "Kelola Obat", desc: "Tambah, edit, dan hapus data obat" },
    { href: "/admin/interaksi", label: "Kelola Interaksi", desc: "Atur data interaksi antar obat" },
    { href: "/admin/import", label: "Import Interaksi", desc: "Unggah dataset DDInter 2.0 dari file CSV" },
    { href: "/admin/panduan", label: "Kelola Panduan", desc: "Kelola artikel dan panduan kesehatan" },
    { href: "/admin/apotek", label: "Kelola Apotek", desc: "Kelola daftar apotek mitra" },
    { href: "/admin/pengguna", label: "Kelola Pengguna", desc: "Lihat daftar pengguna terdaftar" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Dashboard Admin"
        description="Kelola konten dan data platform ApotekerKita."
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.title} to={c.href}>
            <StatCard title={c.title} value={c.value} icon={c.icon} description={c.desc} accent={c.accent} />
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-main-text">Akses cepat</h2>
          <p className="mt-0.5 text-sm text-secondary-text">Kelola bagian platform lain dengan cepat.</p>
        </div>
        <ul className="divide-y divide-border">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                to={l.href}
                className="group flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent/50"
              >
                <div>
                  <p className="text-sm font-medium text-main-text">{l.label}</p>
                  <p className="text-xs text-secondary-text">{l.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      
    </div>
  );
}
