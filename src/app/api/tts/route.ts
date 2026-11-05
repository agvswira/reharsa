import { z } from "zod";
import { errorResponse, ServiceError } from "@/lib/server/env";
import { rateLimit } from "@/lib/server/rate-limit";
import { synthesize } from "@/lib/server/speech";
import { getScenario } from "@/lib/scenarios";
import { requireUser } from "@/lib/server/auth";

const BodySchema = z.object({
  scenarioId: z.string(),
  text: z.string().min(1).max(800),
  emotion: z.number().min(0).max(10).default(5),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, "tts", 200);
    await requireUser(request);
    const body = BodySchema.safeParse(await request.json());
    if (!body.success) throw new ServiceError("Permintaan tidak valid.", 400);
    const scenario = getScenario(body.data.scenarioId);
    if (!scenario) throw new ServiceError("Skenario tidak ditemukan.", 404);

    const audio = await synthesize(
      body.data.text,
      scenario.guest.azureVoice,
      scenario.guest.locale,
      body.data.emotion,
    );
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
