import "server-only";
import type { z } from "zod";
import {
  providerOrder,
  ServiceError,
  type Agent,
  type LlmProvider,
} from "./env";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const TIMEOUT_MS = 20_000;
const DEFAULT_COOLDOWN_MS = 60_000;

// Provider yang baru kena limit dilewati sampai waktu ini, supaya permintaan
// berikutnya tidak membuang waktu menunggu penolakan yang sama.
const coolingUntil = new Map<string, number>();

class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterMs?: number,
  ) {
    super(message);
  }
}

async function chat(
  p: LlmProvider,
  messages: ChatMessage[],
  temperature: number,
): Promise<string> {
  const res = await fetch(`${p.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${p.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: p.model,
      messages,
      temperature,
      ...(p.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const retryAfter = Number(res.headers.get("retry-after"));
    throw new ProviderError(
      `${res.status}: ${(await res.text()).slice(0, 300)}`,
      res.status,
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : undefined,
    );
  }
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content ?? "");
}

// Sebagian model membungkus JSON dengan ```json atau teks lain; ambil objeknya.
function extractJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("bukan JSON");
    return JSON.parse(raw.slice(start, end + 1));
  }
}

/**
 * Panggil LLM untuk satu agen dan validasi JSON-nya dengan skema Zod.
 * Provider dicoba sesuai urutan agen. Gagal jaringan atau kena limit
 * langsung pindah ke provider berikutnya; JSON tidak valid dicoba ulang
 * sekali di provider yang sama dulu.
 */
export async function callJSON<T>(
  agent: Agent,
  messages: ChatMessage[],
  schema: z.ZodType<T>,
  temperature = 0.4,
): Promise<{ data: T; provider: string }> {
  const order = providerOrder(agent);
  if (order.length === 0) {
    // Detail konfigurasi hanya untuk log pengembang, bukan untuk layar siswa.
    console.error(
      `Layanan AI belum dikonfigurasi: isi ${agent === "guest" ? "GUEST_LLM_ORDER" : "JUDGE_LLM_ORDER"} dan key provider-nya di .env.local.`,
    );
    throw new ServiceError(
      "Latihan sedang tidak bisa dipakai. Coba lagi beberapa saat lagi.",
      503,
    );
  }

  const now = Date.now();
  const ready = order.filter((p) => (coolingUntil.get(p.name) ?? 0) <= now);
  // Kalau semua sedang jeda, tetap coba semuanya: limit mungkin sudah pulih.
  const candidates = ready.length > 0 ? ready : order;

  const failures: string[] = [];
  for (const p of candidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let raw: string;
      try {
        raw = await chat(p, messages, temperature);
      } catch (err) {
        if (err instanceof ProviderError && (err.status === 429 || err.status >= 500)) {
          coolingUntil.set(
            p.name,
            Date.now() + (err.retryAfterMs ?? DEFAULT_COOLDOWN_MS),
          );
        }
        failures.push(`${p.name}: ${(err as Error).message}`);
        break;
      }
      let json: unknown;
      try {
        json = extractJson(raw);
      } catch {
        failures.push(`${p.name}: bukan JSON`);
        continue;
      }
      const parsed = schema.safeParse(json);
      if (parsed.success) {
        coolingUntil.delete(p.name);
        return { data: parsed.data, provider: `${p.name} (${p.model})` };
      }
      failures.push(`${p.name}: output tidak sesuai skema`);
    }
  }
  console.error(`Semua provider untuk agen ${agent} gagal:`, failures);
  throw new ServiceError(
    "Sistem sedang sibuk dan belum bisa menjawab. Coba lagi sebentar.",
    502,
  );
}
