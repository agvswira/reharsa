import Link from "next/link";

export type ChartPoint = {
  id: string;
  label: string;
  date: string;
  pct: number;
};

/**
 * Batang skor per sesi, urut dari yang paling lama. Satu seri, jadi tanpa
 * legenda; judul menyebut pertanyaannya. Setiap batang adalah tautan ke
 * rapornya, dengan tooltip saat disorot atau difokus. Daftar sesi di bawah
 * grafik berfungsi sebagai tampilan tabel.
 */
export function ScoreChart({ points }: { points: ChartPoint[] }) {
  return (
    <figure className="card space-y-4 p-5 sm:p-6">
      <figcaption className="space-y-1">
        <p className="font-semibold">Apakah skormu naik?</p>
        <p className="text-sm text-muted">
          Skor tiap sesi dalam persen, dari yang paling lama. Pilih batang untuk
          membuka rapornya.
        </p>
      </figcaption>
      <div className="grid grid-cols-[2.5rem_1fr] gap-2">
        <div
          aria-hidden="true"
          className="flex h-48 flex-col justify-between text-right text-xs tabular-nums text-muted"
        >
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
        <div className="relative h-48">
          {/* Garis bantu tipis di 0, 50, 100. */}
          <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between">
            <span className="border-t border-line" />
            <span className="border-t border-line" />
            <span className="border-t border-line-2" />
          </div>
          <ol className="absolute inset-0 flex items-end gap-[2px]">
            {points.map((p) => (
              <li key={p.id} className="group relative flex h-full min-w-0 flex-1 items-end justify-center">
                <Link
                  href={`/riwayat/${p.id}`}
                  aria-label={`${p.label}, ${p.date}: ${p.pct} persen`}
                  className="flex h-full w-full max-w-10 items-end rounded-t-[4px] outline-offset-2"
                >
                  <span
                    className="block w-full rounded-t-[4px] bg-ink transition-opacity group-hover:opacity-80"
                    style={{ height: `max(${p.pct}%, 3px)` }}
                  />
                </Link>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max max-w-56 -translate-x-1/2 rounded-md border border-line-2 bg-surface px-3 py-2 text-left text-xs shadow-sm group-focus-within:block group-hover:block"
                >
                  <span className="block font-semibold">{p.label}</span>
                  <span className="block text-muted">
                    {p.date} · {p.pct}%
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </figure>
  );
}
