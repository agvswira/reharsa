import { z } from "zod";
import { guestTurn } from "@/lib/server/agents";
import { errorResponse, ServiceError } from "@/lib/server/env";
import { rateLimit } from "@/lib/server/rate-limit";
import { getScenario, MAX_STUDENT_TURNS } from "@/lib/scenarios";
import { TurnSchema } from "@/lib/types";

const BodySchema = z.object({
  scenarioId: z.string(),
  emotion: z.number().min(0).max(10),
  turns: z.array(TurnSchema).min(2).max(MAX_STUDENT_TURNS * 2 + 2),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, "guest", 200);
    const body = BodySchema.safeParse(await request.json());
    if (!body.success) throw new ServiceError("Permintaan tidak valid.", 400);

    const scenario = getScenario(body.data.scenarioId);
    if (!scenario) throw new ServiceError("Skenario tidak ditemukan.", 404);

    const last = body.data.turns.at(-1);
    if (last?.speaker !== "student") {
      throw new ServiceError("Giliran terakhir harus dari kamu.", 400);
    }

    const { data, provider } = await guestTurn(
      scenario,
      body.data.turns,
      body.data.emotion,
    );
    return Response.json({ ...data, provider });
  } catch (err) {
    return errorResponse(err);
  }
}
