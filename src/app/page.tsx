import { connection } from "next/server";
import { Suspense } from "react";
import { EmotionMeter } from "@/components/emotion-meter";
import { ServiceNotice } from "@/components/service-notice";
import { SCENARIOS, type Mood } from "@/lib/scenarios";
import { serviceStatus } from "@/lib/server/env";

// Status layanan dibaca saat request supaya mengikuti env yang aktif.
async function CurrentServiceNotice() {
  await connection();
  return <ServiceNotice status={serviceStatus()} />;
}

const MOODS: { value: Mood; label: string; hint: string }[] = [
  { value: "sabar", label: "Sabar", hint: "mulai tenang" },
  { value: "kesal", label: "Kesal", hint: "mulai jengkel" },
  { value: "marah", label: "Marah", hint: "mulai emosi tinggi" },
];

// Cuplikan contoh untuk menjelaskan cara kerja di halaman depan. Kalimat tamu
// diambil dari skenario; jawaban dan skor di bawah ini ilustrasi, ditandai
// "Contoh" di layar.
const preview = SCENARIOS[0];

function PreviewCard() {
  return (
    <figure
      aria-label="Contoh tampilan latihan"
      className="space-y-4 rounded-md border border-line bg-surface p-5"
    >
      <figcaption className="text-sm text-muted">
        Contoh: {preview.title}
      </figcaption>
      <div className="space-y-1">
        <p className="text-sm text-muted">
          {preview.guest.name} · emosi 5
        </p>
        <p lang="en" className="rounded-md border border-line px-3 py-2">
          {preview.openingLines.kesal}
        </p>
      </div>
      <div className="space-y-1 text-right">
        <p className="text-sm text-muted">Kamu</p>
        <p
          lang="en"
          className="inline-block rounded-md bg-accent-soft px-3 py-2 text-left"
        >
          I&apos;m so sorry, Mr Henderson. Our technician can be in your room
          within 15 minutes.
        </p>
      </div>
      <EmotionMeter value={3} who="tamu" compact />
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <p className="text-sm text-muted">Rapor · Permintaan maaf</p>
        <p className="font-bold tabular-nums">4/4</p>
      </div>
    </figure>
  );
}

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold leading-[1.1] sm:text-5xl">
            Latihan melayani tamu asing, dengan suara.
          </h1>
          <p className="max-w-prose text-lg text-muted">
            Bicara dalam bahasa Inggris dengan tamu hotel virtual yang punya
            asal, aksen, dan emosi. Setelah selesai, baca rapor pelayananmu:
            skor per kriteria, kutipan ucapanmu sebagai bukti, dan contoh
            kalimat yang lebih baik.
          </p>
          <a
            href="#pilih-situasi"
            className="inline-flex min-h-12 items-center rounded-md bg-accent px-6 text-lg font-bold text-accent-ink hover:opacity-90 active:translate-y-px"
          >
            Pilih situasi latihan
          </a>
        </div>
        <PreviewCard />
      </section>

      <Suspense fallback={null}>
        <CurrentServiceNotice />
      </Suspense>

      <section
        id="pilih-situasi"
        aria-labelledby="pilih-situasi-judul"
        className="scroll-mt-6 space-y-5"
      >
        <h2 id="pilih-situasi-judul" className="text-2xl font-semibold">
          Pilih situasi
        </h2>
        <ol className="divide-y divide-line border-y border-line">
          {SCENARIOS.map((s, i) => (
            <li key={s.id} className="py-7">
              <form
                action={`/latihan/${s.id}`}
                className="grid gap-5 md:grid-cols-[13rem_1fr]"
              >
                <div className="space-y-1">
                  <p className="font-display text-3xl font-semibold tabular-nums text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="font-bold">{s.guest.name}</p>
                  <p className="text-sm text-muted">
                    {s.kind === "interview" ? "Pewawancara" : "Tamu"} dari{" "}
                    {s.guest.origin}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="max-w-prose">{s.situation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Yang dinilai</p>
                    <ul className="mt-1 flex flex-wrap gap-2">
                      {s.criteria.map((c) => (
                        <li
                          key={c.id}
                          className="rounded-md border border-line px-2.5 py-1 text-sm"
                        >
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <fieldset>
                      <legend className="mb-2 text-sm text-muted">
                        Suasana awal{" "}
                        {s.kind === "interview" ? "pewawancara" : "tamu"}
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {MOODS.map((m) => (
                          <label
                            key={m.value}
                            className="flex min-h-11 items-center gap-2 rounded-md border border-edge bg-surface px-3 hover:bg-paper has-[:checked]:border-ink has-[:checked]:font-bold"
                          >
                            <input
                              type="radio"
                              name="mood"
                              value={m.value}
                              defaultChecked={m.value === "kesal"}
                              className="accent-[var(--accent)]"
                            />
                            {m.label}
                            <span className="sr-only">, {m.hint}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <button
                      type="submit"
                      className="min-h-11 rounded-md bg-accent px-5 font-bold text-accent-ink hover:opacity-90 active:translate-y-px"
                    >
                      Mulai situasi ini
                      <span className="sr-only">: {s.title}</span>
                    </button>
                  </div>
                </div>
              </form>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
