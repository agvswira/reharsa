import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GuestAvatar } from "@/components/guest-avatar";
import {
  BestScore,
  MoodField,
  ScenarioPicker,
} from "@/components/scenario-picker";
import { ServiceNotice } from "@/components/service-notice";
import {
  pct,
  progressByScenario,
  recommend,
  type ScenarioProgress,
} from "@/lib/progress";
import { channelLabel, GROUPS, HOTEL_NAME, SCENARIOS } from "@/lib/scenarios";
import { currentUser } from "@/lib/server/auth";
import { serviceStatus } from "@/lib/server/env";
import { listSessions } from "@/lib/server/history";
import { pageTitle } from "@/lib/ui";

export const metadata: Metadata = { title: "Pilih situasi · Reharsa" };

export default function LatihanPage() {
  return (
    <Suspense
      fallback={<p className="text-muted">Memuat situasi dan skormu...</p>}
    >
      <Picker />
    </Suspense>
  );
}

async function Picker() {
  const user = await currentUser();
  if (!user) redirect("/masuk?next=/latihan");

  // Skor dipakai untuk saran dan progres. Bila database gagal, latihan tetap
  // bisa dipilih; hanya progresnya yang tidak tampil.
  let progress: Record<string, ScenarioProgress> = {};
  let average: number | null = null;
  let historyFailed = false;
  try {
    const sessions = await listSessions(user.id);
    progress = progressByScenario(sessions);
    if (sessions.length) {
      average = Math.round(
        sessions.reduce((sum, s) => sum + pct(s), 0) / sessions.length,
      );
    }
  } catch (err) {
    console.error("Gagal memuat riwayat untuk halaman latihan:", err);
    historyFailed = true;
  }

  const tried = Object.keys(progress).length;
  const next = recommend(progress);

  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h1 className={pageTitle}>
          Om Swastiastu, {user.name}.
        </h1>
        <p className="max-w-prose text-lg text-muted">
          Shift-mu hari ini di {HOTEL_NAME}.{" "}
          {historyFailed
            ? "Skormu tidak bisa dimuat sekarang, tapi semua situasi tetap bisa dilatih."
            : tried === 0
              ? `Ada ${SCENARIOS.length} situasi. Mulai dari yang disarankan di bawah, rapormu tersimpan otomatis.`
              : `${tried} dari ${SCENARIOS.length} situasi sudah kamu coba, rata-rata skor ${average}%.`}{" "}
          {tried > 0 ? (
            <Link
              href="/riwayat"
              className="rounded font-semibold text-ink underline"
            >
              Lihat perkembanganmu
            </Link>
          ) : null}
        </p>
      </div>

      <ServiceNotice status={serviceStatus()} />

      {/* Fokus layar: satu situasi yang paling berguna untuk dilatih berikutnya. */}
      <section aria-labelledby="saran-judul">
        <form
          action={`/latihan/${next.scenario.id}`}
          className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_20rem]"
        >
          <div className="space-y-4">
            <p className="text-sm font-semibold text-soft">
              Saran berikutnya · {next.reason}
            </p>
            <h2
              id="saran-judul"
              className="text-[clamp(1.6rem,1.2rem+1.5vw,2.4rem)] leading-tight"
            >
              {next.scenario.title}
            </h2>
            <p className="max-w-prose text-muted">{next.scenario.situation}</p>
            <p className="text-sm text-muted">
              {next.scenario.department} · {channelLabel(next.scenario)}
            </p>
          </div>
          <div className="space-y-5 lg:pl-4">
            <div className="flex items-center gap-3">
              <GuestAvatar scenario={next.scenario} size="lg" />
              <div>
                <p className="font-semibold">{next.scenario.guest.name}</p>
                <p className="text-sm text-muted">
                  {next.scenario.kind === "interview" ? "Pewawancara" : "Tamu"}{" "}
                  dari {next.scenario.guest.origin}
                </p>
              </div>
            </div>
            <BestScore progress={progress[next.scenario.id]} />
            <MoodField scenario={next.scenario} />
            <button
              type="submit"
              className="min-h-12 w-full rounded-full bg-accent px-5 text-lg font-bold text-accent-ink hover:opacity-90 active:translate-y-px"
            >
              Mulai situasi ini
              <span className="sr-only">: {next.scenario.title}</span>
            </button>
          </div>
        </form>
      </section>

      <nav aria-label="Kategori situasi" className="flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <a
            key={g.category}
            href={`#grup-${g.category}`}
            className="inline-flex min-h-11 items-center rounded-full border border-line-2 px-4 text-sm font-medium hover:border-edge hover:bg-accent-soft"
          >
            {g.title}
            <span className="ml-2 tabular-nums text-muted">
              {SCENARIOS.filter((s) => s.category === g.category).length}
            </span>
          </a>
        ))}
      </nav>

      <ScenarioPicker progress={progress} />
    </div>
  );
}
