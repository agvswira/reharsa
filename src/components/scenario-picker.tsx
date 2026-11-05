import { GuestAvatar } from "@/components/guest-avatar";
import { levelOf, MOOD_LABEL, type ScenarioProgress } from "@/lib/progress";
import { sectionTitle } from "@/lib/ui";
import {
  channelLabel,
  GROUPS,
  SCENARIOS,
  type Mood,
  type Scenario,
} from "@/lib/scenarios";

const MOODS: { value: Mood; hint: string }[] = [
  { value: "sabar", hint: "mulai tenang" },
  { value: "kesal", hint: "mulai jengkel" },
  { value: "marah", hint: "mulai emosi tinggi" },
];

/** Pilihan suasana awal sebagai kontrol bersegmen; tetap radio asli. */
export function MoodField({ scenario }: { scenario: Scenario }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-muted">
        Suasana awal {scenario.kind === "interview" ? "pewawancara" : "tamu"}
      </legend>
      <div className="grid grid-cols-3 gap-1 rounded-full border border-line-2 p-1">
        {MOODS.map((m) => (
          <label
            key={m.value}
            className="flex min-h-10 cursor-pointer items-center justify-center rounded-full text-sm text-muted hover:text-ink has-[:checked]:bg-ink has-[:checked]:font-bold has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
          >
            <input
              type="radio"
              name="mood"
              value={m.value}
              defaultChecked={m.value === "kesal"}
              className="sr-only"
            />
            {MOOD_LABEL[m.value]}
            <span className="sr-only">, {m.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Skor terbaik di satu situasi, atau keterangan belum dicoba. */
export function BestScore({ progress }: { progress?: ScenarioProgress }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted">
          {progress
            ? `Skor terbaik dari ${progress.attempts}x latihan`
            : "Belum pernah dicoba"}
        </span>
        <span className="font-semibold tabular-nums">
          {progress
            ? `${progress.best}/${progress.max}, ${levelOf(progress.bestPct).label}`
            : ""}
        </span>
      </div>
      <span
        aria-hidden="true"
        className="block h-1.5 overflow-hidden rounded-full bg-track"
      >
        <span
          className={`block h-full rounded-full ${levelOf(progress?.bestPct ?? 0).bar}`}
          style={{ width: `${progress?.bestPct ?? 0}%` }}
        />
      </span>
    </div>
  );
}

/**
 * Daftar situasi per kategori. Kartu sengaja seragam: semuanya setara di
 * katalog; yang membedakan adalah skor terbaik siswa dan kartu saran di atas.
 */
export function ScenarioPicker({
  progress,
}: {
  progress: Record<string, ScenarioProgress>;
}) {
  return (
    <div className="space-y-14">
      {GROUPS.map((g) => {
        const list = SCENARIOS.filter((s) => s.category === g.category);
        const done = list.filter((s) => progress[s.id]).length;
        return (
          <section
            key={g.category}
            id={`grup-${g.category}`}
            aria-labelledby={`grup-${g.category}-judul`}
            className="scroll-mt-24 space-y-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="space-y-1">
                <h2
                  id={`grup-${g.category}-judul`}
                  className={sectionTitle}
                >
                  {g.title}
                </h2>
                <p className="text-muted">{g.note}</p>
              </div>
              <p className="text-sm text-muted tabular-nums">
                {done} dari {list.length} sudah dicoba
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((s) => (
                <li key={s.id}>
                  <form
                    action={`/latihan/${s.id}`}
                    className="card flex h-full flex-col gap-5 p-5 transition-colors hover:border-edge"
                  >
                    <div className="space-y-2">
                      <p className="text-sm text-muted">
                        {s.department} · {channelLabel(s)}
                      </p>
                      <h3 className="text-lg font-semibold leading-snug">
                        {s.title}
                      </h3>
                      <p className="line-clamp-3 text-sm text-muted">
                        {s.situation}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <GuestAvatar scenario={s} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{s.guest.name}</p>
                        <p className="text-sm text-muted">
                          {s.kind === "interview" ? "Pewawancara" : "Tamu"} dari{" "}
                          {s.guest.origin}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto space-y-4">
                      <BestScore progress={progress[s.id]} />
                      <MoodField scenario={s} />
                      <button
                        type="submit"
                        className="min-h-11 w-full rounded-full bg-accent px-5 font-bold text-accent-ink hover:opacity-90 active:translate-y-px"
                      >
                        {progress[s.id] ? "Latih lagi" : "Mulai situasi ini"}
                        <span className="sr-only">: {s.title}</span>
                      </button>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
