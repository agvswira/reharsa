// Membuat tabel database Reharsa: tabel akun milik Better Auth dan tabel
// riwayat latihan. Aman dijalankan berulang kali.
// Jalankan: npm run db:migrate
import { getMigrations } from "better-auth/db/migration";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL kosong. Isi dulu di .env.local.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });

// Harus sama dengan opsi database di src/lib/server/auth.ts.
const { toBeCreated, toBeAdded, runMigrations } = await getMigrations({
  database: pool,
  emailAndPassword: { enabled: true },
});
console.log(
  "Better Auth:",
  toBeCreated.length || toBeAdded.length
    ? `membuat ${toBeCreated.map((t) => t.table).join(", ") || "-"}, menambah kolom di ${toBeAdded.map((t) => t.table).join(", ") || "-"}`
    : "tabel sudah lengkap",
);
await runMigrations();

await pool.query(`
  create table if not exists practice_session (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references "user"(id) on delete cascade,
    scenario_id text not null,
    mood text not null,
    total integer not null,
    max integer not null,
    turns jsonb not null,
    evaluation jsonb not null,
    coaching jsonb not null,
    pronunciation jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
  );
  create index if not exists practice_session_user_created
    on practice_session (user_id, created_at desc);
`);
console.log("Riwayat latihan: tabel practice_session siap.");

await pool.end();
