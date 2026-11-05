import { z } from "zod";
import { coach, evaluate } from "@/lib/server/agents";
import { requireUser } from "@/lib/server/auth";
import { errorResponse, ServiceError } from "@/lib/server/env";
import { saveSession } from "@/lib/server/history";
import { rateLimit } from "@/lib/server/rate-limit";
import { getScenario, MAX_STUDENT_TURNS, MOOD_START } from "@/lib/scenarios";
import { PronunciationResultSchema, TurnSchema } from "@/lib/types";

// Penilai dan pelatih berjalan berurutan, dan bisa pindah ke penyedia
// cadangan; satu rapor bisa memakan lebih dari 15 detik.
export const maxDuration = 60;

const BodySchema = z.object({
  scenarioId: z.string(),
  mood: z.enum(Object.keys(MOOD_START) as ["sabar", "kesal", "marah"]),
  turns: z.array(TurnSchema).min(2).max(MAX_STUDENT_TURNS * 2 + 2),
  pronunciation: z.array(PronunciationResultSchema).max(MAX_STUDENT_TURNS).default([]),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, "evaluate", 30);
    const user = await requireUser(request);
    const body = BodySchema.safeParse(await request.json());
    if (!body.success) throw new ServiceError("Permintaan tidak valid.", 400);
    const scenario = getScenario(body.data.scenarioId);
    if (!scenario) throw new ServiceError("Skenario tidak ditemukan.", 404);

    if (!body.data.turns.some((t) => t.speaker === "student")) {
      throw new ServiceError("Belum ada jawaban kamu untuk dinilai.", 400);
    }

    // Penilai dan coach adalah dua agen terpisah; dijalankan paralel.
    const [evaluation, coaching] = await Promise.all([
      evaluate(scenario, body.data.turns),
      coach(scenario, body.data.turns),
    ]);

    // Rapor disimpan ke riwayat pemiliknya. Gagal menyimpan tidak boleh
    // menggagalkan rapor, jadi errornya hanya dicatat.
    let savedId: string | null = null;
    try {
      const total = evaluation.data.criteria.reduce((s, c) => s + c.score, 0);
      savedId = await saveSession(user.id, {
        scenarioId: scenario.id,
        mood: body.data.mood,
        total,
        max: scenario.criteria.length * 4,
        turns: body.data.turns,
        evaluation: evaluation.data,
        coaching: coaching.data,
        pronunciation: body.data.pronunciation,
      });
    } catch (err) {
      console.error("Gagal menyimpan riwayat:", err);
    }

    return Response.json({
      evaluation: evaluation.data,
      coaching: coaching.data,
      providers: { evaluator: evaluation.provider, coach: coaching.provider },
      saved: { id: savedId },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
