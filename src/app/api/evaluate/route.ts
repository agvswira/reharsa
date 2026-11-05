import { z } from "zod";
import { coach, evaluate } from "@/lib/server/agents";
import { errorResponse, ServiceError } from "@/lib/server/env";
import { rateLimit } from "@/lib/server/rate-limit";
import { getScenario, MAX_STUDENT_TURNS } from "@/lib/scenarios";
import { TurnSchema } from "@/lib/types";

const BodySchema = z.object({
  scenarioId: z.string(),
  turns: z.array(TurnSchema).min(2).max(MAX_STUDENT_TURNS * 2 + 2),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, "evaluate", 30);
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

    return Response.json({
      evaluation: evaluation.data,
      coaching: coaching.data,
      providers: { evaluator: evaluation.provider, coach: coaching.provider },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
