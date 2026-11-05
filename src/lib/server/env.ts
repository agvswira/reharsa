import "server-only";
import type { ServiceStatus } from "@/lib/types";

/**
 * Semua konfigurasi layanan dibaca dari env; tidak ada URL, model, atau
 * urutan bawaan di kode.
 *
 * LLM: GUEST_LLM_ORDER dan JUDGE_LLM_ORDER berisi nama provider dipisah koma.
 * Setiap nama, misalnya GROQ, dibaca dari GROQ_BASE_URL, GROQ_MODEL,
 * GROQ_API_KEY, dan opsional GROQ_JSON_MODE=false. Endpoint harus kompatibel
 * OpenAI ({BASE_URL}/chat/completions).
 */
export type LlmProvider = {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  // Kirim response_format json_object. Matikan untuk provider yang menolaknya.
  jsonMode: boolean;
};

export type SttProvider = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type Agent = "guest" | "judge";

function read(name: string) {
  return (process.env[name] ?? "").trim();
}

function stripSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function names(variable: string) {
  return read(variable)
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function loadProvider(name: string): LlmProvider | null {
  const baseUrl = read(`${name}_BASE_URL`);
  const apiKey = read(`${name}_API_KEY`);
  const model = read(`${name}_MODEL`);
  // Provider tanpa key dianggap belum aktif dan dilewati.
  if (!baseUrl || !apiKey || !model) return null;
  return {
    name: name.toLowerCase(),
    baseUrl: stripSlash(baseUrl),
    apiKey,
    model,
    jsonMode: read(`${name}_JSON_MODE`).toLowerCase() !== "false",
  };
}

function loadOrder(variable: string): LlmProvider[] {
  return names(variable).flatMap((n) => loadProvider(n) ?? []);
}

const orders: Record<Agent, LlmProvider[]> = {
  guest: loadOrder("GUEST_LLM_ORDER"),
  judge: loadOrder("JUDGE_LLM_ORDER"),
};

export function providerOrder(agent: Agent): LlmProvider[] {
  return orders[agent];
}

function loadStt(): SttProvider | null {
  const baseUrl = read("STT_BASE_URL");
  const apiKey = read("STT_API_KEY");
  const model = read("STT_MODEL");
  if (!baseUrl || !apiKey || !model) return null;
  return { baseUrl: stripSlash(baseUrl), apiKey, model };
}

export const stt = loadStt();

export const azure = {
  key: read("AZURE_SPEECH_KEY"),
  region: read("AZURE_SPEECH_REGION"),
};

export function serviceStatus(): ServiceStatus {
  const active = new Set(
    [...orders.guest, ...orders.judge].map((p) => p.name),
  );
  return {
    llm: active.size,
    stt: stt !== null,
    azure: azure.key !== "" && azure.region !== "",
  };
}

export class ServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof ServiceError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json(
    { error: "Terjadi kesalahan di server. Coba lagi." },
    { status: 500 },
  );
}
