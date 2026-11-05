import "server-only";
import type { PronunciationResult } from "@/lib/types";
import { azure, ServiceError, stt } from "./env";

export const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

/**
 * Speech-to-Text lewat endpoint kompatibel OpenAI
 * (POST {baseUrl}/audio/transcriptions). Default: Groq Whisper.
 */
export async function transcribe(audio: Blob): Promise<string> {
  if (!stt) {
    throw new ServiceError("Speech-to-Text server belum dikonfigurasi.", 503);
  }
  const form = new FormData();
  form.append("file", audio, "speech.wav");
  form.append("model", stt.model);
  form.append("language", "en");
  form.append("response_format", "json");

  const res = await fetch(`${stt.baseUrl}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${stt.apiKey}` },
    body: form,
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    console.error("STT", res.status, await res.text());
    throw new ServiceError(
      "Suara tidak bisa diubah jadi teks saat ini. Coba lagi atau pakai mode ketik.",
      502,
    );
  }
  const data = await res.json();
  return String(data.text ?? "").trim();
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Text-to-Speech lewat Azure Neural TTS. Mengembalikan MP3. */
export async function synthesize(
  text: string,
  voice: string,
  locale: string,
  emotion: number,
): Promise<ArrayBuffer> {
  if (!azure.key || !azure.region) {
    throw new ServiceError("Azure TTS belum dikonfigurasi.", 503);
  }
  // Emosi tamu mengubah tempo dan nada supaya marah dan tenang terdengar beda.
  const prosody =
    emotion >= 7
      ? { rate: "+8%", pitch: "+4%" }
      : emotion <= 3
        ? { rate: "-4%", pitch: "-2%" }
        : { rate: "+0%", pitch: "+0%" };
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}"><voice name="${voice}"><prosody rate="${prosody.rate}" pitch="${prosody.pitch}">${escapeXml(text)}</prosody></voice></speak>`;
  const res = await fetch(
    `https://${azure.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azure.key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "reharsa",
      },
      body: ssml,
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!res.ok) {
    console.error("Azure TTS", res.status, await res.text());
    throw new ServiceError("Suara tamu tidak tersedia saat ini.", 502);
  }
  return res.arrayBuffer();
}

type AzureWord = {
  Word: string;
  AccuracyScore?: number;
  ErrorType?: string;
  PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
};

/**
 * Pronunciation Assessment Azure (REST, audio pendek). Audio harus WAV PCM
 * 16 kHz mono. Teks acuan = hasil transkripsi kalimat siswa (penilaian
 * tanpa naskah), jadi yang diukur adalah kejelasan kata yang diucapkan.
 */
export async function assessPronunciation(
  wav: Blob,
  referenceText: string,
): Promise<PronunciationResult> {
  if (!azure.key || !azure.region) {
    throw new ServiceError("Penilaian pengucapan belum dikonfigurasi.", 503);
  }
  const config = {
    ReferenceText: referenceText,
    GradingSystem: "HundredMark",
    Granularity: "Word",
    Dimension: "Comprehensive",
    EnableMiscue: false,
  };
  const header = Buffer.from(JSON.stringify(config), "utf8").toString("base64");

  const res = await fetch(
    `https://${azure.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azure.key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Pronunciation-Assessment": header,
        Accept: "application/json",
      },
      body: wav,
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!res.ok) {
    console.error("Azure PA", res.status, await res.text());
    throw new ServiceError("Penilaian pengucapan gagal untuk kalimat ini.", 502);
  }
  const data = await res.json();
  const best = data.NBest?.[0];
  if (!best) {
    throw new ServiceError("Suara terlalu pendek untuk dinilai.", 422);
  }
  const pa = best.PronunciationAssessment ?? best;
  const words: AzureWord[] = best.Words ?? [];

  return {
    accuracy: Math.round(pa.AccuracyScore ?? 0),
    fluency: Math.round(pa.FluencyScore ?? 0),
    completeness: Math.round(pa.CompletenessScore ?? 0),
    words: words.map((w) => ({
      word: w.Word,
      accuracy: Math.round(
        w.PronunciationAssessment?.AccuracyScore ?? w.AccuracyScore ?? 0,
      ),
      errorType: w.PronunciationAssessment?.ErrorType ?? w.ErrorType ?? "None",
    })),
  };
}
