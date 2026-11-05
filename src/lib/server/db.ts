import "server-only";
import { Pool } from "pg";

// Satu pool koneksi per proses. Di mode dev, Next memuat ulang modul saat
// file berubah, jadi pool disimpan di globalThis supaya tidak bocor.
const globalForDb = globalThis as unknown as { reharsaPool?: Pool };

export const dbConfigured = (process.env.DATABASE_URL ?? "").trim() !== "";

export const pool =
  globalForDb.reharsaPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.reharsaPool = pool;
