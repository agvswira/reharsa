import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ScoreChart } from "@/components/score-chart";
import {
  levelOf,
  MOOD_LABEL,
  pct,
  progressByScenario,
  recommend,
  skillAverages,
  type ScoredSession,
} from "@/lib/progress";
import { getScenario, ORDERED } from "@/lib/scenarios";
import { currentUser } from "@/lib/server/auth";
import { listSessions } from "@/lib/server/history";

export const metadata: Metadata = { title: "Riwayat latihan · Reharsa" };

// Waktu ditampilkan dalam WITA, zona waktu Bali.
const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Makassar",
});
const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Makassar",
});
const oneDecimal = (n: number) =>
  n.toLocaleString("id-ID", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 font-bold text-accent-ink hover:opacity-90 active:translate-y-px";

export default function RiwayatPage() {
  return (
    <Suspense fallback={<p className="text-muted">Memuat riwayat latihanmu...</p>}>
      <History />
    </Suspense>
  );
}

// Empat ruas untuk skor 0-4, diwarnai menurut tingkat (merah, kuning,
// hijau). Labelnya ditulis di samping, jadi warna bukan satu-satunya tanda.
function SkillBar({ avg }: { avg: number }) {
  const level = levelOf((avg / 4) * 100);
  return (
    <span aria-hidden="true" className="grid grid-cols-4 gap-1">
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className="h-2 overflow-hidden rounded-sm bg-track">
          <span
            className={`block h-full ${level.bar}`}
            style={{ width: `${Math.max(0, Math.min(1, avg - (n - 1))) * 100}%` }}
          />
        </span>
      ))}
    </span>
  );
}

const skillLevel = (avg: number) => levelOf((avg / 4) * 100).label;

async function History() {
  const user = await currentUser();
  if (!user) redirect("/masuk?next=/riwayat");

  let sessions: ScoredSession[];
  try {
    sessions = await listSessions(user.id);
  } catch (err) {
    console.error("Gagal memuat riwayat:", err);
    return (
      <div className="space-y-6">
        <h1 className="text-[clamp(2rem,1.3rem+2.5vw,3.5rem)]">Riwayat latihan</h1>
        <div role="alert" className="card space-y-4 p-6 sm:p-8">
          <p className="text-lg">
            Riwayatmu tidak bisa dimuat sekarang. Rapor yang sudah tersimpan
            tidak hilang.
          </p>
          <Link href="/riwayat" className={primaryButton}>
            Muat ulang riwayat
          </Link>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-[clamp(2rem,1.3rem+2.5vw,3.5rem)]">Riwayat latihan</h1>
        <div className="card space-y-4 p-6 sm:p-8">
          <p className="text-lg">
            Belum ada latihan. Setelah kamu menyelesaikan satu situasi, rapor,
            skor per kemampuan, dan grafik perkembanganmu muncul di sini.
          </p>
          <Link href="/latihan" className={primaryButton}>
            Mulai latihan pertama
          </Link>
        </div>
      </div>
    );
  }

  const average = Math.round(
    sessions.reduce((sum, s) => sum + pct(s), 0) / sessions.length,
  );
  const avgOf = (list: ScoredSession[]) =>
    Math.round(list.reduce((sum, s) => sum + pct(s), 0) / list.length);
  const change =
    sessions.length >= 4
      ? avgOf(sessions.slice(0, 3)) - avgOf(sessions.slice(-3))
      : null;

  const skills = skillAverages(sessions);
  const weakest = skills.at(-1);
  const strongest = skills.length > 1 ? skills[0] : undefined;

  // Situasi untuk melatih kemampuan terlemah: yang memuat kriteria itu dan
  // skor terbaiknya paling rendah. Bahasa layanan ada di semua situasi.
  const progress = progressByScenario(sessions);
  const practiceFor = weakest
    ? ORDERED.filter((s) => s.criteria.some((c) => c.label === weakest.label)).sort(
        (a, b) => (progress[a.id]?.bestPct ?? -1) - (progress[b.id]?.bestPct ?? -1),
      )[0]
    : undefined;
  const practice = practiceFor ?? recommend(progress).scenario;

  // Grafik: 20 sesi terakhir, urut dari yang paling lama.
  const points = sessions
    .slice(0, 20)
    .reverse()
    .map((s) => ({
      id: s.id,
      label: getScenario(s.scenarioId)?.title ?? s.scenarioId,
      date: shortDate.format(new Date(s.createdAt)),
      pct: pct(s),
    }));

  // Perubahan dibanding percobaan sebelumnya di situasi yang sama.
  const previousOf = (index: number) =>
    sessions.slice(index + 1).find((x) => x.scenarioId === sessions[index].scenarioId);

  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h1 className="text-[clamp(2rem,1.3rem+2.5vw,3.5rem)]">Riwayat latihan</h1>
        <p className="max-w-prose text-lg text-muted">
          {sessions.length} sesi, rata-rata skor {average}%.
          {change !== null
            ? change === 0
              ? " Tiga sesi terbarumu setara dengan tiga sesi pertama."
              : ` Tiga sesi terbarumu ${change > 0 ? "naik" : "turun"} ${Math.abs(change)} poin persen dibanding tiga sesi pertama.`
            : ""}
        </p>
      </div>

      {/* Fokus layar: satu kemampuan yang paling perlu dilatih, plus langkahnya. */}
      {weakest ? (
        <section
          aria-labelledby="fokus-judul"
          className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_20rem]"
        >
          <div className="space-y-4">
            <p className="text-sm font-semibold text-soft">Paling perlu dilatih</p>
            <h2
              id="fokus-judul"
              className="text-[clamp(1.6rem,1.2rem+1.5vw,2.4rem)] leading-tight"
            >
              {weakest.label}
            </h2>
            <div className="max-w-sm space-y-2">
              <SkillBar avg={weakest.avg} />
              <p className="text-sm text-muted tabular-nums">
                Rata-rata {oneDecimal(weakest.avg)} dari 4 ({skillLevel(weakest.avg)}),
                dari {weakest.count} penilaian
              </p>
            </div>
            {strongest ? (
              <p className="text-muted">
                Paling kuat: <span className="font-semibold text-ink">{strongest.label}</span>{" "}
                ({oneDecimal(strongest.avg)} dari 4).
              </p>
            ) : null}
          </div>
          <div className="space-y-4 lg:pl-4">
            <p className="text-sm text-muted">Latihan yang melatih kemampuan ini</p>
            <p className="text-lg font-semibold">{practice.title}</p>
            <Link href={`/latihan/${practice.id}?mood=kesal`} className={`${primaryButton} w-full`}>
              Latih situasi ini
            </Link>
          </div>
        </section>
      ) : null}

      {/* Grafik selebar halaman, daftar kemampuan dua kolom di bawahnya:
          kalau berdampingan, kartu grafik ikut memanjang setinggi daftar. */}
      <div className="space-y-12">
        {points.length >= 2 ? (
          <ScoreChart points={points} />
        ) : (
          <div className="card p-5 sm:p-6">
            <p className="font-semibold">Apakah skormu naik?</p>
            <p className="mt-1 text-sm text-muted">
              Grafik muncul setelah dua sesi. Selesaikan satu situasi lagi.
            </p>
          </div>
        )}

        <section aria-labelledby="kemampuan-judul" className="space-y-4">
          <h2 id="kemampuan-judul" className="font-display text-2xl font-semibold">
            Semua kemampuan
          </h2>
          <ul className="grid gap-y-5 sm:grid-cols-2 sm:gap-x-12">
            {skills.map((k) => (
              <li
                key={k.label}
                className="grid grid-cols-[1fr_6rem] items-center gap-4"
              >
                <span>
                  <span className="block font-medium">{k.label}</span>
                  <span className="block text-sm text-muted tabular-nums">
                    {oneDecimal(k.avg)} dari 4, {skillLevel(k.avg)} ·{" "}
                    {k.count} penilaian
                  </span>
                </span>
                <SkillBar avg={k.avg} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="sesi-judul" className="space-y-4">
        <h2 id="sesi-judul" className="font-display text-2xl font-semibold">
          Semua sesi
        </h2>
        {/* Tanpa garis antar-baris: tiap baris punya latar saat disorot. */}
        <ol className="-mx-3 space-y-1">
          {sessions.map((s, i) => {
            const scenario = getScenario(s.scenarioId);
            const prev = previousOf(i);
            const delta = prev ? pct(s) - pct(prev) : null;
            return (
              <li key={s.id}>
                <Link
                  href={`/riwayat/${s.id}`}
                  className="grid gap-2 rounded-xl px-3 py-3.5 hover:bg-accent-soft sm:grid-cols-[1fr_10rem_7rem] sm:items-center sm:gap-3"
                >
                  <span className="min-w-0 space-y-0.5">
                    <span className="block truncate font-semibold">
                      {scenario?.title ?? s.scenarioId}
                    </span>
                    <span className="block text-sm text-muted">
                      {dateFmt.format(new Date(s.createdAt))} · suasana{" "}
                      {MOOD_LABEL[s.mood].toLowerCase()}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-track"
                    >
                      <span
                        className={`block h-full rounded-full ${levelOf(pct(s)).bar}`}
                        style={{ width: `${pct(s)}%` }}
                      />
                    </span>
                    <span className="w-12 text-right font-semibold tabular-nums">
                      {s.total}/{s.max}
                    </span>
                  </span>
                  <span className="text-sm tabular-nums text-muted sm:text-right">
                    {delta === null
                      ? "Percobaan pertama"
                      : delta === 0
                        ? "Sama dengan sebelumnya"
                        : `${delta > 0 ? "Naik" : "Turun"} ${Math.abs(delta)} poin %`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
