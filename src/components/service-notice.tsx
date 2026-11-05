import type { ServiceStatus } from "@/lib/types";

// Memberi tahu siswa, dengan bahasa awam, fitur mana yang sedang terbatas dan
// apa akibatnya bagi mereka. Detail konfigurasi (nama layanan, variabel env)
// untuk pengembang ada di README, bukan di layar siswa.
export function ServiceNotice({ status }: { status: ServiceStatus }) {
  const notes: string[] = [];
  if (status.llm === 0) {
    notes.push(
      "Latihan sedang tidak bisa dipakai. Coba lagi beberapa saat lagi.",
    );
  }
  if (!status.stt) {
    notes.push(
      "Ucapanmu diubah jadi teks oleh browser, jadi hasilnya bisa kurang tepat. Bicaralah pelan dan jelas.",
    );
  }
  if (!status.azure) {
    notes.push(
      "Suara tamu memakai suara bawaan browser, dan skor pengucapan sedang tidak tersedia.",
    );
  }
  if (notes.length === 0) return null;

  return (
    <div role="status" className="card space-y-2 p-4 text-sm">
      <p className="font-bold">Ada fitur yang sedang terbatas</p>
      <ul className="list-disc space-y-1 pl-5 text-muted">
        {notes.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
