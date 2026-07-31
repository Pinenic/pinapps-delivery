// seed.js
// Seeds Phase 1 test data: the Corn Mart client row, one admin,
// and three test riders — all with working Supabase Auth logins.
//
// Setup:
//   npm install @supabase/supabase-js dotenv
//
// .env (do NOT commit this):
//   SUPABASE_URL=https://<your-project>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=<service role key, from Project Settings > API>
//
// Run:
//   node seed.js
//
// The service role key bypasses RLS, which is exactly what a seed
// script needs — never expose this key client-side.

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your .env file."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN = {
  email: "admin@corn-mart-delivery.test",
  password: "ChangeMe123!",
  name: "Platform Admin",
};

const RIDERS = [
  {
    email: "rider1@corn-mart-delivery.test",
    password: "ChangeMe123!",
    name: "Chanda Mwansa",
    phone: "+260971234561",
    vehicle_type: "motorbike",
    license_no: "KTK-0001",
  },
  {
    email: "rider2@corn-mart-delivery.test",
    password: "ChangeMe123!",
    name: "Bwalya Phiri",
    phone: "+260971234562",
    vehicle_type: "motorbike",
    license_no: "KTK-0002",
  },
  {
    email: "rider3@corn-mart-delivery.test",
    password: "ChangeMe123!",
    name: "Mutale Banda",
    phone: "+260971234563",
    vehicle_type: "bicycle",
    license_no: "KTK-0003",
  },
];

async function createAuthUser({ email, password }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  // If the user already exists (re-running the script), look them up instead
  if (error && error.message.toLowerCase().includes("already")) {
    const { data: list, error: listErr } =
      await supabase.auth.admin.listUsers();
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email === email);
    if (!existing) throw error;
    console.log(`  (already exists) ${email}`);
    return existing;
  }

  if (error) throw error;
  console.log(`  created auth user: ${email}`);
  return data.user;
}

async function seedClient() {
  console.log("Seeding client...");

  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("name", "Corn Mart")
    .maybeSingle();

  if (existing) {
    console.log("  (already exists) Corn Mart");
    return existing.id;
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: "Corn Mart",
      default_zone: "Lusaka",
      fee_rule: { type: "flat", amount: 25 },
    })
    .select("id, api_key")
    .single();

  if (error) throw error;
  console.log(`  created Corn Mart client — api_key: ${data.api_key}`);
  return data.id;
}

async function seedAdmin() {
  console.log("Seeding admin...");
  const user = await createAuthUser(ADMIN);

  const { error } = await supabase
    .from("admins")
    .upsert({ id: user.id, name: ADMIN.name }, { onConflict: "id" });

  if (error) throw error;
  console.log(`  admin ready: ${ADMIN.email} / ${ADMIN.password}`);
}

async function seedRiders() {
  console.log("Seeding riders...");

  for (const rider of RIDERS) {
    const user = await createAuthUser(rider);

    const { error } = await supabase.from("riders").upsert(
      {
        id: user.id,
        name: rider.name,
        phone: rider.phone,
        vehicle_type: rider.vehicle_type,
        license_no: rider.license_no,
        status: "available",
      },
      { onConflict: "id" }
    );

    if (error) throw error;
    console.log(`  rider ready: ${rider.email} / ${rider.password}`);
  }
}

async function main() {
  try {
    await seedClient();
    await seedAdmin();
    await seedRiders();
    console.log("\nSeed complete.");
    console.log("All test accounts use the password: ChangeMe123!");
  } catch (err) {
    console.error("Seed failed:", err.message || err);
    process.exit(1);
  }
}

main();
