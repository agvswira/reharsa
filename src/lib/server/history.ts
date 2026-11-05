import "server-only";
import type { Mood } from "@/lib/scenarios";
import type {
  Coaching,
  Evaluation,
  PronunciationResult,
  Turn,
} from "@/lib/types";
import { pool } from "./db";

export type SavedSession = {
  id: string;
  scenarioId: string;
  mood: Mood;
  total: number;
  max: number;
  turns: Turn[];
  evaluation: Evaluation;
  coaching: Coaching;
  pronunciation: PronunciationResult[];
  createdAt: string;
};

export type SessionSummary = Pick<
  SavedSession,
  "id" | "scenarioId" | "mood" | "total" | "max" | "createdAt"
>;

export async function saveSession(
  userId: string,
  s: Omit<SavedSession, "id" | "createdAt">,
): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into practice_session
       (user_id, scenario_id, mood, total, max, turns, evaluation, coaching, pronunciation)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning id`,
    [
      userId,
      s.scenarioId,
      s.mood,
      s.total,
      s.max,
      JSON.stringify(s.turns),
      JSON.stringify(s.evaluation),
      JSON.stringify(s.coaching),
      JSON.stringify(s.pronunciation),
    ],
  );
  return rows[0].id;
}

export async function listSessions(userId: string): Promise<SessionSummary[]> {
  const { rows } = await pool.query(
    `select id, scenario_id, mood, total, max, created_at
       from practice_session
      where user_id = $1
      order by created_at desc
      limit 100`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    scenarioId: r.scenario_id,
    mood: r.mood,
    total: r.total,
    max: r.max,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

// Selalu memfilter dengan user_id: siswa hanya bisa membuka rapornya sendiri.
export async function getSession(
  userId: string,
  id: string,
): Promise<SavedSession | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { rows } = await pool.query(
    `select * from practice_session where id = $1 and user_id = $2`,
    [id, userId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    scenarioId: r.scenario_id,
    mood: r.mood,
    total: r.total,
    max: r.max,
    turns: r.turns,
    evaluation: r.evaluation,
    coaching: r.coaching,
    pronunciation: r.pronunciation,
    createdAt: new Date(r.created_at).toISOString(),
  };
}
