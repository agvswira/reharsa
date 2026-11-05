import {
  channelLabel,
  GROUPS,
  ORDERED,
  SCENARIOS,
  type Mood,
} from "@/lib/scenarios";

const MOODS: { value: Mood; label: string; hint: string }[] = [
  { value: "sabar", label: "Sabar", hint: "mulai tenang" },
  { value: "kesal", label: "Kesal", hint: "mulai jengkel" },
  { value: "marah", label: "Marah", hint: "mulai emosi tinggi" },
];

/** Daftar situasi per kategori, masing-masing dengan pilihan suasana awal. */
export function ScenarioPicker() {
  return (
    <div className="space-y-12">
      {GROUPS.map((g) => (
        <section
          key={g.category}
          aria-labelledby={`grup-${g.category}`}
          className="space-y-3"
        >
          <div className="space-y-1">
            <h2
              id={`grup-${g.category}`}
              className="font-display text-2xl font-semibold"
            >
              {g.title}
            </h2>
            <p className="max-w-prose text-muted">{g.note}</p>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {SCENARIOS.filter((s) => s.category === g.category).map((s) => (
              <li key={s.id} className="py-7">
                <form
                  action={`/latihan/${s.id}`}
                  className="grid gap-5 md:grid-cols-[13rem_1fr]"
                >
                  <div className="space-y-1">
                    <p className="font-display text-3xl font-semibold tabular-nums text-muted">
                      {String(ORDERED.indexOf(s) + 1).padStart(2, "0")}
                    </p>
                    <p className="font-bold">{s.guest.name}</p>
                    <p className="text-sm text-muted">
                      {s.kind === "interview" ? "Pewawancara" : "Tamu"} dari{" "}
                      {s.guest.origin}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted">
                        {s.department} · {channelLabel(s)}
                      </p>
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
                              className="flex min-h-11 items-center gap-2 rounded-full border border-edge bg-surface px-3 hover:bg-paper has-[:checked]:border-ink has-[:checked]:font-bold"
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
                        className="min-h-11 rounded-full bg-accent px-5 font-bold text-accent-ink hover:opacity-90 active:translate-y-px"
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
      ))}
    </div>
  );
}
