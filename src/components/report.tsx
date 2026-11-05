"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { levelOf } from "@/lib/progress";
import type { Scenario } from "@/lib/scenarios";
import type {
  Coaching,
  Evaluation,
  PronunciationResult,
  Turn,
} from "@/lib/types";

export type ReportData = {
  evaluation: Evaluation;
  coaching: Coaching;
  // Tidak ada untuk rapor yang dibuka dari riwayat.
  providers?: { evaluator: string; coach: string };
  pronunciation: PronunciationResult[];
  pronFailures: number;
  saved?: { id: string | null };
};

// Kata dengan akurasi di bawah angka ini ditandai untuk dilatih ulang.
const WEAK_WORD = 60;

function average(values: number[]) {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

// Warna ruas mengikuti tingkat skor (lihat levelOf); angka skor selalu
// tertulis di sebelahnya.
function ScoreBar({ score }: { score: number }) {
  const fill = levelOf((score / 4) * 100).bar;
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={`h-2.5 w-8 rounded-sm ${n <= score ? fill : "bg-track"}`}
        />
      ))}
    </span>
  );
}

export function Report({
  scenario,
  data,
  turns,
  onRestart,
  restartHref,
  dateLabel,
}: {
  scenario: Scenario;
  data: ReportData;
  turns: Turn[];
  // Rapor baru: ulangi di tempat. Rapor dari riwayat: tautan ke situasinya.
  onRestart?: () => void;
  restartHref?: string;
  dateLabel?: string;
}) {
  const { evaluation, coaching, pronunciation, pronFailures } = data;

  // Rapor menggantikan halaman percakapan yang mungkin sudah tergulir jauh;
  // mulai baca dari atas, dan pindahkan fokus ke judul supaya pembaca layar
  // langsung membacakan total poin.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, []);
  const total = evaluation.criteria.reduce((sum, c) => sum + c.score, 0);
  const max = scenario.criteria.length * 4;
  const labelOf = (id: string) =>
    scenario.criteria.find((c) => c.id === id)?.label ?? id;

  // Satu kriteria dengan skor terendah jadi fokus latihan berikutnya.
  const focus = [...evaluation.criteria].sort((a, b) => a.score - b.score)[0];
  const showFocus = focus && focus.score < 4;

  const weakWords = pronunciation
    .flatMap((p) => p.words)
    .filter((w) => w.accuracy < WEAK_WORD && w.errorType !== "Omission")
    .sort((a, b) => a.accuracy - b.accuracy)
    .filter(
      (w, i, all) =>
        all.findIndex((x) => x.word.toLowerCase() === w.word.toLowerCase()) === i,
    )
    .slice(0, 8);

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Rapor · {scenario.title}
            {dateLabel ? ` · ${dateLabel}` : ""}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-4xl font-semibold tabular-nums outline-none sm:text-5xl"
          >
            {total} dari {max} poin
          </h1>
          <p className="max-w-prose text-lg">{coaching.summary}</p>
          {data.saved?.id ? (
            <p className="text-sm text-muted">
              Rapor ini tersimpan.{" "}
              <Link href="/riwayat" className="rounded font-semibold text-ink underline">
                Lihat riwayat latihanmu
              </Link>
            </p>
          ) : data.saved ? (
            <p className="text-sm text-muted">
              Rapor ini gagal disimpan ke riwayat, tapi isinya tetap bisa kamu
              baca di sini.
            </p>
          ) : null}
        </div>
        {showFocus ? (
          <div className="self-start card p-4">
            <p className="text-sm text-muted">Fokus latihan berikutnya</p>
            <p className="font-display text-xl font-semibold">
              {labelOf(focus.id)}
            </p>
            <p className="mt-1 text-sm tabular-nums text-muted">
              Skor {focus.score}/4
            </p>
            <p className="mt-2">{focus.comment}</p>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="kriteria" className="space-y-4">
        <h2 id="kriteria" className="text-xl font-bold">
          Skor per kriteria
        </h2>
        <ol className="divide-y divide-line border-y border-line">
          {evaluation.criteria.map((c) => (
            <li key={c.id} className="space-y-2 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold">{labelOf(c.id)}</h3>
                <div className="flex items-center gap-3">
                  <ScoreBar score={c.score} />
                  <span className="font-bold tabular-nums">{c.score}/4</span>
                </div>
              </div>
              <p className="max-w-prose">{c.comment}</p>
              {c.evidence ? (
                <blockquote lang="en" className="border-l-2 border-line pl-3 text-sm text-muted">
                  Ucapanmu: “{c.evidence}”
                </blockquote>
              ) : (
                <p className="text-sm text-muted">
                  Tidak ada ucapanmu yang menunjukkan kriteria ini.
                </p>
              )}
              {c.confidence < 0.6 ? (
                <p className="text-sm text-alert">
                  Penilai kurang yakin dengan skor ini; anggap sebagai perkiraan.
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {coaching.better_phrases.length > 0 ? (
        <section aria-labelledby="kalimat" className="space-y-4">
          <h2 id="kalimat" className="text-xl font-bold">
            Kalimat yang bisa lebih baik
          </h2>
          <ul className="space-y-6">
            {coaching.better_phrases.map((p, i) => (
              <li key={i} className="space-y-2">
                <p className="text-muted">
                  <span className="sr-only">Kalimatmu: </span>“{p.original}”
                </p>
                <p lang="en" className="rounded-md bg-accent-soft px-4 py-2 font-bold">
                  <span className="sr-only">Coba katakan: </span>
                  {p.suggestion}
                </p>
                <p className="text-sm text-muted">{p.why}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="pengucapan" className="space-y-4">
        <h2 id="pengucapan" className="text-xl font-bold">
          Pengucapan
        </h2>
        {pronunciation.length > 0 ? (
          <>
            <dl className="flex flex-wrap gap-x-10 gap-y-3">
              <div>
                <dt className="text-sm text-muted">Kejelasan kata</dt>
                <dd className="text-2xl font-bold tabular-nums">
                  {average(pronunciation.map((p) => p.accuracy))}/100
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Kelancaran</dt>
                <dd className="text-2xl font-bold tabular-nums">
                  {average(pronunciation.map((p) => p.fluency))}/100
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Kalimat dinilai</dt>
                <dd className="text-2xl font-bold tabular-nums">
                  {pronunciation.length}
                </dd>
              </div>
            </dl>
            {weakWords.length > 0 ? (
              <div className="space-y-2">
                <p>Latih lagi kata-kata ini:</p>
                <ul className="flex flex-wrap gap-2">
                  {weakWords.map((w) => (
                    <li
                      key={w.word}
                      className="card px-3 py-1"
                    >
                      {w.word}{" "}
                      <span className="text-sm text-muted tabular-nums">
                        {w.accuracy}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Semua kata yang kamu ucapkan terdengar jelas.</p>
            )}
            <p className="text-sm text-muted">
              Skor dari Azure Pronunciation Assessment. Ini mengukur seberapa
              jelas kata terdengar, bukan seberapa mirip aksen penutur asli,
              dan tidak dihitung ke poin rapor.
            </p>
          </>
        ) : (
          <p className="text-muted">
            {pronFailures > 0
              ? "Penilaian pengucapan gagal untuk kalimatmu kali ini."
              : "Belum ada kalimat yang dinilai pengucapannya. Penilaian ini hanya berjalan saat kamu bicara lewat mikrofon dan layanan Azure aktif."}
          </p>
        )}
      </section>

      <details className="card p-4">
        <summary className="font-bold">Transkrip lengkap</summary>
        <ol className="mt-3 space-y-2 text-sm">
          {turns.map((t, i) => (
            <li key={i}>
              <span className="font-bold">
                {t.speaker === "guest" ? scenario.guest.name : "Kamu"}:
              </span>{" "}
              {t.text}
            </li>
          ))}
        </ol>
      </details>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        {onRestart ? (
          <button
            type="button"
            onClick={onRestart}
            className="min-h-11 rounded-full bg-accent px-5 font-bold text-accent-ink hover:opacity-90 active:translate-y-px"
          >
            Ulangi situasi ini
          </button>
        ) : (
          <Link
            href={restartHref ?? `/latihan/${scenario.id}`}
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-accent-ink hover:opacity-90 active:translate-y-px"
          >
            Ulangi situasi ini
          </Link>
        )}
        <Link
          href="/latihan"
          className="inline-flex min-h-11 items-center rounded-full border border-line-2 px-5 font-bold hover:bg-accent-soft"
        >
          Pilih situasi lain
        </Link>
      </div>
      <p className="text-sm text-muted">
        {data.providers
          ? `Dinilai oleh ${data.providers.evaluator}, umpan balik oleh ${data.providers.coach}. `
          : ""}
        Skor ini alat latihan, bukan sertifikasi.
      </p>
    </div>
  );
}
