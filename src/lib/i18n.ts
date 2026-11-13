
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "id" | "en";

export const dict = {
  id: {
    topbar_search_placeholder: "Cari obat...",
    topbar_search_aria: "Cari obat",
    topbar_lang_id: "ID",
    topbar_lang_en: "EN",
    topbar_theme_light: "Cerah",
    topbar_theme_dark: "Gelap",

    navbar_login: "Masuk",
    navbar_register: "Daftar",
    navbar_logout: "Keluar",
    navbar_menu_open: "Buka menu",
    navbar_menu_close: "Tutup menu",

    mobile_services: "Layanan",
    mobile_admin: "Admin",
    mobile_account: "Akun",

    footer_tagline: "Platform informasi obat digital Indonesia untuk memahami obat, memeriksa interaksi, menghitung dosis, dan mengelola jadwal minum obat.",
    footer_features_heading: "Fitur",
    footer_quicklinks_heading: "Cepat",
    footer_contact_heading: "Kontak",
    footer_copyright: "&copy; {tahun} ApotekerKita",

    auth_login: "Masuk",
    auth_register: "Daftar",
    auth_back_home: "Kembali ke Beranda",
    auth_brand_title: "ApotekerKita",
    auth_brand_subtitle: "Platform informasi obat digital Indonesia",
    auth_demo_accounts: "Akun demo",
    auth_demo_fill: "Ketuk untuk mengisi otomatis",
    auth_demo_admin: "Admin",
    auth_demo_patient: "Pasien",

    home_hero_slide_1_title: "Teman Sehat, Solusi Tepat",
    home_hero_slide_1_desc: "Dapatkan informasi dan konsultasi seputar penggunaan obat dengan lebih mudah.",
    home_hero_slide_2_title: "Gunakan Obat dengan Bijak",
    home_hero_slide_2_desc: "Kenali aturan pakai dan informasi obat sebelum mengonsumsinya.",
    home_hero_slide_3_title: "Jangan Lewatkan Jadwal Obat",
    home_hero_slide_3_desc: "Bantu ingat jadwal konsumsi obat agar lebih teratur.",
    home_hero_slide_4_title: "Kesehatan Keluarga Lebih Terjaga",
    home_hero_slide_4_desc: "Mulai kebiasaan sehat dengan informasi farmasi yang tepat.",
    home_hero_slide_5_title: "Layanan Farmasi dalam Genggaman",
    home_hero_slide_5_desc: "Akses informasi kesehatan dan layanan farmasi secara praktis.",

    home_features_title: "Fitur Utama",
    home_features_desc: "Semua yang Anda butuhkan seputar obat, dalam satu platform.",
    home_guides_title: "Panduan Kesehatan",
    home_guides_desc: "Artikel pilihan seputar penggunaan obat yang aman.",
    home_view_all: "Lihat semua",
    home_read_more: "Baca selengkapnya",
    home_empty_guides_title: "Panduan tidak ditemukan",
    home_empty_guides_desc: "Coba gunakan kata kunci lain atau pilih kategori yang berbeda.",
    home_empty_guides_action: "Reset filter",
    home_logo_carouse_aria: "Logos yang dapat diakses",

    medications_title: "Cari Obat",
    medications_placeholder: "Cari nama obat...",
    interactions_title: "Periksa Kombinasi Obat",
    interactions_check_button: "Periksa Interaksi Obat",
    interactions_reset_button: "Reset",

    dosage_title: "Kalkulator Dosis",
    dosage_weight_label: "Berat Badan",
    dosage_weight_kg: "kg",
    dosage_height_label: "Tinggi Badan",
    dosage_height_cm: "cm",
    dosage_calculate: "Hitung Dosis",
    dosage_result_positive: "Interaksi ditemukan",
    dosage_result_negative: "Interaksi tidak ditemukan",
    dosage_disclaimer: "Konsultasikan kombinasi obat kepada dokter atau apoteker sebelum mengonsumsi obat baru.",

    guides_title: "Panduan Obat",
    guides_placeholder: "Cari judul panduan...",
    pharmacy_title: "Cari Apotek",
    pharmacy_search_placeholder: "Masukkan nama apotek...",
    chatbot_title: "Asisten Apoteker Virtual",
    chatbot_welcome: "Halo! Ada yang bisa dibantu?",
    chatbot_placeholder: "Ketik pertanyaan Anda...",
    chatbot_send: "Kirim pesan",

    dashboard_dashboard: "Dashboard",
    dashboard_reminders: "Pengingat Obat",
    dashboard_history: "Riwayat Konsumsi",
    dashboard_profile: "Profil Saya",
    dashboard_settings: "Pengaturan",

    profile_title: "Profil Saya",
    profile_notif_heading: "Notifikasi Pengingat",
    profile_notif_turnon: "Aktif",
    profile_notif_turnoff: "Tidak Aktif",
    profile_member_since: "Bergabung sejak",
    profile_footer_note_admin: "Jaga kerahasiaan akun administrator. Pastikan data referensi dikelola secara berkala agar informasi tetap akurat.",
    profile_footer_note_pasien: "Pastikan informasi profil Anda selalu terkini agar layanan dan pengingat kesehatan dapat berjalan dengan optimal.",

    admin_dashboard: "Dashboard Admin",
    admin_medications: "Kelola Obat",
    admin_interactions: "Interaksi Obat",
    admin_import: "Import Interaksi",
    admin_guides: "Kelola Panduan",
    admin_pharmacies: "Kelola Apotek",
    admin_users: "Kelola Pengguna",
  },

  en: {
    topbar_search_placeholder: "Search medications...",
    topbar_search_aria: "Search medications",
    topbar_lang_id: "ID",
    topbar_lang_en: "EN",
    topbar_theme_light: "Light",
    topbar_theme_dark: "Dark",

    navbar_login: "Login",
    navbar_register: "Register",
    navbar_logout: "Logout",
    navbar_menu_open: "Open menu",
    navbar_menu_close: "Close menu",

    mobile_services: "Services",
    mobile_admin: "Admin",
    mobile_account: "Account",

    footer_tagline: "Digital medication information platform in Indonesia for understanding medications, checking interactions, calculating dosage, and managing medication schedules.",
    footer_features_heading: "Features",
    footer_quicklinks_heading: "Quick Links",
    footer_contact_heading: "Contact",
    footer_copyright: "&copy; {year} ApotekerKita",

    auth_login: "Login",
    auth_register: "Register",
    auth_back_home: "Back to Home",
    auth_brand_title: "ApotekerKita",
    auth_brand_subtitle: "Digital medication information platform in Indonesia",
    auth_demo_accounts: "Demo accounts",
    auth_demo_fill: "Click to auto-fill",
    auth_demo_admin: "Admin",
    auth_demo_patient: "Patient",

    home_hero_slide_1_title: "Health Companion, Precise Solution",
    home_hero_slide_1_desc: "Easily get information and consultation regarding medication use.",
    home_hero_slide_2_title: "Use Medications Wisely",
    home_hero_slide_2_desc: "Know the usage rules and medication information before consuming it.",
    home_hero_slide_3_title: "Don't Miss Medication Schedule",
    home_hero_slide_3_desc: "Help remember medication schedule for more regular intake.",
    home_hero_slide_4_title: "Better Guarded Family Health",
    home_hero_slide_4_desc: "Start healthy habits with the right pharmacy information.",
    home_hero_slide_5_title: "Pharmacy at Your Fingertips",
    home_hero_slide_5_desc: "Access health information and pharmacy services conveniently.",

    home_features_title: "Key Features",
    home_features_desc: "Everything about medications, in one platform.",
    home_guides_title: "Health Guides",
    home_guides_desc: "Selected articles on safe medication use.",
    home_view_all: "View all",
    home_read_more: "Read more",
    home_empty_guides_title: "No guides found",
    home_empty_guides_desc: "Try using different keywords or selecting a different category.",
    home_empty_guides_action: "Reset filter",
    home_logo_carouse_aria: "Accessible logos",

    medications_title: "Find Medications",
    medications_placeholder: "Search medication name...",
    interactions_title: "Check Medication Combination",
    interactions_check_button: "Check Interaction",
    interactions_reset_button: "Reset",

    dosage_title: "Dosage Calculator",
    dosage_weight_label: "Weight",
    dosage_weight_kg: "kg",
    dosage_height_label: "Height",
    dosage_height_cm: "cm",
    dosage_calculate: "Calculate Dosage",
    dosage_result_positive: "Interaction found",
    dosage_result_negative: "No interaction found",
    dosage_disclaimer: "Consult a doctor or pharmacist before using a new medication.",

    guides_title: "Medication Guides",
    guides_placeholder: "Search guide title...",
    pharmacy_title: "Find Pharmacy",
    pharmacy_search_placeholder: "Enter pharmacy name...",
    chatbot_title: "Virtual Pharmacist Assistant",
    chatbot_welcome: "Hello! How can I help you?",
    chatbot_placeholder: "Type your question...",
    chatbot_send: "Send message",

    dashboard_dashboard: "Dashboard",
    dashboard_reminders: "Reminders",
    dashboard_history: "History",
    dashboard_profile: "Profile",
    dashboard_settings: "Settings",

    profile_title: "My Profile",
    profile_notif_heading: "Notification Preferences",
    profile_notif_turnon: "On",
    profile_notif_turnoff: "Off",
    profile_member_since: "Member since",
    profile_footer_note_admin: "Maintain administrator account confidentiality. Ensure reference data is managed periodically to keep information accurate.",
    profile_footer_note_pasien: "Ensure your profile information is always up-to-date so that health services and medication reminders can run optimally.",

    admin_dashboard: "Admin Dashboard",
    admin_medications: "Manage Medications",
    admin_interactions: "Manage Interactions",
    admin_import: "Import Interactions",
    admin_guides: "Manage Guides",
    admin_pharmacies: "Manage Pharmacies",
    admin_users: "Manage Users",
  },
};

const LANGUAGE_STORAGE_KEY = "apotekerkita-language";

const NAV_LABELS: Record<Language, Record<string, string>> = {
  id: {
    "/": "Beranda",
    "/obat": "Obat",
    "/interaksi": "Interaksi",
    "/dosis": "Dosis",
    "/panduan": "Panduan",
    "/apotek": "Apotek",
    "/tanya": "Tanya Apoteker",
    "/dashboard": "Dashboard",
    "/pengingat": "Pengingat Obat",
    "/riwayat": "Riwayat Konsumsi",
    "/profil": "Profil Saya",
    "/pengaturan": "Pengaturan",
  },
  en: {
    "/": "Home",
    "/obat": "Medications",
    "/interaksi": "Interactions",
    "/dosis": "Dosage",
    "/panduan": "Guides",
    "/apotek": "Pharmacy",
    "/tanya": "Ask Pharmacist",
    "/dashboard": "Dashboard",
    "/pengingat": "Reminders",
    "/riwayat": "History",
    "/profil": "Profile",
    "/pengaturan": "Settings",
  },
};

export interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof dict.id, vars?: Record<string, string | number>) => string;
  navLabel: (href: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;

  return template.replace(/\{([^}]+)\}/g, (_, key: string) =>
    String(vars[key] ?? `{${key}}`)
  );
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "id";

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "en" ? "en" : "id";
  } catch {
    return "id";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((current) => (current === "id" ? "en" : "id"));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Penyimpanan tidak tersedia.
    }
  }, [lang]);

  const t = useCallback(
    (key: keyof typeof dict.id, vars?: Record<string, string | number>) => {
      const translated = dict[lang][key] ?? dict.id[key] ?? String(key);
      return interpolate(translated, vars);
    },
    [lang]
  );

  const navLabel = useCallback(
    (href: string, fallback?: string) =>
      NAV_LABELS[lang][href] ?? fallback ?? "",
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
      navLabel,
    }),
    [lang, setLang, toggleLang, t, navLabel]
  );

  return createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
