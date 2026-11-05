// Tujuan setelah masuk/daftar hanya boleh path di dalam situs ini, supaya
// tautan ?next= tidak bisa dipakai mengarahkan pengguna ke situs lain.
export function safeNext(value: unknown, fallback = "/riwayat") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
