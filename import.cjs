const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.myrntqgbxqxjnbkmxgxm.supabase.co:5432/postgres'
});

const queries = [
  "INSERT INTO public.interactions (medication_a, medication_b, severity, description, recommendation, source, ddinter_id, original_severity) VALUES ('DDInter1263', 'Abacavir', 'moderate', \\'[DDInter 2.0] Interaksi antara Naltrexone dan Abacavir sebesar Moderate\\', \\'[DDInter 2.0] Konsultasikan dengan dokter atau apoteker\\', \\'DDInter 2.0\\', 'DDInter1263-Abacavir', 'moderate')"
];

pool.query(queries[0]).then(res => {
  console.log('Success: inserted', res.rowCount, 'row(s)');
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
});