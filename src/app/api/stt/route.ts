import { errorResponse, ServiceError } from "@/lib/server/env";
import { rateLimit } from "@/lib/server/rate-limit";
import { MAX_AUDIO_BYTES, transcribe } from "@/lib/server/speech";

export async function POST(request: Request) {
  try {
    rateLimit(request, "stt", 200);
    const form = await request.formData();
    const audio = form.get("audio");
    if (!(audio instanceof Blob) || audio.size === 0) {
      throw new ServiceError("Audio tidak ditemukan.", 400);
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      throw new ServiceError("Rekaman terlalu panjang. Maksimal sekitar 60 detik.", 413);
    }
    const text = await transcribe(audio);
    return Response.json({ text });
  } catch (err) {
    return errorResponse(err);
  }
}
