import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { currentUser } from "@/lib/server/auth";
import { listSessions } from "@/lib/server/history";
import { getScenario } from "@/lib/scenarios";

export const metadata: Metadata = { title: "Riwayat latihan · Reharsa" };

// Waktu ditampilkan dalam WITA, zona waktu Bali.
const dateFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Makassar",
});

export default function RiwayatPage() {
  return (
    <Suspense fallback={<p className="text-muted">Memuat riwayat...</p>}>
      <History />
    </Suspense>
  );
}

async function History() {
  const user = await currentUser();
  if (!user) redirect("/masuk?next=/riwayat");

  const sessions = await listSessions(user.id);
  const pct = (s: { total: number; max: number }) =>
    Math.round((s.total / s.max) * 100);

  // Perkembangan: rata-rata 3 sesi terbaru dibanding 3 sesi pertama.
  const oldest = sessions.slice(-3);
  const newest = sessions.slice(0, 3);
  const avg = (list: typeof sessions) =>
    Math.round(list.reduce((sum, s) => sum + pct(s), 0) / list.length);
  const showTrend = sessions.length >= 4;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-[clamp(2rem,1.3rem+2.5vw,3.5rem)]">
          Riwayat latihan
        </h1>
        <p className="text-muted">
          {user.name ? `${user.name}, ` : ""}
          {sessions.length > 0
            ? `${sessions.length} sesi tersimpan.`
            : "belum ada sesi tersimpan."}
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="card space-y-4 p-6 sm:p-8">
          <p className="text-lg">
            Rapor tersimpan otomatis setiap kali kamu menyelesaikan latihan
            dalam keadaan masuk.
          </p>
          <Link
            href="/#pilih-situasi"
            className="inline-flex h-[50px] items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink hover:opacity-90"
          >
            Mulai latihan pertama
          </Link>
        </div>
      ) : (
        <>
          {showTrend ? (
            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="card p-5">
                <dt className="text-sm text-muted">3 sesi pertama</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums">
                  {avg(oldest)}%
                </dd>
              </div>
              <div className="card p-5">
                <dt className="text-sm text-muted">3 sesi terbaru</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums">
                  {avg(newest)}%
                </dd>
              </div>
              <div className="card p-5">
                <dt className="text-sm text-muted">Perubahan</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums">
                  {avg(newest) - avg(oldest) > 0 ? "+" : ""}
                  {avg(newest) - avg(oldest)} poin %
                </dd>
              </div>
            </dl>
          ) : null}

          <ol className="divide-y divide-line border-y border-line">
            {sessions.map((s) => {
              const scenario = getScenario(s.scenarioId);
              return (
                <li key={s.id}>
                  <Link
                    href={`/riwayat/${s.id}`}
                    className="grid gap-2 py-5 hover:bg-accent-soft sm:grid-cols-[1fr_12rem] sm:items-center sm:px-3"
                  >
                    <span className="space-y-1">
                      <span className="block font-semibold">
                        {scenario?.title ?? s.scenarioId}
                      </span>
                      <span className="block text-sm text-muted">
                        {dateFmt.format(new Date(s.createdAt))} · suasana{" "}
                        {s.mood}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="h-2 flex-1 overflow-hidden rounded-full bg-track"
                      >
                        <span
                          className="block h-full rounded-full bg-ink"
                          style={{ width: `${pct(s)}%` }}
                        />
                      </span>
                      <span className="w-16 text-right font-semibold tabular-nums">
                        {s.total}/{s.max}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
