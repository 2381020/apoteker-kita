import type { Guide } from "@/types";

export const guides: Guide[] = [
  {
    id: "gd-001",
    title: "Cara Minum Obat yang Benar",
    category: "Umum",
    summary: "Panduan cara mengonsumsi obat agar efektif dan aman.",
    content: "Selalu ikuti aturan pakai yang tertera di kemasan atau saran dokter/apoteker. Minum obat dengan air putih cukup, jangan dengan teh, kopi, atau susu kecuali dianjurkan. Jangan hentikan antibiotik tiba-tiba meskipun sudah merasa lebih baik.",
    tags: ["cara minum", "aturan pakai", "keamanan"],
    imageUrl: undefined,
  },
  {
    id: "gd-002",
    title: "Mengapa Tidak Boleh Hentikan Antibiotik Tiba-tiba",
    category: "Antibiotik",
    summary: "Pentingnya menyelesaikan seluruh kursus antibiotik sesuai dokter.",
    content: "Menghentikan antibiotik sebelum waktu yang ditentukan dapat menyebabkan bakteri yang masih hidup menjadi resistent, sehingga infeksi lebih sulit diobat di kemudian hari.",
    tags: ["antibiotik", "resistensi", "keamanan"],
    imageUrl: undefined,
  },
  {
    id: "gd-003",
    title: "Panduan Penggunaan Inhaler Asma",
    category: "Asma",
    summary: "Langkah-langkah menggunakan inhaler dengan benar agar obat sampai ke paru-paru.",
    content: "Kocok inhaler sebelum penggunaan, hilangkan tutup, hekang napas perlahan, tekan inhaler sambil menarik napas dalam-dalam, tahan napas selama 10 detik, lalu hekang perlahan.",
    tags: ["asma", "inhaler", "saluran napas"],
    imageUrl: undefined,
  },
  {
    id: "gd-004",
    title: "Penyimpanan Obat di Rumah yang Benar",
    category: "Umum",
    summary: "Tips menyimpan obat agar kualitas dan daya guna terjaga.",
    content: "Simpan obat pada suhu kamar, jauh dari kelembaban, panas, dan sinar matahari langsung. Jangan simpan obat di kamar mandi (lembab) atau di dalam mobil yang panas. Jauhkan dari jangkauan anak-anak.",
    tags: ["penyimpanan", "rumah", "keamanan"],
    imageUrl: undefined,
  },
  {
    id: "gd-005",
    title: "Mengenal Gejala Reaksi Alergi Obat",
    category: "Keamanan",
    summary: "Tanda-tanda alergi obat yang perlu diperhatikan segera.",
    content: "Gejala alergi obat antara lain gatal-gatal, ruam, bengkak di wajah/bibir, sesak napas, dan sesak. Jika terjadi sesak napas atau bengkak berat, segera kembangi ke fasilitas kesehatan terdekat.",
    tags: ["alergi", "keamanan", "gejala"],
    imageUrl: undefined,
  },
];
