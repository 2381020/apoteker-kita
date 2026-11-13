import { normalizeText } from "./text";

export interface KnowledgeEntry {
  keywords: string[];
  response: string;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 2;

  const rows = a.length + 1;
  const cols = b.length + 1;
  let previous = Array.from({ length: cols }, (_, index) => index);
  let current = new Array<number>(cols);

  for (let i = 1; i < rows; i++) {
    current[0] = i;
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
    }
    [previous, current] = [current, previous];
  }

  return previous[cols - 1];
}

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ["paracetamol", "acetaminophen", "panadol", "demam", "meriang", "nyeri", "sakit kepala"],
    response:
      "Paracetamol digunakan untuk meredakan nyeri ringan-sedang dan menurunkan demam. Dosis dewasa umumnya 500-1000 mg tiap 4-6 jam, maksimal 4000 mg per hari, namun tetap ikuti kemasan atau anjuran tenaga medis. Jangan menggabungkannya dengan produk lain yang juga mengandung paracetamol karena berisiko kerusakan hati. Konsultasikan ke apoteker bila demam lebih dari 3 hari atau nyeri memberat.",
  },
  {
    keywords: ["ibuprofen", "asam mefenamat", "diklofenak", "oaid", "nyeri sendi", "nyeri haid", "dismenore"],
    response:
      "Ibuprofen dan OAID lain meredakan nyeri dan radang, tetapi sebaiknya diminum setelah makan. Hindari bila Anda memiliki riwayat tukak lambung, gangguan ginjal, atau sedang hamil trimester akhir. Jangan dikombinasikan dengan OAID lain tanpa arahan dokter. Untuk nyeri haid, kompres hangat dan istirahat juga membantu.",
  },
  {
    keywords: ["antibiotik", "amoksisilin", "amoxicillin", "azitromisin", "infeksi", "resistensi"],
    response:
      "Antibiotik hanya boleh digunakan dengan resep dokter dan harus dihabiskan sesuai durasi yang diresepkan, meskipun Anda sudah merasa lebih baik. Menghentikan antibiotik terlalu cepat dapat menyebabkan resistensi. Jangan memakai antibiotik sisa untuk infeksi baru, dan jangan berbagi antibiotik dengan orang lain.",
  },
  {
    keywords: ["maag", "asam lambung", "omeprazol", "lansoprazol", "gastritis", "gerd", "perut perih", "ulu hati"],
    response:
      "Untuk keluhan maag/asam lambung, hindari makanan pedas, berlemak, kopi, dan alkohol; makan dalam porsi kecil tetapi teratur; serta jangan berbaring langsung setelah makan. Omeprazol umumnya diminum 30-60 menit sebelum makan. Bila keluhan berlangsung lebih dari 2 minggu, disertai muntah darah, BAB hitam, atau nyeri berat, segera periksa ke dokter.",
  },
  {
    keywords: ["asma", "salbutamol", "inhaler", "mengi", "bronkodilator"],
    response:
      "Salbutamol adalah obat pelega saluran napas untuk serangan asma. Gunakan sesuai petunjuk apoteker, kocok inhaler sebelum dipakai, dan selalu bawa inhaler pelega. Bila sesak napas berat, bibir kebiruan, atau inhaler tidak membantu, segera cari bantuan medis darurat.",
  },
  {
    keywords: ["diare", "mencret", "loperamida", "oralit", "dehidrasi"],
    response:
      "Diare ringan dapat ditangani dengan oralit dan cairan cukup. Loperamida boleh untuk diare akut tanpa demam tinggi, tetapi jangan digunakan bila ada darah atau lendir pada tinja, demam tinggi, atau nyeri perut hebat. Segera ke dokter bila diare lebih dari 2 hari, lemas berat, atau tidak bisa minum.",
  },
  {
    keywords: ["sembelit", "konstipasi", "susah bab", "susah buang air besar", "serat"],
    response:
      "Sembelit dapat dibantu dengan memperbanyak serat (buah, sayur, biji-bijian), minum air 6-8 gelas per hari, dan bergerak aktif. Laksatif sebaiknya digunakan sesekali dan sesuai petunjuk. Jangan menggunakan pencahar jangka panjang tanpa konsultasi. Bila sembelit disertai nyeri hebat, muntah, atau perdarahan, segera periksa.",
  },
  {
    keywords: ["batuk", "flu", "pilek", "panas dingin", "tenggorokan", "radang tenggorokan"],
    response:
      "Batuk pilek ringan biasanya membaik dalam 5-7 hari dengan istirahat, cairan hangat, dan menjaga kelembapan udara. Antibiotik tidak diperlukan untuk flu biasa. Hati-hati menggunakan obat batuk pada anak di bawah 2 tahun. Segera ke dokter bila batuk lebih dari 2 minggu, sesak, demam tinggi, atau batuk berdarah.",
  },
  {
    keywords: ["alergi", "gatal", "biduran", "ruam", "antihistamin", "cetirizine", "loratadine"],
    response:
      "Obat antihistamin seperti cetirizine atau loratadine dapat meredakan gatal dan biduran ringan. Jika muncul bengkak wajah/bibir, sesak napas, atau pusing hebat setelah terpapar pemicu, itu tanda reaksi berat dan memerlukan pertolongan darurat segera. Hindari pemicu alergi yang sudah diketahui.",
  },
  {
    keywords: ["hipertensi", "darah tinggi", "tekanan darah", "amlodipine", "captopril"],
    response:
      "Hipertensi perlu dikelola dengan pola makan rendah garam, aktivitas fisik rutin, dan obat rutin sesuai resep. Jangan menghentikan obat antihipertensi sendiri meskipun tekanan darah sudah turun. Ukur tekanan darah secara berkala dan konsultasikan target tekanan darah Anda kepada dokter.",
  },
  {
    keywords: ["diabetes", "gula darah", "metformin", "insulin", "kencing manis"],
    response:
      "Diabetes dikelola dengan pola makan seimbang, aktivitas fisik, pemantauan gula darah, dan obat sesuai resep. Metformin sebaiknya diminum bersama/ sesudah makan untuk mengurangi keluhan lambung. Kenali tanda gula darah terlalu rendah (lemas, berkeringat, gemetar) dan konsultasikan penyesuaian dosis hanya dengan dokter.",
  },
  {
    keywords: ["kolesterol", "statin", "simvastatin", "atrova", "lemak darah"],
    response:
      "Kolesterol tinggi dapat dikelola dengan mengurangi lemak jenuh dan gorengan, memperbanyak serat, serta berolahraga. Statin diminum sesuai resep, umumnya pada malam hari. Laporkan nyeri otot yang tidak biasa kepada dokter. Jangan menghentikan obat tanpa konsultasi.",
  },
  {
    keywords: ["vitamin", "suplemen", "multivitamin", "vitamin c", "vitamin d", "kalsium", "zat besi"],
    response:
      "Suplemen hanya diperlukan bila asupan dari makanan kurang atau ada kondisi khusus. Vitamin yang larut lemak (A, D, E, K) bisa menumpuk dan berbahaya bila berlebihan. Zat besi sebaiknya diminum dengan vitamin C dan dipisahkan dari teh/kopi. Konsultasikan suplemen dengan apoteker, terutama bila Anda sedang minum obat rutin.",
  },
  {
    keywords: ["hamil", "kehamilan", "menyusui", "bumil", "ibu hamil", "breastfeeding"],
    response:
      "Ibu hamil dan menyusui sebaiknya tidak mengonsumsi obat apa pun tanpa konsultasi tenaga kesehatan, termasuk obat bebas dan jamu. Paracetamol umumnya dianggap relatif aman dalam dosis wajar, tetapi obat lain perlu evaluasi. Suplemen asam folat dan zat besi dianjurkan sesuai anjuran dokter kandungan.",
  },
  {
    keywords: ["anak", "bayi", "balita", "sirup", "dosis anak"],
    response:
      "Dosis obat anak dihitung berdasarkan berat badan, bukan sekadar usia. Gunakan alat takar yang disertakan, jangan memakai sendok makan biasa. Hindari obat batuk pilek pada bayi dan anak di bawah 2 tahun tanpa arahan dokter. Simpan obat jauh dari jangkauan anak.",
  },
  {
    keywords: ["kedaluwarsa", "kadaluarsa", "expired", "tanggal kedaluwarsa"],
    response:
      "Jangan menggunakan obat yang sudah melewati tanggal kedaluwarsa karena efektivitasnya menurun dan dapat berbahaya. Obat yang berubah warna, bau, atau bentuk juga sebaiknya dibuang. Buang obat dengan cara yang aman, misalnya melalui program pengembalian obat di apotek, bukan ke saluran air.",
  },
  {
    keywords: ["minum obat", "sebelum makan", "sesudah makan", "kosong", "perut kosong", "aturan pakai"],
    response:
      "Aturan minum obat berbeda-beda. Obat dengan petunjuk 'sebelum makan' umumnya diminum 30-60 menit sebelum makan, sedangkan 'sesudah makan' diminum setelah makan. Jika petunjuknya 'perut kosong', minum sekitar 1 jam sebelum atau 2 jam sesudah makan. Ikuti etiket/resep dan tanyakan kepada apoteker bila ragu.",
  },
  {
    keywords: ["terlewat", "lupa minum", "lupa", "dosis terlewat", "dua dosis"],
    response:
      "Bila lupa minum obat, minum segera setelah ingat jika jedanya belum terlalu dekat dengan jadwal berikutnya. Jika sudah mendekati jadwal berikutnya, lewati dosis yang terlewat. Jangan menggandakan dosis untuk mengejar ketinggalan. Untuk obat tertentu (misalnya antiepilepsi atau insulin), tanyakan kepada dokter.",
  },
  {
    keywords: ["alkohol", "miras", "bir", "anggur"],
    response:
      "Alkohol dapat berinteraksi dengan banyak obat, termasuk paracetamol, obat tidur, antihistamin, dan antibiotik tertentu. Hindari alkohol selama pengobatan kecuali dinyatakan aman oleh tenaga kesehatan. Jika Anda meminum alkohol rutin, beri tahu dokter/apoteker sebelum memulai obat baru.",
  },
  {
    keywords: ["kopi", "kafein", "teh", "energi"],
    response:
      "Kopi dan minuman berkafein dapat meningkatkan risiko jantung berdebar dan gelisah, terutama bila diminum bersama obat stimulan atau obat asma. Kafein juga dapat mengurangi penyerapan beberapa obat bila diminum bersamaan. Beri jeda sekitar 1-2 jam dan batasi konsumsi kafein harian.",
  },
  {
    keywords: ["merokok", "rokok", "nikotin"],
    response:
      "Merokok dapat mengubah cara tubuh memproses beberapa obat dan menurunkan efektivitasnya, sekaligus meningkatkan risiko penyakit jantung dan paru. Berhenti merokok sangat dianjurkan; tanyakan dukungan berhenti merokok kepada tenaga kesehatan. Jangan merokok saat menggunakan inhaler atau obat pernapasan.",
  },
  {
    keywords: ["kapan ke dokter", "kapan harus ke dokter", "tanda bahaya", "darurat", "red flag"],
    response:
      "Segera cari bantuan medis bila muncul: nyeri dada, sesak napas berat, pingsan, kejang, perdarahan hebat, muntah darah, BAB hitam, bengkak wajah/bibir, ruam luas, demam tinggi yang tidak turun, atau penurunan kesadaran. Untuk keluhan ringan yang tidak membaik dalam beberapa hari, konsultasikan ke apoteker atau dokter.",
  },
  {
    keywords: ["sakit kepala", "migrain", "pusing berputar"],
    response:
      "Sakit kepala ringan dapat dibantu dengan istirahat di tempat tenang, cukup cairan, dan kompres. Paracetamol atau ibuprofen dapat digunakan sesuai aturan kemasan. Segera ke dokter bila sakit kepala hebat mendadak, disertai demam kaku leher, kelemahan anggota badan, gangguan penglihatan, atau setelah cedera kepala.",
  },
  {
    keywords: ["mual", "muntah", "pusing", "pusing berputar", "vertigo"],
    response:
      "Mual ringan dapat dibantu dengan makan porsi kecil, menghindari makanan berlemak, dan cukup cairan. Jangan mengemudi bila merasa pusing berat. Bila mual/muntah berlangsung lebih dari 24 jam, disertai dehidrasi, nyeri perut hebat, atau muntah darah, segera periksa ke fasilitas kesehatan.",
  },
  {
    keywords: ["tidur", "insomnia", "susah tidur", "sulit tidur"],
    response:
      "Susah tidur dapat dibantu dengan jadwal tidur teratur, mengurangi layar sebelum tidur, menghindari kafein sore/malam, dan rutin bergerak. Hindari penggunaan obat tidur tanpa resep dalam jangka panjang karena dapat menyebabkan ketergantungan. Jika insomnia menetap lebih dari 1 bulan, konsultasikan ke dokter.",
  },
  {
    keywords: ["jamu", "herbal", "tanaman obat", "suplemen herbal"],
    response:
      "Jamu dan herbal tidak selalu bebas risiko; beberapa dapat berinteraksi dengan obat resep atau membebani hati/ginjal. Beri tahu apoteker bila Anda mengonsumsi herbal. Hindari produk tanpa izin edar atau yang diklaim menyembuhkan semua penyakit.",
  },
  {
    keywords: ["halal", "izin edar", "bpom", "obat palsu"],
    response:
      "Pastikan obat memiliki izin edar BPOM dan dibeli di apotek atau fasilitas resmi. Waspadai harga tidak wajar, kemasan rusak, atau klaim berlebihan. Anda dapat memeriksa nomor izin edar melalui aplikasi/website resmi BPOM.",
  },
];

export interface KnowledgeMatch {
  entry: KnowledgeEntry;
  score: number;
}

export function matchKnowledge(query: string): KnowledgeMatch | null {
  const normalized = normalizeText(query);

  if (!normalized) return null;

  const tokens = new Set(normalized.split(" "));
  const tokenList = Array.from(tokens);
  let best: KnowledgeMatch | null = null;

  for (const entry of KNOWLEDGE) {
    let score = 0;

    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (!normalizedKeyword) continue;

      if (normalizedKeyword.includes(" ")) {
        if (normalized.includes(normalizedKeyword)) score += 4;
      } else if (tokens.has(normalizedKeyword)) {
        score += 2;
      } else if (
        normalizedKeyword.length >= 5 &&
        normalized.includes(normalizedKeyword)
      ) {
        score += 1;
      } else if (normalizedKeyword.length >= 5) {
        const fuzzyMatch = tokenList.some(
          (token) =>
            token.length >= 4 && levenshtein(token, normalizedKeyword) <= 1
        );
        if (fuzzyMatch) score += 1;
      }
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best;
}
