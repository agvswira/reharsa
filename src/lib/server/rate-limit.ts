import "server-only";
import { ServiceError } from "./env";

// Batas sederhana per IP untuk menjaga kuota tier gratis. Disimpan di memori
// proses, jadi di serverless angkanya per instance, bukan global.
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

export function rateLimit(request: Request, bucket: string, max: number) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) {
    throw new ServiceError(
      "Batas latihan per jam tercapai untuk menjaga kuota gratis. Coba lagi nanti.",
      429,
    );
  }
  recent.push(now);
  hits.set(key, recent);
}
