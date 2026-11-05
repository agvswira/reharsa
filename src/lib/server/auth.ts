import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { pool } from "./db";
import { ServiceError } from "./env";

// Login email + password, khusus siswa. Latihan wajib masuk dulu: setiap
// rapor tersimpan ke riwayat pemiliknya, dan kuota layanan AI tidak bisa
// dipakai pengunjung tanpa akun.
export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [nextCookies()],
});

export async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

/** Untuk route API: tolak permintaan dari pengguna yang belum masuk. */
export async function requireUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new ServiceError("Masuk dulu untuk berlatih.", 401);
  return session.user;
}
