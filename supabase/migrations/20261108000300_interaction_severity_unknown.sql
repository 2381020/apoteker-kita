-- Tambah nilai severity untuk baris dataset DDInter yang tidak memiliki level.
-- Dipisah dari migrasi lain karena nilai enum baru tidak boleh dipakai dalam
-- transaksi yang sama saat enum ditambahkan.
alter type public.interaction_severity add value if not exists 'tidak diketahui';
