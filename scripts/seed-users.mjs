import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = { ...process.env };
  const file = ".env.local";
  if (!existsSync(file)) return env;

  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = (match[2] ?? "").trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!env[key]) env[key] = value;
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Set VITE_SUPABASE_URL (atau SUPABASE_URL) dan SUPABASE_SERVICE_ROLE_KEY di .env.local terlebih dahulu."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = [
  {
    email: "pasien@apotekerkita.com",
    password: "pasien123",
    fullName: "Budi Santoso",
    role: "patient",
  },
  {
    email: "admin@apotekerkita.com",
    password: "admin123",
    fullName: "Dewi Administrasi",
    role: "admin",
  },
];

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

for (const account of accounts) {
  let userId;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { full_name: account.fullName },
  });

  if (createError) {
    if (!/already|registered|exists/i.test(createError.message)) throw createError;
    const existing = await findUserByEmail(account.email);
    if (!existing) throw createError;
    userId = existing.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    if (updateError) throw updateError;
  } else {
    userId = created.user.id;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: account.fullName,
      email: account.email,
      role: account.role,
    },
    { onConflict: "id" }
  );
  if (profileError) throw profileError;

  console.log(`OK  ${account.email} (${account.role})`);
}

console.log("Selesai. Akun demo siap digunakan.");
