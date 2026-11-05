import { errorResponse, ServiceError } from "@/lib/server/env";
import { rateLimit } from "@/lib/server/rate-limit";
import { assessPronunciation, MAX_AUDIO_BYTES } from "@/lib/server/speech";

export async function POST(request: Request) {
  try {
    rateLimit(request, "pron", 200);
    const form = await request.formData();
    const audio = form.get("audio");
    const reference = String(form.get("reference") ?? "").trim();
    if (!(audio instanceof Blob) || audio.size === 0 || !reference) {
      throw new ServiceError("Audio atau teks acuan tidak ditemukan.", 400);
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      throw new ServiceError("Rekaman terlalu panjang.", 413);
    }
    const result = await assessPronunciation(audio, reference.slice(0, 1000));
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
