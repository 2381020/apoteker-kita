-- IMPORT DATASET DDInter 2.0 KE TABLE interactions
-- File: ddinter_downloads_code_A.csv
-- Struktur: DDInterID_A, Drug_A, DDInterID_B, Drug_B, Level

-- CONTOH 1: Data baris pertama
INSERT INTO public.interactions (medication_a, medication_b, severity, description, recommendation, source, ddinter_id, original_severity)
VALUES (
  'DDInter1263',      -- medication_a (DDInterID_A)
  'Abacavir',         -- medication_b (Drug_B)
  'moderate',         -- severity (dimasukkan lowercase)
  '[DDInter 2.0] Interaksi antara Naltrexone dan Abacavir sebesar Moderate',
  '[DDInter 2.0] Konsultasikan dengan dokter atau apoteker',
  'DDInter 2.0',      -- source
  'DDInter1263-Abacavir', -- ddinter_id
  'moderate'          -- original_severity
);

-- CONTOH 2: Data baris kedua
INSERT INTO public.interactions (medication_a, medication_b, severity, description, recommendation, source, ddinter_id, original_severity)
VALUES (
  'DDInter1',         -- medication_a
  'Orlistat',         -- medication_b
  'moderate',
  '[DDInter 2.0] Interaksi antara Abacavir dan Orlistat sebesar Moderate',
  '[DDInter 2.0] Konsultasikan dengan dokter atau apoteker',
  'DDInter 2.0',
  'DDInter1-Orlistat',
  'moderate'
);

-- CONTOH 3: Data baris ketiga
INSERT INTO public.interactions (medication_a, medication_b, severity, description, recommendation, source, ddinter_id, original_severity)
VALUES (
  'DDInter58',        -- medication_a
  'Dolutegravir',     -- medication_b
  'major',
  '[DDInter 2.0] Interaksi antara Aluminum hydroxide dan Dolutegravir sebesar Major',
  '[DDInter 2.0] Hindari kombinasi ini, konsultasikan dengan dokter',
  'DDInter 2.0',
  'DDInter58-Dolutegravir',
  'major'
);

-- CATATAN: 
-- Level dari dataset: Moderate->moderate, Major->major, Minor->minor
-- Silakan jalankan query di atas di Supabase SQL Editor
-- Setelah import, coba di halaman /interaksi untuk melihat hasil
-- Lakukan import file lain (code_B, code_D, dst) jika sudah pastikan import pertama sukses