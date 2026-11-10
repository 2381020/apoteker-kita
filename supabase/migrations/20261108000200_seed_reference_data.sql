-- Seed reference data. Safe to re-run thanks to unique constraints.

insert into public.medications
  (name, generic_name, brand, category, description, uses, dosage_form, strength, side_effects, contraindications, storage, is_prescription)
values
  (
    'Paracetamol', 'Paracetamol', 'Panadol', 'Analgesik / Antipiretik',
    'Obat pereda nyeri dan penurun demam yang aman untuk dewasa dan anak-anak.',
    array['Demam', 'Nyeri kepala', 'Nyeri otot', 'Nyeri gigi'],
    'Tablet / Sirup', '500 mg',
    array['Mual ringan', 'Reaksi alergi (jarang)'],
    array['Gagal hati berat', 'Alergi terhadap paracetamol'],
    'Simpan pada suhu kamar, jauh dari kelembaban dan sinar matahari langsung.',
    false
  ),
  (
    'Amoksisilin', 'Amoxicillin', 'Amoxil', 'Antibiotik',
    'Antibiotik dari golongan penicillin untuk mengobati infeksi bakteri.',
    array['Infeksi saluran pernapasan', 'Infeksi telinga', 'Infeksi saluran kemih'],
    'Kapsul / Sirup', '500 mg',
    array['Diare', 'Mual', 'Alergi kulit'],
    array['Alergi penicillin', 'Mononukleosis infeksiosa'],
    'Simpan pada suhu kamar. Sirup setelah dicampur simpan di kulkas.',
    true
  ),
  (
    'Omeprazol', 'Omeprazole', 'Omez', 'Anti-asam / PPI',
    'Obat penurun asam lambung untuk mengobati maag dan asam lambung.',
    array['Maag', 'Asam lambung (GERD)', 'Luka lambung'],
    'Kapsul', '20 mg',
    array['Sakit kepala', 'Diare', 'Nyeri perut'],
    array['Alergi omeprazol', 'Gagal hati berat'],
    'Simpan pada suhu kamar, lindung dari kelembaban.',
    false
  ),
  (
    'Salbutamol', 'Salbutamol', 'Ventolin', 'Bronkodilatator',
    'Obat peluaskan saluran napas untuk asma dan pendek nafas.',
    array['Asma bronkial', 'Pendek nafas', 'Bronkospasme'],
    'Inhaler / Tablet', '100 mcg / dosis',
    array['Detak jantung cepat', 'Gemetar', 'Kegelisahan'],
    array['Alergi salbutamol', 'Jantung koronik berat'],
    'Simpan pada suhu kamar, jangan sampai terjatuh inhaler.',
    true
  ),
  (
    'Loperamida', 'Loperamide', 'Imodium', 'Anti-diare',
    'Obat peredak detak usus besar untuk mengatasi diare akut.',
    array['Diare akut', 'Diare kronis (IBS)'],
    'Kapsul / Tablet', '2 mg',
    array['Sembelit', 'Mual', 'Pusing'],
    array['Diare dengan demam tinggi', 'Infeksi usus berat', 'Anak < 2 tahun'],
    'Simpan pada suhu kamar, jauh dari kelembaban.',
    false
  )
on conflict (name, brand) do nothing;

insert into public.interactions
  (medication_a, medication_b, severity, description, recommendation)
values
  (
    'Amoksisilin', 'Metotreksat', 'berat',
    'Amoksisilin dapat meningkatkan kadar metotreksat dalam darah, meningkatkan risiko toksisitas medula tulang.',
    'Hindari kombinasi atau gunakan sotto pengawasan medis ketat dengan pemantauan darah rutin.'
  ),
  (
    'Paracetamol', 'Warfarin', 'sedang',
    'Penggunaan paracetamol dalam jangka panjang dapat meningkatkan efek antikoagulan warfarin dan risiko perdarahan.',
    'Batasi penggunaan paracetamol lebih dari beberapa hari saat sedang mengonsumsi warfarin; konsultasi dokter.'
  ),
  (
    'Omeprazol', 'Clopidogrel', 'sedang',
    'Omeprazol dapat mengurangi aktivasi clopidogrel, menurunkan efektivitasnya sebagai antiagregasi thrombosit.',
    'Pertimbangkan penggunaan anti-asam alternatif seperti ranitidin; konsultasi dokter.'
  ),
  (
    'Salbutamol', 'Propranolol', 'berat',
    'Propranolol dapat memblokir efek salbutamol dan memicu bronkospasme yang parah pada pasien asma.',
    'Hindari kombinasi pada pasien asma; gunakan alternatif sotto pengawasan dokter.'
  ),
  (
    'Loperamida', 'Antibiotik (beberapa golongan)', 'ringan',
    'Kombinasi dapat menunda pengangkatan patogen dari usus pada diare infeksius berat.',
    'Jangan gunakan loperamida pada diare dengan darah atau demam tinggi tanpa saran dokter.'
  )
on conflict (medication_a, medication_b) do nothing;

insert into public.pharmacies
  (name, address, city, phone, distance, rating, is_open, services)
values
  (
    'Apotek Sehat Jaya', 'Jl. Sudirman No. 12, Kec. Tengah', 'Jakarta Pusat',
    '021-1234567', '1.2 km', 4.7, true,
    array['Resep', 'Obat bebas', 'Konsultasi apoteker', 'Pengiriman obat']
  ),
  (
    'Farmaku Sejahtera', 'Jl. Thamrin No. 45, Kebon Melati', 'Jakarta Pusat',
    '021-8765432', '2.4 km', 4.5, true,
    array['Resep', 'Obat generik', 'Vitamin', 'Konsultasi']
  ),
  (
    'Apotek Medika Care', 'Jl. Gajah Mada No. 88, Mangga Besar', 'Jakarta Barat',
    '021-5555000', '3.1 km', 4.3, false,
    array['Obat bebas', 'Alat kesehatan', 'Kosmetik']
  ),
  (
    'Farmazentra Farmasi', 'Jl. Jenderal Sudirman Kav. 52, Karet', 'Jakarta Selatan',
    '021-3333444', '4.0 km', 4.8, true,
    array['Resep', 'Obat jarang', 'Konsultasi apoteker', '24 Jam']
  ),
  (
    'Apotek Cepat Sembuh', 'Jl. MH Thamrin No. 10, Senen', 'Jakarta Pusat',
    '021-2222111', '1.8 km', 4.6, true,
    array['Obat bebas', 'Pengiriman', 'Vitamin']
  )
on conflict (name, address) do nothing;

insert into public.guides
  (title, category, summary, content, tags)
values
  (
    'Cara Minum Obat yang Benar', 'Umum',
    'Panduan cara mengonsumsi obat agar efektif dan aman.',
    'Selalu ikuti aturan pakai yang tertera di kemasan atau saran dokter/apoteker. Minum obat dengan air putih cukup, jangan dengan teh, kopi, atau susu kecuali dianjurkan. Jangan hentikan antibiotik tiba-tiba meskipun sudah merasa lebih baik.',
    array['cara minum', 'aturan pakai', 'keamanan']
  ),
  (
    'Mengapa Tidak Boleh Hentikan Antibiotik Tiba-tiba', 'Antibiotik',
    'Pentingnya menyelesaikan seluruh kursus antibiotik sesuai dokter.',
    'Menghentikan antibiotik sebelum waktu yang ditentukan dapat menyebabkan bakteri yang masih hidup menjadi resistent, sehingga infeksi lebih sulit diobat di kemudian hari.',
    array['antibiotik', 'resistensi', 'keamanan']
  ),
  (
    'Panduan Penggunaan Inhaler Asma', 'Asma',
    'Langkah-langkah menggunakan inhaler dengan benar agar obat sampai ke paru-paru.',
    'Kocok inhaler sebelum penggunaan, hilangkan tutup, hekang napas perlahan, tekan inhaler sambil menarik napas dalam-dalam, tahan napas selama 10 detik, lalu hekang perlahan.',
    array['asma', 'inhaler', 'saluran napas']
  ),
  (
    'Penyimpanan Obat di Rumah yang Benar', 'Umum',
    'Tips menyimpan obat agar kualitas dan daya guna terjaga.',
    'Simpan obat pada suhu kamar, jauh dari kelembaban, panas, dan sinar matahari langsung. Jangan simpan obat di kamar mandi (lembab) atau di dalam mobil yang panas. Jauhkan dari jangkauan anak-anak.',
    array['penyimpanan', 'rumah', 'keamanan']
  ),
  (
    'Mengenal Gejala Reaksi Alergi Obat', 'Keamanan',
    'Tanda-tanda alergi obat yang perlu diperhatikan segera.',
    'Gejala alergi obat antara lain gatal-gatal, ruam, bengkak di wajah/bibir, sesak napas, dan sesak. Jika terjadi sesak napas atau bengkak berat, segera kembangi ke fasilitas kesehatan terdekat.',
    array['alergi', 'keamanan', 'gejala']
  )
on conflict (title) do nothing;
