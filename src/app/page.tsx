import { connection } from "next/server";
import { Suspense } from "react";
import { SCENARIOS, type Mood } from "@/lib/scenarios";
import { serviceStatus } from "@/lib/server/env";
import { ServiceNotice } from "@/components/service-notice";

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

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          Latihan melayani tamu asing, dengan suara.
        </h1>
        <p className="max-w-prose text-lg text-muted">
          Pilih situasi, bicara dengan tamu virtual sampai masalahnya selesai,
          lalu baca rapor pelayanan kamu: skor per kriteria, kutipan ucapanmu
          sebagai bukti, dan contoh kalimat yang lebih baik.
        </p>
      </section>

      <Suspense fallback={null}>
        <CurrentServiceNotice />
      </Suspense>

      <section aria-labelledby="pilih-situasi" className="space-y-4">
        <h2 id="pilih-situasi" className="text-xl font-bold">
          Pilih situasi
        </h2>
        <ol className="divide-y divide-line border-y border-line">
          {SCENARIOS.map((s, i) => (
            <li key={s.id} className="py-6">
              <form action={`/latihan/${s.id}`} className="space-y-4">
                <div className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="pt-0.5 text-2xl font-bold tabular-nums text-muted"
                  >
                    {i + 1}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">{s.title}</h3>
                    <p className="text-sm text-muted">
                      {s.kind === "interview" ? "Pewawancara" : "Tamu"}:{" "}
                      {s.guest.name}, {s.guest.origin}
                    </p>
                    <p className="max-w-prose">{s.situation}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 pl-10 sm:flex-row sm:items-end sm:justify-between">
                  <fieldset>
                    <legend className="mb-2 text-sm text-muted">
                      Suasana awal{" "}
                      {s.kind === "interview" ? "pewawancara" : "tamu"}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map((m) => (
                        <label
                          key={m.value}
                          className="flex min-h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 has-[:checked]:border-ink has-[:checked]:font-bold"
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
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
