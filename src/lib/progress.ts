// Ringkasan perkembangan siswa dari daftar sesi tersimpan. Fungsi murni,
// dipakai halaman latihan dan riwayat.
import { getScenario, ORDERED, type Mood, type Scenario } from "./scenarios";

export type ScoredSession = {
  id: string;
  scenarioId: string;
  mood: Mood;
  total: number;
  max: number;
  createdAt: string;
  criteria: { id: string; score: number }[];
};

export const MOOD_LABEL: Record<Mood, string> = {
  sabar: "Sabar",
  kesal: "Kesal",
  marah: "Marah",
};

export function pct(s: { total: number; max: number }) {
  return s.max ? Math.round((s.total / s.max) * 100) : 0;
}

export type ScenarioProgress = {
  attempts: number;
  best: number;
  max: number;
  bestPct: number;
};

export function progressByScenario(sessions: ScoredSession[]) {
  const out: Record<string, ScenarioProgress> = {};
  for (const s of sessions) {
    const p = out[s.scenarioId];
    if (!p) {
      out[s.scenarioId] = { attempts: 1, best: s.total, max: s.max, bestPct: pct(s) };
    } else {
      p.attempts += 1;
      if (pct(s) > p.bestPct) {
        p.best = s.total;
        p.max = s.max;
        p.bestPct = pct(s);
      }
    }
  }
  return out;
}

/** Rata-rata skor (0-4) per kemampuan, dikelompokkan menurut label kriteria. */
export function skillAverages(sessions: ScoredSession[]) {
  const acc = new Map<string, { sum: number; count: number }>();
  for (const s of sessions) {
    const scenario = getScenario(s.scenarioId);
    for (const c of s.criteria) {
      const label = scenario?.criteria.find((x) => x.id === c.id)?.label;
      if (!label) continue;
      const a = acc.get(label) ?? { sum: 0, count: 0 };
      a.sum += c.score;
      a.count += 1;
      acc.set(label, a);
    }
  }
  return [...acc.entries()]
    .map(([label, a]) => ({ label, avg: a.sum / a.count, count: a.count }))
    .sort((x, y) => y.avg - x.avg);
}

/** Situasi yang disarankan berikutnya: yang belum dicoba, lalu skor terbaik terendah. */
export function recommend(progress: Record<string, ScenarioProgress>): {
  scenario: Scenario;
  reason: string;
} {
  const untried = ORDERED.find((s) => !progress[s.id]);
  if (untried) return { scenario: untried, reason: "Belum pernah kamu coba." };
  const weakest = [...ORDERED].sort(
    (a, b) => progress[a.id].bestPct - progress[b.id].bestPct,
  )[0];
  return {
    scenario: weakest,
    reason: `Skor terbaikmu di sini baru ${progress[weakest.id].bestPct}%.`,
  };
}

// Tingkat skor dari persen (0-100). Batas 50 dan 75 setara rata-rata 2 dan
// 3 dari 4. Warna selalu ditemani label teks, tidak pernah berdiri sendiri.
export type Level = { label: string; bar: string };

export function levelOf(percent: number): Level {
  if (percent >= 75) return { label: "kuat", bar: "bg-good" };
  if (percent >= 50) return { label: "cukup", bar: "bg-warn" };
  return { label: "perlu dilatih", bar: "bg-alert" };
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** Deskripsi skor 4 dari teks rubrik, sebagai gambaran jawaban yang baik. */
export function topLevel(rubric: string) {
  const text = rubric.match(/4:\s*(.*?)\s*3:/)?.[1]?.replace(/\.$/, "") ?? "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
