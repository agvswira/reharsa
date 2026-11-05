import type { ServiceStatus } from "@/lib/types";

// Menjelaskan dengan jujur fitur mana yang belum aktif karena konfigurasi kosong.
export function ServiceNotice({ status }: { status: ServiceStatus }) {
  const missing: string[] = [];
  if (status.llm === 0) {
    missing.push(
      "Tamu AI dan penilaian belum aktif: isi minimal satu provider LLM di .env.local.",
    );
  } else if (status.llm === 1) {
    missing.push(
      "Hanya ada satu provider LLM. Tambahkan provider kedua supaya latihan tetap jalan saat yang pertama kena limit.",
    );
  }
  if (!status.stt) {
    missing.push(
      "Ucapanmu diubah jadi teks oleh pengenalan suara bawaan browser, yang kurang akurat dibanding Whisper.",
    );
  }
  if (!status.azure) {
    missing.push(
      "Suara tamu memakai suara bawaan browser dan skor pengucapan tidak tersedia, karena AZURE_SPEECH_KEY atau AZURE_SPEECH_REGION kosong.",
    );
  }
  if (missing.length === 0) return null;

  return (
    <div
      role="status"
      className="space-y-2 rounded-md border border-line bg-surface p-4 text-sm"
    >
      <p className="font-bold">Beberapa layanan belum lengkap</p>
      <ul className="list-disc space-y-1 pl-5 text-muted">
        {missing.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
